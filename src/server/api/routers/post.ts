import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

type filteredPostInfo = {
  id: number,
  title: string,
  content: string,
  createdAt: Date,
  updatedAt: Date,
  img: string,
  name: string
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    });

    // return empty array or prisma will return all users
    if(!(posts?.length)){
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

      if(!foundUser) {
        return null;
      }

      return {
        ...post,
        img: foundUser.image,
        name: foundUser.name,
      }
    });

    return postsWithUser.filter((post) => post !== null) as filteredPostInfo[];
  }),

  getPostsByUserId: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    const posts = await ctx.db.post.findMany({
      where: { createdById: input.userId },
      orderBy: { createdAt: "desc" }
    });

    return posts;
  }),

  create: protectedProcedure
    .input(z.object({ 
      title: z.string().min(1),
      content: z.string().min(1),
     }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});
