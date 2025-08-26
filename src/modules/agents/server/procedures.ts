import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { agentsInsertSchema } from "../schemas";
import { eq, getTableColumns, sql } from "drizzle-orm";

export const agentsRouter = createTRPCRouter({
    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
        const [existingAgent] = await db
            .select({
                // TODO: Change to actual count
                meetingCount: sql<number>`5`,
                ...getTableColumns(agents),
            })
            .from(agents)
            .where(eq(agents.id, input.id))
            .limit(1)
        
        return existingAgent;
    }),
    getMany: protectedProcedure.query(async () => {
        const data = await db
            .select({
                // TODO: Change to actual count
                meetingCount: sql<number>`6`,
                ...getTableColumns(agents),
            })
            .from(agents);
        
        return data;
    }),
    create: protectedProcedure
        .input(agentsInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const [createdAgent] = await db
                .insert(agents)
                .values({
                    ...input,
                    userId: ctx.auth.user.id,
                })
                .returning();

            return createdAgent;
        }),
});
