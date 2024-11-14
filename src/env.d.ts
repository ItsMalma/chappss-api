declare module "bun" {
  interface Env {
    PORT: number;
    DATABASE_URL: string;
  }
}
