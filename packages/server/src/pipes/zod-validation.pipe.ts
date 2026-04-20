import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { ErrorIds } from "@tasks-estimate/shared";
import { ZodError, ZodObject, ZodOptional } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodObject<any> | ZodOptional<any>) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      this.schema.parse(value);
    } catch (error: unknown) {
      if (!error) {
        throw new BadRequestException(ErrorIds.GENERIC_BAD_REQUEST);
      }

      if (error instanceof ZodError) {
        throw new BadRequestException([
          ...new Set(error._zod.def.map((err) => err.message)),
        ]);
      }

      throw new BadRequestException(ErrorIds.GENERIC_BAD_REQUEST);
    }
    return value;
  }
}
