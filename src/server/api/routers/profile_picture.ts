import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_PROD!,
    secretAccessKey: process.env.AWS_SECRET_KEY_PROD!,
  },
});

export const profilePictureRouter = createTRPCRouter({
  generatePresignedURL: protectedProcedure.mutation(async ({ ctx }) => {
    const putObjectCmd = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `${ctx.session.user.id}/pfp`,
    });

    const signedURL = await getSignedUrl(s3, putObjectCmd, {
      expiresIn: 60, //1 minute to submit request
    });
  
    return signedURL;
  }),
});


