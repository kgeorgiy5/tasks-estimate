import { z } from "zod";
import { ErrorIds, MIN_PASSWORD_LENGTH } from "../../config";

export const createUserSchema = z.object({
  email: z.email(ErrorIds.WRONG_EMAIL_FORMAT),
  password: z.string().min(MIN_PASSWORD_LENGTH, ErrorIds.WRONG_PASSWORD_LENGTH),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
