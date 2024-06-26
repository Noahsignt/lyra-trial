import { signIn, useSession } from "next-auth/react";
import Head from "next/head";

import { api } from "~/utils/api";

import Header from "~/components/Header";
import Btn from "~/components/Btn";
import LoadingSpinner from "~/components/LoadingSpinner";
import PostView from "~/components/PostView";
import StaffPicks from "~/components/StaffPicks";
import RecommendedTopics from "~/components/RecommendedTopics";
import WhoToFollow from "~/components/WhoToFollow";

export default function Home() {
  const { data: sessionData, status: userStatus } = useSession();
  const { data: posts, status: postsStatus } = api.post.getAll.useQuery();

  const isLoaded = userStatus !== "loading" && postsStatus !== "pending";
  const isAuth = sessionData;

  return (
    //extra div to override the literal one page where the bg-colour is different, u suck Medium.
    <div className={`${isAuth ? "bg-white" : "bg-orange-50"}`}>
      <Head>
        <title>Lyredium</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${!isAuth && "border-solid border-b-[1px] border-black py-4 px-8"}`}>
        <Header />
      </div>
      <main className="flex min-h-screen flex-col justify-start items-center gap-4">
        <div className="grid grid-cols-4 h-screen w-full sm:w-3/4">
              {isLoaded ? isAuth ?
              <>
              <div className="col-span-4 sm:col-start-1 sm:col-end-4 border-r-2 border-gray-100 sm:pt-8 flex flex-col justify-start items-center">
                {posts?.map((post) => (
                  <PostView post={post} key={post.id} />
                ))}
              </div>
              <div className="hidden sm:flex flex-col gap-4 p-4">
                <StaffPicks />
                <RecommendedTopics />
                <WhoToFollow />
              </div>
              </>
              : 
              <div className="col-span-4">
                <IntroBloc />
              </div>
              : <div className="col-span-4 flex items-center justify-center h-screen">
                  <LoadingSpinner />
                </div>}
        </div>
      </main>
    </div>
  );
}

function IntroBloc() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 pt-20">
      <h1 className="font-serif font-medium text-7xl sm:text-8xl text-center">
        Human <br />
        stories & ideas
      </h1>
      <div className="flex flex-col items-center justify-center gap-6">
        <p className="text-lg text-center">
          A place to read, write, and deepen your understanding.
        </p>
        <Btn text={"Start reading!"} 
          onClick={() => void signIn()}
          lightScheme={false}/>
      </div>
    </div>
  );
}
