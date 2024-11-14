import factory from "./helper/factory";

const app = factory.createApp();

Bun.serve({
  port: Bun.env.PORT,
  fetch: app.fetch,
});
