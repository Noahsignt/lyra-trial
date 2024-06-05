import Head from "next/head";
import Image from "next/image";

import Header from "~/components/Header";

import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import LoadingSpinner from "~/components/LoadingSpinner";

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

export async function getStaticProps( context: GetStaticPropsContext<{ id: string }>, ) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {db, session: null},
    transformer: superjson, 
  });
  const id = Number(context.params!.id);
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

const Edit : NextPage<PageProps> = (props) => {
    const router = useRouter();
    const { data: sessionData } = useSession();

    const { data: postData } = api.post.getPostById.useQuery({
        id: Number(router.query.id)
    });

    if(!postData) {
        return <div>404: Post not found</div>
    }

    const [title, setTitle] = useState(postData.title);
    const [content, setContent] = useState(postData.content);
    const [intro, setIntro] = useState(postData.intro);

    const user = sessionData?.user;
    const { mutate: updatePost } = api.post.updateById.useMutation();
    
    const onClick = () => {
        updatePost({id: postData.id, title, content, intro});
        router.push(`/post/${postData.id}`);
    }

    const Byline = () => {
        return (
            <div className="flex items-center justify-between gap-x-2">
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <div className="flex items-center gap-x-2">
                    <Image src={user?.image ?? ""} alt={user?.name ?? ""} width={40} height={40} className="rounded-full" />
                    <p>{user?.email}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Header />
            <main className="px-24 flex flex-col gap-4 justify-center min-h-screen">
                {user && 
                <>
                    <Byline />
                    <input type="text" placeholder="Title" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-10 p-2 rounded-md border-2 border-gray-3000" />
                    <input type="text" placeholder="Intro" name="Intro" value={intro} onChange={(e) => setIntro(e.target.value)} className="w-full h-10 p-2 rounded-md border-2 border-gray-3000" />
                    <textarea placeholder="Content" name="Content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-96 p-2 rounded-md border-2 border-gray-300 resize-none overflow-hidden" />
                    <button onClick={onClick} className="px-4 py-2 bg-black text-white rounded-md w-48">
                        Save Changes
                    </button>
                </>}
            </main>
        </>
    )
}

export default Edit;