import { defineConfig } from "drizzle-kit";
import { env } from "~/env.mjs";
import { TABLE_PREFIX } from "~/lib/schema";
export default defineConfig({
  schema: "./src/lib/schema.ts",
  dbCredentials: {
    url: env.MD_DATABASE_URL,
  },
  dialect: "mysql",
  tablesFilter: [`${TABLE_PREFIX}*`],
  verbose: true,
  strict: true,
});
