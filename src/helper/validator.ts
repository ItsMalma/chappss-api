import type {
  Env,
  Input as HonoInput,
  MiddlewareHandler,
  ValidationTargets,
} from "hono";
import { validator } from "hono/validator";
import type {
  GenericSchema,
  GenericSchemaAsync,
  InferInput,
  InferOutput,
} from "valibot";
import { flatten, safeParseAsync } from "valibot";
import { err } from "./api/payload";

type HasUndefined<T> = undefined extends T ? true : false;

export const valibot = <
  T extends GenericSchema | GenericSchemaAsync,
  Target extends keyof ValidationTargets,
  E extends Env,
  P extends string,
  In = InferInput<T>,
  Out = InferOutput<T>,
  I extends HonoInput = {
    in: HasUndefined<In> extends true
      ? {
          [K in Target]?: K extends "json"
            ? In
            : HasUndefined<keyof ValidationTargets[K]> extends true
              ? { [K2 in keyof In]?: ValidationTargets[K][K2] }
              : { [K2 in keyof In]: ValidationTargets[K][K2] };
        }
      : {
          [K in Target]: K extends "json"
            ? In
            : HasUndefined<keyof ValidationTargets[K]> extends true
              ? { [K2 in keyof In]?: ValidationTargets[K][K2] }
              : { [K2 in keyof In]: ValidationTargets[K][K2] };
        };
    out: { [K in Target]: Out };
  },
  V extends I = I,
>(
  target: Target,
  schema: T,
): MiddlewareHandler<E, P, V> =>
  // @ts-expect-error not typed well
  validator(target, async (value, c) => {
    const result = await safeParseAsync(schema, value);

    if (!result.success) {
      const flatErrors = flatten(result.issues);

      if (flatErrors.root) {
        return c.json(err(flatErrors.root[0]), 400);
      } else if (flatErrors.other) {
        return c.json(err(flatErrors.other[0]), 400);
      } else {
        return c.json(err(flatErrors.nested), 400);
      }
    }

    return result.output;
  });
