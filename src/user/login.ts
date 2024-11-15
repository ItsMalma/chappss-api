import { eq } from "drizzle-orm";
import * as jwt from "hono/jwt";
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

export const loginUserSchema = object(
  {
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

export const loginUserApp = factory
  .createApp()
  .post("/login", valibot("json", loginUserSchema), async (c) => {
    const data = c.req.valid("json");

    const [user] = await c.var.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email));
    if (!user) {
      return c.json(err("Email atau password salah"), 401);
    }
    if (!(await Bun.password.verify(data.password, user.password))) {
      return c.json(err("Email atau password salah"), 401);
    }

    const now = Math.floor(Date.now() / 1000);

    const accessTokenExpiration = now + 60 * 60;
    const accessToken = await jwt.sign(
      {
        exp: accessTokenExpiration,
        iat: now,
        nbf: now,
        sub: user.id,
      },
      Bun.env.JWT_SECRET,
    );

    const refreshTokenExpiration = now + 60 * 60 * 24 * 30;
    const refreshToken = await jwt.sign(
      {
        exp: refreshTokenExpiration,
        iat: now,
        nbf: now,
        sub: user.id,
      },
      Bun.env.JWT_SECRET,
    );

    return c.json(
      ok({
        accessToken,
        accessTokenExpiration: new Date(accessTokenExpiration * 1000),
        refreshToken,
        refreshTokenExpiration: new Date(refreshTokenExpiration * 1000),
      }),
      200,
    );
  });
