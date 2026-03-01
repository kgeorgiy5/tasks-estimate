import z from "zod";
import { getUserSchema } from "./get-user.dto";
import { ErrorIds } from "../../config";

export const listUsersSchema = z.array(getUserSchema, {
  error: ErrorIds.WRONG_USER_LIST_FORMAT,
});

export type ListUsersDto = z.infer<typeof listUsersSchema>;
