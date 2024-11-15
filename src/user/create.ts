import { DatabaseError } from "pg";
import {
  email,
  maxLength,
  minLength,
  nonEmpty,
  object,
  pipe,
  string,
} from "valibot";
import { usersTable } from "../db/schema";
import { err, ok } from "../helper/api/payload";
import factory from "../helper/factory";
import { valibot } from "../helper/validator";

export const createUserSchema = object(
  {
    firstName: pipe(
      string("Harus string"),
      nonEmpty("Tidak boleh kosong"),
      maxLength(50, "Maksimal 50 karakter"),
    ),
    lastName: pipe(
      string("Harus string"),
      nonEmpty("Tidak boleh kosong"),
      maxLength(50, "Maksimal 50 karakter"),
    ),
    email: pipe(
      string("Harus string"),
      nonEmpty("Tidak boleh kosong"),
      maxLength(254, "Maksimal 254 karakter"),
      email("Harus email"),
    ),
    password: pipe(
      string("Harus string"),
      nonEmpty("Tidak boleh kosong"),
      minLength(8, "Minimal 8 karakter"),
    ),
  },
  "Harus object",
);

export const createUserApp = factory
  .createApp()
  .onError(async (e, c) => {
    if (e instanceof DatabaseError && e.code === "23505") {
      return c.json(
        err({
          email: "Sudah terdaftar",
        }),
        409,
      );
    }

    throw e;
  })
  .post("", valibot("json", createUserSchema), async (c) => {
    const data = c.req.valid("json");

    const [user] = await c.var.db
      .insert(usersTable)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: await Bun.password.hash(data.password, "bcrypt"),
      })
      .returning();
    if (!user) {
      return c.json(err("Gagal mendaftarkan user"), 500);
    }

    return c.json(
      ok({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      }),
      201,
    );
  });
