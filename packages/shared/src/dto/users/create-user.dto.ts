import { z } from "zod";
import { ErrorIds } from "../../config";

export const createUserSchema = z.object({
  email: z.email(ErrorIds.WRONG_EMAIL_FORMAT),
  password: z.string().min(6, ErrorIds.WRONG_PASSWORD_LENGTH),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
