import z from "zod";
import { ErrorIds, MIN_PASSWORD_LENGTH } from "../../../config";

export const signUpSchema = z
  .object({
    email: z.email(ErrorIds.WRONG_EMAIL_FORMAT),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, ErrorIds.WRONG_PASSWORD_LENGTH),
    confirmPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, ErrorIds.WRONG_PASSWORD_LENGTH),
  })
  .refine((data) => data.password === data.confirmPassword);

export type SignUpDto = z.infer<typeof signUpSchema>;
