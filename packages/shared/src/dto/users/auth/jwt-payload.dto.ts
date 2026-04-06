import z from "zod";

export const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.email(),
});

export type JwtPayloadDto = z.infer<typeof jwtPayloadSchema>;
