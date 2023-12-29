import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import ogs from "open-graph-scraper";

export const mainRouter = createTRPCRouter({
  scrapeUrl: publicProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ input }) => {
      console.log(input);
      const result = await ogs({
        url: input.url,
      });
      console.log(result);
      return result.result;
    }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
