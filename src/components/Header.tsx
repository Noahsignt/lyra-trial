import { signIn, signOut, useSession } from "next-auth/react";

import { AuthBtn } from "./AuthBtn";

export const Header = () => {
    const { data: sessionData } = useSession();

    return (
        <header className="flex justify-between items-center border-b-2 border-black">
            <h1 className="text-2xl font-bold px-4">
                Lyredium
            </h1>
            <div className="flex items-center">
                <AuthBtn text={sessionData ? "Sign out" : "Sign in"} 
                onClick={sessionData ? () => void signOut() : () => void signIn()}
                isTransparent={true}/>
            </div>
        </header>
    )
}