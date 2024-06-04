import { signIn, signOut, useSession } from "next-auth/react";

import { AuthBtn } from "./AuthBtn";

import Link from "next/link";

export const Header = () => {
    const { data: sessionData } = useSession();

    return (
        <header className="flex justify-between items-center border-b-2 border-black">
            <Link className="text-2xl font-bold px-4" href="/">
                Lyredium
            </Link>
            <div className="flex items-center">
                <Link href="/post" className="px-6 py-2 bg-transparent text-black rounded-md">
                    Post
                </Link>
                <AuthBtn text={sessionData ? "Sign out" : "Sign in"} 
                onClick={sessionData ? () => void signOut() : () => void signIn()}/>
            </div>
        </header>
    )
}