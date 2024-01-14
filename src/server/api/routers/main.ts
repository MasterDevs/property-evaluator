import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import ogs from "open-graph-scraper";
import { db } from "~/lib/db";
import { OGInfoTable, PropertySchema, PropertyTable } from "~/lib/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { type OgObject } from "open-graph-scraper/dist/lib/types";

export const mainRouter = createTRPCRouter({
  scrapeUrl: publicProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ input }) => {
      const loweredUrl = input.url.toLowerCase();
      const dbResult = await db.query.OGInfoTable.findFirst({
        where: (t, { eq }) => eq(t.url, loweredUrl),
      });

      if (dbResult) {
        return dbResult.oginfo as OgObject;
      }

      const result = await ogs({
        url: input.url,
      });

      if (result.result.success) {
        await db.insert(OGInfoTable).values({
          url: loweredUrl,
          oginfo: result.result,
        });
        return result.result;
      }
      return undefined;
    }),
  newProperty: publicProcedure.mutation(async () => {
    const id = nanoid(21);
    await db.insert(PropertyTable).values({
      id,
    });
    return id;
  }),
  getProperty: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const property = await db.query.PropertyTable.findFirst({
        where: (p, { eq }) => eq(p.id, input.id),
      });
      return PropertySchema.parse(property);
    }),
  updateProperty: publicProcedure
    .input(PropertySchema)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      await db
        .update(PropertyTable)
        .set({
          ...rest,
        })
        .where(eq(PropertyTable.id, id));
    }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
