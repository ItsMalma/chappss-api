import factory from "./helper/factory";
import user from "./user";

const app = factory.createApp().route("", user);

Bun.serve({
  port: Bun.env.PORT,
  fetch: app.fetch,
});
