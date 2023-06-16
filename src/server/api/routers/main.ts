import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import ogs from "open-graph-scraper";

export const mainRouter = createTRPCRouter({
  scrapeUrl: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      const result = await ogs({
        url: input.url,
      });
      return result.result;
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
