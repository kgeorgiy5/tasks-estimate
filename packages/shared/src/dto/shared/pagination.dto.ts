import z from "zod";

export const paginationRequestSchema = z.object({
  offset: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(0),
  limit: z
    .number()
    .int()
    .positive()
    .max(200)
    .optional()
    .default(20),
});

export type PaginationRequestDto = z.infer<typeof paginationRequestSchema>;

export type PaginationResponseDto<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
};
