import Head from "next/head";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

import Header from "~/components/Header";
import LoadingSpinner from "~/components/LoadingSpinner";
import PostView from "~/components/PostView";

import { useState } from "react";

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

const UserPosts: NextPage<PageProps> = ({ email }) => {
    const router = useRouter();
    const [postTypeFilter, setPostTypeFilter] = useState<"Drafts" | "Published">("Drafts");
    //static generated so need to check loading state
    const { data: userData } = api.user.getUserByEmail.useQuery({ email: email });
    const { data: sessionData } = useSession();

    if(!userData){
        return <div>404: User not found</div>;
    }

    const { data: otherPostData, isLoading: otherPostsLoading } = api.post.getPostsByUserEmail.useQuery({ email: email });
    const { data: yourPostData, isLoading: yourPostsLoading, refetch: refetchYourPosts } = api.post.getAllPostsBySingleUser.useQuery({ email: email });

    const isUser = () => {
        return sessionData && sessionData.user.id === userData.id;
    }

    // if we filter by drafts, this returns all unpublished posts. Vice-versa for when we filter by published.
    const filterPostsByPublishStatus = (posts: typeof yourPostData) => {
        return posts ? posts.filter((post) => postTypeFilter === "Drafts" ? !post.published : post.published) : [];
    }

    const PostTypePicker = () => {
        return (
            <div className="flex flex-row justify-start items-start gap-8 w-full pt-10">
                <button onClick={() => setPostTypeFilter("Drafts")} className={`py-4 ${postTypeFilter === "Drafts" ? "text-black border-b border-solid border-black" : "text-gray-500 hover:text-gray-700"}`}>Drafts</button>
                <button onClick={() => setPostTypeFilter("Published")} className={`py-4 ${postTypeFilter === "Published" ? "text-black border-b border-solid border-black" : "text-gray-500 hover:text-gray-700"}`}>Published</button>
            </div>
        )
    }

    const NoPostsMessage = ({message}: {message: string}) => {
        return (
            <div className="flex flex-col justify-center items-center w-full gap-12 py-16">
                You have no {message}.
                <span><a onClick={() => router.push("/post")} className="underline cursor-pointer">Write</a> a story or <a onClick={() => router.push("/")} className="underline cursor-pointer">read</a> on Lyredium.</span>
            </div>
        )
    }

    const YourPosts = () => {
        const router = useRouter();
        const { mutate: deletePost } = api.post.delete.useMutation({
            onSuccess: async () => {
                await refetchYourPosts();  
            },
            onError: (error) => {
                console.error("Error deleting post:", error);
            }
        });
        const { mutate: updatePostPublishStatus } = api.post.updatePostPublishStatus.useMutation({
            onSuccess: async () => {
                await refetchYourPosts();  
            },
            onError: (error) => {
                console.error("Error updating post:", error);
            }
        });

        const handlePostDeleted = async (id: string) => {
            deletePost({ id: id });
        };

        const handlePostPublishStatusChange = async (id: string, status: boolean) => {
            updatePostPublishStatus({ id: id, published: status });
        }

        return(
            <div className="flex flex-col items-center w-1/2 py-16">
                <div className="flex justify-between w-full py-2">
                    <h1 className="text-4xl font-semibold">Your Stories</h1>
                    <button onClick={() => router.push("/post")} className="bg-green-700 hover:bg-green-900 text-white py-2 px-4 rounded-full">
                        Write a story
                    </button>
                </div>
                <PostTypePicker />
                {!yourPostsLoading ?
                <div className="flex flex-col justify-center items-center gap-4 w-full">
                    {filterPostsByPublishStatus(yourPostData).length > 0 ? (
                        filterPostsByPublishStatus(yourPostData).map((post) => (
                            <PostView key={post.id} post={post} onUserPage={true} onPostDeleted={() => handlePostDeleted(post.id)} onPostPublishStatusChange={(status) => handlePostPublishStatusChange(post.id, !status)} />
                        ))
                    ) : (
                        <NoPostsMessage message={postTypeFilter === "Drafts" ? "drafts" : "published stories"} />
                    )}
                </div>
                    :
                <LoadingSpinner />}
            </div>
        )
    }

    const OtherPosts = () => {
        return(
            <div className="flex flex-col items-center w-1/2 py-16">
                <div className="flex justify-between w-full border-b-2 border-gray-200 py-2">
                    <h1 className="text-4xl font-semibold">{userData.name}&apos;s Stories</h1>
                </div>
                {!otherPostsLoading ?
                <div className="flex flex-col justify-center items-center gap-4 w-full">
                    {otherPostData?.map((post) => (
                        <PostView key={post.id} post={post}/>
                    ))}
                </div>  
                    :
                <LoadingSpinner />}
            </div>
        )
    }

    return(
        <>
            <Head>
                <title>{userData.name} Posts</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <main className="flex flex-col justify-center items-center">
                {isUser() ? <YourPosts /> : <OtherPosts />} 
            </main>
        </>
    )
}

export default UserPosts