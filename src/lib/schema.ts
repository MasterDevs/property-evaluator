import { int, text, mysqlTableCreator } from "drizzle-orm/mysql-core";
export const TABLE_PREFIX = "propertyEvaluator_";

const mysqlTable = mysqlTableCreator((name) => `${TABLE_PREFIX}${name}`);
export const users = mysqlTable("property", {
  id: int("id").primaryKey(),
  name: text("name").notNull(),
});
