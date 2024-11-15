import { cors } from "hono/cors";
import { createFactory } from "hono/factory";
import db from "../db";
import { err } from "./api/payload";

const factory = createFactory<{
  Variables: {
    db: typeof db;
  };
}>({
  initApp(app) {
    app
      .use(async (c, next) => {
        c.set("db", db);

        await next();
      })
      .use("/*", cors())
      .onError((e, c) => {
        console.error(e);

        return c.json(err("Terjadi kesalahan pada server"), 500);
      })
      .notFound((c) => c.json(err("Halaman tidak ditemukan"), 404));
  },
});

export default factory;
