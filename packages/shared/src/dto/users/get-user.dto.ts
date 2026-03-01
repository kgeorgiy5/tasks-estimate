import z from "zod";
import { objectIdSchema } from "../shared";
import { ErrorIds } from "../../config";

export const getUserSchema = z.object({
  _id: objectIdSchema,
  email: z.email(ErrorIds.WRONG_EMAIL_FORMAT),
});

export type GetUserDto = z.infer<typeof getUserSchema>;
