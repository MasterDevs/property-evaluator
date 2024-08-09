import { sql } from "drizzle-orm";
import {
  text,
  datetime,
  mysqlTableCreator,
  char,
  decimal,
  json,
  varchar,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
export const TABLE_PREFIX = "propertyEvaluator_";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
const mysqlTable = mysqlTableCreator((name) => `${TABLE_PREFIX}${name}`);

function dollarColumn(name: string) {
  return decimal(name, { precision: 11, scale: 2 }).$type<number>().notNull();
}

function percentColumn(name: string) {
  return decimal(name, { precision: 6, scale: 2 }).$type<number>().notNull();
}
/**
 * Note when doing a PUSH, it's not going to be able to recognize the default value and look like there's way  more changes then necessary. Simply ignore that. The juice isn't worth the squeeze on a refactor just yet.
 */
export const PropertyTable = mysqlTable("property", {
  id: char("id", { length: 21 }).primaryKey(),
  created: datetime("created").default(sql`CURRENT_TIMESTAMP`),
  purchasePrice: dollarColumn("purchasePrice").default(500000).$type<number>(),
  monthlyRent: dollarColumn("monthlyRent").default(2500),
  insurance: dollarColumn("insurance").default(1200),
  loanRate: percentColumn("loanRate").default(6.5),
  ltv: percentColumn("ltv").default(80),
  months: percentColumn("months").default(360),
  totalRehabCost: dollarColumn("totalRehabCost").default(15000),
  postRehabValue: dollarColumn("postRehabValue").default(650000),
  taxesYearly: dollarColumn("taxesYearly").default(7500),
  closing: dollarColumn("closing").default(10000),
  vacancyRate: percentColumn("vacancyRate").default(5),
  capitalExpendituresRate: percentColumn("capitalExpendituresRate").default(5),
  repairRate: percentColumn("repairRate").default(5),
  managementRate: percentColumn("managementRate").default(0),
  url: text("url").default("").notNull(),
  notes: text("name").default("").notNull(),
  oginfo: json("oginfo").default({}),
  mode: mysqlEnum("mode", ["str", "ltr"]).default("ltr"),
  occupancyRate: percentColumn("occupancyRate").default(75),
  averageNightlyRent: dollarColumn("averageNightlyRent").default(250),
});

export const OGInfoTable = mysqlTable("oginfo", {
  url: varchar("url", { length: 750 }).notNull().primaryKey(),
  oginfo: json("oginfo").notNull(),
});

function safeParsePropertyNumber(value: number) {
  return z.coerce.number().catch(value);
}

export const PropertySchema = createSelectSchema(PropertyTable, {
  capitalExpendituresRate: safeParsePropertyNumber(5),
  closing: safeParsePropertyNumber(10000),
  created: z.coerce.date().default(() => new Date()),
  insurance: safeParsePropertyNumber(1200),
  loanRate: safeParsePropertyNumber(6.5),
  id: z.coerce.string().catch(""),
  managementRate: safeParsePropertyNumber(0),
  ltv: safeParsePropertyNumber(80),
  monthlyRent: safeParsePropertyNumber(2500),
  months: safeParsePropertyNumber(360),
  notes: z.coerce.string().catch("").default(""),
  postRehabValue: safeParsePropertyNumber(650000),
  purchasePrice: safeParsePropertyNumber(500000),
  repairRate: safeParsePropertyNumber(5),
  taxesYearly: safeParsePropertyNumber(7500),
  totalRehabCost: safeParsePropertyNumber(15000),
  url: z.coerce.string().catch("").default(""),
  oginfo: z.object({}),
  vacancyRate: safeParsePropertyNumber(5),
  occupancyRate: safeParsePropertyNumber(75),
  averageNightlyRent: safeParsePropertyNumber(250),
});

//export const PropertySchema = createSelectSchema(PropertyTable);
export type PropertySchema = z.infer<typeof PropertySchema>;
export const insertPropertySchema = createInsertSchema(PropertyTable);
