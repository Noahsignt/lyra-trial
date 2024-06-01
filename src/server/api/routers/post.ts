import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    });

    // return empty array or prisma will return all users
    if(!posts || !posts.length){
      return []
    }

    const users = await ctx.db.user.findMany({
      where: { id: { in: posts.map((post) => post.createdById) } },
    });

    if(!users){
      return [];
    }

    const postsWithUser = posts.map((post) => {
      const foundUser = users.find((user) => user.id === post.createdById);
      return {
        ...post,
        img: foundUser?.image,
        name: foundUser?.name,
      }
    });

    return postsWithUser
  }),

  getUsersPosts: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      where: { createdBy: { id: ctx.session.user.id } },
      orderBy: { createdAt: "desc" }
    });

    return posts;
  }),

  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.post.create({
  //       data: {
  //         title: input.name,
  //         createdBy: { connect: { id: ctx.session.user.id } },
  //       },
  //     });
  //   }),
});
