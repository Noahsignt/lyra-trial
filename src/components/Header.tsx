import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import { cacheBustImgURL } from "~/utils/format";

import Btn from "./Btn";

import Link from "next/link";
import Image from "next/image";

const WriteButton = () => {
    return (
        <Link href="/post">
            <button className="bg-white p-2 rounded-md flex text-gray-600 gap-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Write"><path d="M14 4a.5.5 0 0 0 0-1v1zm7 6a.5.5 0 0 0-1 0h1zm-7-7H4v1h10V3zM3 4v16h1V4H3zm1 17h16v-1H4v1zm17-1V10h-1v10h1zm-1 1a1 1 0 0 0 1-1h-1v1zM3 20a1 1 0 0 0 1 1v-1H3zM4 3a1 1 0 0 0-1 1h1V3z" fill="currentColor"></path><path d="M17.5 4.5l-8.46 8.46a.25.25 0 0 0-.06.1l-.82 2.47c-.07.2.12.38.31.31l2.47-.82a.25.25 0 0 0 .1-.06L19.5 6.5m-2-2l2.32-2.32c.1-.1.26-.1.36 0l1.64 1.64c.1.1.1.26 0 .36L19.5 6.5m-2-2l2 2" stroke="currentColor"></path></svg>
                Write
            </button>
        </Link>
    )
}

const ProfileSelectionSVG = () => {
    return(
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Profile"><circle cx="12" cy="7" r="4.5" stroke="currentColor" stroke-width="1.75"></circle><path d="M3.5 21.5v-4.34C3.5 15.4 7.3 14 12 14s8.5 1.41 8.5 3.16v4.34" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path></svg>
    )
}

const StoriesSelectionSVG = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Stories"><path d="M4.75 21.5h14.5c.14 0 .25-.11.25-.25V2.75a.25.25 0 0 0-.25-.25H4.75a.25.25 0 0 0-.25.25v18.5c0 .14.11.25.25.25z" stroke="currentColor"></path><path d="M8 8.5h8M8 15.5h5M8 12h8" stroke="currentColor" stroke-linecap="round"></path></svg>
    )
}

const SearchBarSVG = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600" aria-label="Search"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.1 11.06a6.95 6.95 0 1 1 13.9 0 6.95 6.95 0 0 1-13.9 0zm6.94-8.05a8.05 8.05 0 1 0 5.13 14.26l3.75 3.75a.56.56 0 1 0 .8-.79l-3.74-3.73A8.05 8.05 0 0 0 11.04 3v.01z" fill="currentColor"></path></svg>
    )
}

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [search, setSearch] = useState('');

    const { data: sessionData } = useSession();
    const email = sessionData?.user?.email ?? '';
    const { data: userData } = api.user.getUserByEmail.useQuery({ email }, { enabled: !!email });

    const router = useRouter();

    const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (search) {
                await router.push(`/search?q=${search}`);
            }
        }
    }

    return (
        <header className="flex justify-between items-center border-b-2 border-gray-100 h-12 px-2">
            <div className="flex items-center gap-2">
                <Link className="text-2xl font-bold px-4" href="/">
                    Lyredium
                </Link>
                <SearchBarSVG />
                <input type="text" placeholder="Search" className="bg-transparent p-2 rounded-md w-48 text-sm outline-none text-gray-600" onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => handleSearchKeyDown(e)}/>
            </div>
            {sessionData ?
            <div className="flex items-center gap-4">
                <WriteButton />
                <Image src={cacheBustImgURL(userData?.image ?? '')} alt={userData?.name ?? ''} width={32} height={32} className="h-8 rounded-full cursor-pointer object-cover" onClick={() => setIsMenuOpen(!isMenuOpen)}/>
            </div> :
            <div>
                <Btn onClick={() => signIn()} text="Sign in" lightScheme={true} />
            </div>}
            {isMenuOpen && sessionData &&
            <div className="absolute top-10 right-0 bg-white p-4 rounded-md border-2 border-gray-100 w-48 shadow">
                <Link className="bg-white p-2 rounded-md flex text-gray-600 gap-1 flex gap-5 hover:text-black" href={`/user/${sessionData.user.email}`}>
                    <ProfileSelectionSVG />
                    Profile
                </Link>
                <Link className="bg-white p-2 rounded-md flex text-gray-600 gap-1 flex gap-5 hover:text-black" href={`/user/${sessionData.user.email}/posts`}>
                    <StoriesSelectionSVG />
                    Stories
                </Link>
                <button onClick={() => signOut()} className="bg-white p-2 rounded-md flex text-gray-600 gap-1 flex gap-5 hover:text-black">
                    Sign out
                </button>
            </div>}
        </header>
    )
}

export default Header;

