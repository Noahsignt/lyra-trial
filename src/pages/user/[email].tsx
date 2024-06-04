import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

import { Header } from "~/components/Header";

export default function Home() {
  return (
    <>
      <Head>
        <title>Lyredium</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className=" flex min-h-screen flex-col justify-center items-center py-8 gap-4">
        
      </main>
    </>
  );
}