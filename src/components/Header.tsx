import { signIn, signOut, useSession } from "next-auth/react";

import { AuthBtn } from "./AuthBtn";

export const Header = () => {
    const { data: sessionData } = useSession();

    return (
        <header className="flex justify-between items-start bg-fuchsia-500">
            <h1 className="text-2xl font-bold">
                Lyredium
            </h1>
            <div className="flex items-center">
                <AuthBtn text={sessionData ? "Sign out" : "Get started"} onClick={sessionData ? () => void signOut() : () => void signIn()}/>
            </div>
        </header>
    )
}