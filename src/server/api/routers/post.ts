import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

type filteredPostInfo = {
  id: number,
  title: string,
  intro: string,
  content: string,
  createdAt: Date,
  updatedAt: Date,
  img: string,
  name: string
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            image: true,
            name: true
          }
        }
      }
    });

    return posts;
  }),

  getPostsByUserId: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    const posts = await ctx.db.post.findMany({
      where: { createdById: input.userId },
      orderBy: { createdAt: "desc" }
    });

    return posts;
  }),

  getPostsByUserEmail: publicProcedure.input(z.object({ email: z.string() })).query(async ({ ctx, input }) => {
    const posts = await ctx.db.post.findMany({
      where: { createdBy: { email: input.email } },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            image: true,
            name: true
          }
        }
      }
    });

    return posts;
  }),

  getPostById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const post = await ctx.db.post.findUnique({
      where: { id: input.id }
    });

    if(!post) {
      return null;
    }

    const userInfo = await ctx.db.user.findUnique({
      where: { id: post.createdById }
    });

    if(!userInfo) {
      return null;
    }

    return {
      ...post,
      img: userInfo.image,
      name: userInfo.name,
    } as filteredPostInfo;
  }),

  create: protectedProcedure
    .input(z.object({ 
      title: z.string().min(1),
      content: z.string().min(1),
      intro: z.string().min(1)
     }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content,
          intro: input.intro,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const post = await ctx.db.post.findUnique({
      where: { id: input.id },
    });

    if (!post || post.createdById !== ctx.session.user.id) {
      throw new Error("Unauthorized to delete this post.");
    }

    return ctx.db.post.delete({
      where: { id: input.id },
    });
  }),

  updateById: protectedProcedure.input(z.object({ id: z.number(), title: z.string().min(1), content: z.string().min(1), intro: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const post = await ctx.db.post.findUnique({
      where: { id: input.id },
    });

    if (!post || post.createdById !== ctx.session.user.id) {
      throw new Error("Unauthorized to delete this post.");
    }

    const updatedPost = await ctx.db.post.update({
      where: { id: input.id },
      data: { title: input.title, content: input.content, intro: input.intro }
    });

    return updatedPost;
  }),

  getBySearch: publicProcedure.input(z.object({ search: z.string() })).query(async ({ ctx, input }) => {
    const posts = await ctx.db.post.findMany({
      where: { 
        OR: 
          [
            { title: { contains: input.search } }, 
            { createdBy: { name: { contains: input.search }}}
          ] 
      },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            image: true,
            name: true
          }
        }
      }
    });

    return posts;
  })
});
