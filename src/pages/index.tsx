import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

import Header from "~/components/Header";
import Btn from "~/components/Btn";
import LoadingSpinner from "~/components/LoadingSpinner";
import PostView from "~/components/PostView";

export default function Home() {
  const { data: sessionData, status: userStatus } = useSession();
  const { data: posts, status: postsStatus } = api.post.getAll.useQuery();

  const isLoaded = userStatus !== "loading" && postsStatus !== "pending";
  const isAuth = sessionData;

  return (
    <>
      <Head>
        <title>Lyredium</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex min-h-screen flex-col justify-center items-center py-8 gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
              {isLoaded ? isAuth ? posts?.map((post) => (
                <PostView post={post} key={post.id} />
              )) : 
              <IntroBloc />
              : <LoadingSpinner />}
        </div>
      </main>
    </>
  );
}

function IntroBloc() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Welcome to Lyredium!
      </h1>
      <p>
        This is a <span className="line-through">trial website</span> blogging platform for sharing your thoughts and ideas.
        <br />
        Sign in to start your journey.
      </p>
      <Btn text={"Get started!"} 
        onClick={() => void signIn()}
        lightScheme={false}/>
    </div>
  );
}
