import factory from "../helper/factory";
import { createUserApp } from "./create";
import { loginUserApp } from "./login";

const user = factory
  .createApp()
  .basePath("/users")
  .route("", createUserApp)
  .route("", loginUserApp);

export default user;
