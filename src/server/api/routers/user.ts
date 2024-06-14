import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { email: input.email },
    });

      if(!user){
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio
      };
    }),
    updateImage: protectedProcedure
    .input(z.object({image: z.string()}))
    .mutation(async ({ctx, input}) => {
      if(ctx.session.user.id !== ctx.session.user.id){
        return {
          error: "You are not authorized to update this user"
        }
      }

      const user = await ctx.db.user.update({
        where: {id: ctx.session.user.id},
        data: {image: input.image}
      })

      return user;
    }),
    updateInfo: protectedProcedure
    .input(z.object({name: z.string().min(1), bio: z.string()}))
    .mutation(async ({ctx, input}) => {
      if(ctx.session.user.id !== ctx.session.user.id){
        return {
          error: "You are not authorized to update this user"
        }
      }

      const user = await ctx.db.user.update({
        where: {id: ctx.session.user.id},
        data: {name: input.name, bio: input.bio}
      })

      return user;
    }),
    
    getThreeUsers: publicProcedure
    .query(async ({ctx}) => {
      const users = await ctx.db.user.findMany({
        take: 3
      })

      return users;
    })
});
