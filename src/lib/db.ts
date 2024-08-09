import { drizzle } from "drizzle-orm/planetscale-serverless";
import { Client } from "@planetscale/database";
import { env } from "~/env.mjs";
import * as schema from "./schema";

// create the connection
const client = new Client({
  host: env.MD_DATABASE_HOST,
  username: env.MD_DATABASE_USERNAME,
  password: env.MD_DATABASE_PASSWORD,
});

export const db = drizzle(client, {
  schema,
});
