import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

import type { ApiError } from '@repo/contracts';

/** Valida una parte de la petición contra un esquema de `@repo/contracts`. */
@Injectable()
export class ZodValidationPipe<TSchema extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): z.output<TSchema> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const body: ApiError = {
        code: 'VALIDATION_FAILED',
        details: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          code: issue.code,
        })),
      };
      throw new BadRequestException(body);
    }
    return result.data;
  }
}
