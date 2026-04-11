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

Structure: `ManageTaskDto` (from `@tasks-estimate/shared`), validated with `ZodValidationPipe`.

Response

200:

```json
{ /* created task */ }
```

Notes: Auth required.

### POST /tasks/bulk

Payload

Body:

Structure: `ManageTaskDto[]` (array), no explicit validation schema in controller besides pipe usage for single-task endpoints.

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

---

## Implementation notes

- Controller prefixes are built with `PathsUtil.buildPath(...)` from `@tasks-estimate/shared` (see `packages/shared/src/utils/paths.util.ts`).
- Nested controllers (for example `AuthModuleController`) compose prefixes: `AuthModuleController()` -> `users/auth`.
- Validation is applied using `ZodValidationPipe` where present; authentication is applied via `AuthGuard` on the `TasksController`.

If you want, I can expand each endpoint with full request/response schemas copied from the DTOs in `@tasks-estimate/shared`.

