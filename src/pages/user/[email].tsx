import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from 'next/image';

import { api } from "~/utils/api";

import { Header } from "~/components/Header";

import { createServerSideHelpers } from '@trpc/react-query/server';
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import { NextPage} from "next";
import superjson from 'superjson';
import { appRouter } from '~/server/api/root';
import { db } from '~/server/db';

export async function getStaticProps( context: GetStaticPropsContext<{ email: string }>, ) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {db, session: null},
    transformer: superjson, 
  });
  const email = context.params!.email;
  await helpers.user.getUserByEmail.prefetch({ email });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      email,
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
  const { data: sessionData } = useSession();
  const { data: userData } = api.user.getUserByEmail.useQuery({ email: props.email })

  if(!userData) {
    return <div>404</div>
  }

  return (
    <>
      <Head>
        <title>Lyredium</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className=" flex min-h-screen flex-col justify-center items-center py-8 gap-4">
        <div className="bg-white p-4 rounded-md h-1/2 w-3/4 flex gap-8">
          <Image src={userData.image ?? ''} alt={userData.name ?? ''} width={64} height={64} className="rounded-full"/>
          <div className="text-right flex flex-col">
            <h1 className="text-4xl font-bold">
              {userData.name}
            </h1>
            <h2 className="italic">
              {userData.email}
            </h2>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
