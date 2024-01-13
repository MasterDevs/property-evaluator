import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import { env } from "~/env.mjs";

// create the connection
const connection = connect({
  host: env.MD_DATABASE_HOST,
  username: env.MD_DATABASE_USERNAME,
  password: env.MD_DATABASE_PASSWORD,
});

export const db = drizzle(connection);
