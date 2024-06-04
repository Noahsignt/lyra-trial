import { signIn, signOut, useSession } from "next-auth/react";

import Btn from "./Btn";

import Link from "next/link";

const Header = () => {
    const { data: sessionData } = useSession();

    return (
        <header className="flex justify-between items-center border-b-2 border-black h-12 px-2">
            <Link className="text-2xl font-bold px-4" href="/">
                Lyredium
            </Link>
            {sessionData && 
            <Btn text={"Post"}
            onClick={() => window.location.href="/post"}
            lightScheme={false}/>}
            <div className="flex items-center">
                {sessionData && <Btn text={"Profile"}
                onClick={() => window.location.href=`/user/${sessionData.user.email}`}
                lightScheme={false}/>}
                <Btn text={sessionData ? "Sign out" : "Sign in"} 
                onClick={sessionData ? () => void signOut() : () => void signIn()}
                lightScheme={sessionData ? true : false}/>
            </div>
        </header>
    )
}

export default Header;

