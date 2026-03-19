import z from "zod";
import { MIN_PASSWORD_LENGTH } from "../../../config";

export const signInSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type SignInDto = z.infer<typeof signInSchema>;
