import Head from "next/head";
import Image from 'next/image';

import { api } from "~/utils/api";
import { cacheBustImgURL, getReadingTime, getReadableDate } from "~/utils/format";

import { EditSVG, SaveSVG, ClapSVG, CommentSVG, PlaySVG, UploadSVG } from "~/components/Icons";

import Header from "~/components/Header";

import { createServerSideHelpers } from '@trpc/react-query/server';
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import type { NextPage} from "next";
import superjson from 'superjson';
import { appRouter } from '~/server/api/root';
import { db } from '~/server/db';

export async function getStaticProps( context: GetStaticPropsContext<{ id: string }>, ) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {db, session: null},
    transformer: superjson, 
  });
  const id = String(context.params!.id);
  await helpers.post.getPostById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
    revalidate: 1,
  };
}

export const getStaticPaths: GetStaticPaths =  () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const Home : NextPage<PageProps> = (props) => {
  const { data: postData } = api.post.getPostById.useQuery({ id: props.id })
  
  if(!postData) {
    return <div>404</div>
  }

  const ReactionBar = () => {
    return (
      <div className="flex flex-row items-center justify-between text-gray-600">
        <div className="flex gap-4">
          <div className="flex flex-row gap-1 hover:text-black">
            <ClapSVG />
            0
          </div>
          <div className="flex flex-row gap-1 hover:text-black">
            <CommentSVG />
            0
          </div>
        </div>
        <div className="flex gap-4">
          <SaveSVG />
          <PlaySVG />
          <UploadSVG />
          <EditSVG />
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{`${postData.title}`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex min-h-screen flex-col justify-start items-center py-8 px-16 gap-4">
        <div className="bg-white p-4 rounded-md h-1/2 w-full lg:w-1/2 flex gap-8 flex flex-col">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold">
              {postData.title}
            </h1>
            <h2 className="italic">
              {postData.intro}
            </h2>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Image src={cacheBustImgURL(postData.createdBy.image)} alt={`${postData.createdBy.name}'s profile picture`} width={48} height={48} className="rounded-full object-cover h-12"/>
            <div className="flex flex-col items-start">
              <h2>{postData.createdBy.name}</h2>
              <div className="flex flex-row gap-2 text-sm text-black/70">
                <h4 className="">Published in <span className="text-black">{postData.createdBy.name}</span></h4>
                <p>·</p>
                <h4 className="">{getReadingTime(postData.content)} min read</h4>
                <p>·</p>
                <h4 className="">{getReadableDate(postData.createdAt)}</h4>
              </div>
            </div>
          </div>
          <ReactionBar />
          <div>
            {postData.content}
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
