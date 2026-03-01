import z from "zod";

export const errorSchema = z.object({
  statusCode: z.number(),
  message: z.string().or(z.array(z.string())),
  error: z.string(),
});

export type ErrorDto = z.infer<typeof errorSchema>;
