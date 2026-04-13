# API Endpoints

This document lists the server endpoints discovered under `packages/server/src`.
Each entry follows the repository style: payload (params/query/body) and response notes. Nested controllers and module prefixes are expanded.

---

## GET /

### Payload

Params:

- none

Query:

- none

Body:

- none

### Response

200:

```json
"string"
```

Notes: Implemented in [src/app.controller.ts](src/app.controller.ts#L1).

---

## Users

### GET /users/list

Payload

Params:

- none

Query:

- none

Body:

- none

Response

200:

```json
[] // array of users (see shared DTOs / models)
```

Notes: Implemented in [src/modules/users/users.controller.ts](src/modules/users/users.controller.ts#L1). Returns list of users.

### POST /users/create

Payload

Params:

- none

Query:

- none

Body:

Structure: `CreateUserDto` (from `@tasks-estimate/shared`), validated with `ZodValidationPipe`.

Example:

```json
{
  "email": "user@example.com",
  "password": "...",
  "name": "User Name"
}
```

Response

200:

```json
{ /* created user */ }
```

Notes: See [src/modules/users/users.controller.ts](src/modules/users/users.controller.ts#L1).

### GET /users/email/:email

Payload

Params:

- `email`: string

Query:

- none

Body:

- none

Response

200:

```json
{ /* user */ }
```

Notes: Implemented in [src/modules/users/users.controller.ts](src/modules/users/users.controller.ts#L1).

### GET /users/id/:id

Payload

Params:

- `id`: string (Mongo ObjectId)

Query:

- none

Body:

- none

Response

200:

```json
{ /* user */ }
```

Notes: Implemented in [src/modules/users/users.controller.ts](src/modules/users/users.controller.ts#L1).

---

## Auth (nested under users)

Controller prefix: `/users/auth` (AuthModuleController -> UsersModuleController)

### POST /users/auth/sign-in

Payload

Params:

- none

Query:

- none

Body:

Structure: `SignInDto` (from `@tasks-estimate/shared`), validated with `ZodValidationPipe`.

Example:

```json
{
  "email": "user@example.com",
  "password": "..."
}
```

Response

200:

```json
{ /* auth tokens / session */ }
```

Notes: Implemented in [src/modules/users/modules/auth/auth.controller.ts](src/modules/users/modules/auth/auth.controller.ts#L1).

### POST /users/auth/sign-up

Payload

Params:

- none

Query:

- none

Body:

Structure: `SignUpDto` (from `@tasks-estimate/shared`), validated with `ZodValidationPipe`.

Response

200:

```json
{ /* created user / auth info */ }
```

Notes: Implemented in [src/modules/users/modules/auth/auth.controller.ts](src/modules/users/modules/auth/auth.controller.ts#L1).

---

## Roles (under /users/roles)

Controller prefix: `/users/roles`

Notes: `RolesController` exists ([src/modules/users/modules/roles/roles.controller.ts](src/modules/users/modules/roles/roles.controller.ts#L1)) but currently exposes no routes.

---

## Tasks (guarded)

Controller prefix: `/tasks` (controller uses `AuthGuard` via `@UseGuards(AuthGuard)`)

### GET /tasks

Payload

Params:

- none

Query:

- none

Body:

- none

Response

200:

```json
[] // array of tasks for authenticated user
```

Notes: Implemented in [src/modules/tasks/tasks.controller.ts](src/modules/tasks/tasks.controller.ts#L1). Requires authentication (AuthGuard).

### POST /tasks

Payload

Params:

- none

Query:

- none

Body:

Structure: `CreateTaskDto` (from `@tasks-estimate/shared`), validated with `ZodValidationPipe`.

Description: Creates a new task and immediately starts a running task entry for it (the created task entry has a `startDateTime` set and no `endDateTime`). This models a timer that is already started on creation.

Response

200:

```json
{ /* created task */ }
```

Notes: Auth required. Implemented in [src/modules/tasks/tasks.controller.ts](src/modules/tasks/tasks.controller.ts#L1).

### POST /tasks/bulk

Payload

Body:

Structure: `ManageTaskDto[]` (array).

Description: Creates multiple tasks. For each created task an initial task entry is seeded containing the assigned `timeSeconds` (or `0` if not provided). These initial entries are created as completed entries (have both `startDateTime` and `endDateTime` set), representing pre-assigned time rather than a running timer.

Response

200:

```json
[ /* created tasks */ ]
```

Notes: Auth required.

### PUT /tasks/:id

Payload

Params:

- `id`: string (Mongo ObjectId)

Body:

Structure: `ManageTaskDto` (from `@tasks-estimate/shared`), validated with `ZodValidationPipe`.

Description: Updates task metadata. If `timeSeconds` is provided in the payload, an additional completed task entry is appended to the task representing that assigned time (entry has both `startDateTime` and `endDateTime` set to the update time).

Response

200:

```json
{ /* updated task */ }
```

Notes: Auth required.

### DELETE /tasks/:id

Payload

Params:

- `id`: string (Mongo ObjectId)

Response

200:

```json
{ /* deletion result */ }
```

Notes: Auth required. Implemented in [src/modules/tasks/tasks.controller.ts](src/modules/tasks/tasks.controller.ts#L1).

### POST /tasks/:id/entries/start

Payload

Params:

- `id`: string (Mongo ObjectId) — task id

Body:

- none

Description: Starts a running task entry (timer) for the specified task. Creates a `TaskEntry` with `startDateTime` and no `endDateTime`. If an active running entry already exists for the same user and task, the call will fail.

Response

200:

```json
{ /* created task entry */ }
```

Notes: Auth required. Implemented in [src/modules/tasks/tasks.controller.ts](src/modules/tasks/tasks.controller.ts#L1).

### POST /tasks/:id/entries/end

Payload

Params:

- `id`: string (Mongo ObjectId) — task id

Body:

- none

Description: Ends the active running task entry for the specified task. Calculates the duration in seconds, sets `endDateTime` and `timeSeconds` on the entry, and persists it. After ending, the task classification hook is triggered to populate `classIds` if needed.

Response

200:

```json
{ /* updated task entry */ }
```

Notes: Auth required. Implemented in [src/modules/tasks/tasks.controller.ts](src/modules/tasks/tasks.controller.ts#L1).

---

## Implementation notes

- Controller prefixes are built with `PathsUtil.buildPath(...)` from `@tasks-estimate/shared` (see `packages/shared/src/utils/paths.util.ts`).
- Nested controllers (for example `AuthModuleController`) compose prefixes: `AuthModuleController()` -> `users/auth`.
- Validation is applied using `ZodValidationPipe` where present; authentication is applied via `AuthGuard` on the `TasksController`.

If you want, I can expand each endpoint with full request/response schemas copied from the DTOs in `@tasks-estimate/shared`.

