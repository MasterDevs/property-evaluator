import { defineConfig } from "drizzle-kit";
import { env } from "~/env.mjs";
import { TABLE_PREFIX } from "~/lib/schema";
export default defineConfig({
  schema: "./src/lib/schema.ts",
  dbCredentials: {
    uri: env.MD_DATABASE_URL,
  },
  driver: "mysql2",
  tablesFilter: [`${TABLE_PREFIX}*`],
  verbose: true,
  strict: true,
});
