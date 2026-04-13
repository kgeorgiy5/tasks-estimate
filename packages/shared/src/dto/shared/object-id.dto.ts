import z from "zod";
import { ErrorIds, OBJECT_ID_REGEX } from "../../config";

export const objectIdSchema = z.union([
  z
    .instanceof(Object)
    .pipe(z.coerce.string())
    .refine((id) => OBJECT_ID_REGEX.test(id), {
      error: ErrorIds.WRONG_OBJECT_ID_FORMAT,
    }),
  z.string().regex(OBJECT_ID_REGEX, {
    error: ErrorIds.WRONG_OBJECT_ID_FORMAT,
  }),
]);

export type ObjectIdDto = z.infer<typeof objectIdSchema>;
