import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      where: { published: true },
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
      where: { createdById: input.userId, published: true },
      orderBy: { createdAt: "desc" }
    });

    return posts;
  }),

  getPostsByUserEmail: publicProcedure.input(z.object({ email: z.string() })).query(async ({ ctx, input }) => {
    const posts = await ctx.db.post.findMany({
      where: { createdBy: { email: input.email }, published: true },
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

  getPostById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const post = await ctx.db.post.findUnique({
      where: { id: input.id, published: true },
      include: {
        createdBy: {
          select: {
            image: true,
            name: true
          }
        }
      }
    });

    if(!post) {
      return null;
    }

    return post;
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

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const post = await ctx.db.post.findUnique({
      where: { id: input.id },
    });

    if (!post || post.createdById !== ctx.session.user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized to delete this post."
      });
    }

    return ctx.db.post.delete({
      where: { id: input.id },
    });
  }),

  updateById: protectedProcedure.input(z.object({ id: z.string(), title: z.string().min(1), content: z.string().min(1), intro: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const post = await ctx.db.post.findUnique({
      where: { id: input.id },
    });

    if (!post || post.createdById !== ctx.session.user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized to delete this post."
      });
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
            { title: { contains: input.search, mode: 'insensitive' } }, 
            { createdBy: { name: { contains: input.search, mode: 'insensitive' }}}
          ],
          published: true
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
  }),

  getAllPostsBySingleUser: protectedProcedure.input(z.object({ email: z.string() })).query(async ({ ctx, input }) => {
    if(ctx.session.user.email !== input.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized to view this user's posts."
      });
    }

    const posts = await ctx.db.post.findMany({
      where: { createdBy: { email: input.email }},
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

  updatePostPublishStatus: protectedProcedure.input(z.object({ id: z.string(), published: z.boolean() })).mutation(async ({ ctx, input }) => {
    return ctx.db.post.update({
      where: { id: input.id },
      data: { published: input.published }
    });
  })
});
