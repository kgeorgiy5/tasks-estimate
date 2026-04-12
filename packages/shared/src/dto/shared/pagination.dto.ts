import z from "zod";

/**
 * Accept query params as strings and coerce them to numbers when possible.
 * This allows controllers that receive query parameters to validate numeric
 * values even when they arrive as strings (e.g. ?offset=10&limit=20).
 */
export const paginationRequestSchema = z.object({
  offset: z
    .preprocess((val) => {
      if (typeof val === "string") {
        if (val.trim() === "") return undefined;
        const n = Number(val);
        return Number.isNaN(n) ? val : n;
      }
      return val;
    }, z.number().int().nonnegative())
    .optional()
    .default(0),
  limit: z
    .preprocess((val) => {
      if (typeof val === "string") {
        if (val.trim() === "") return undefined;
        const n = Number(val);
        return Number.isNaN(n) ? val : n;
      }
      return val;
    }, z.number().int().positive().max(200))
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
