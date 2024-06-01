import { Header } from "~/components/Header"

import { useSession } from "next-auth/react"

export default function Post() {
    const { data: sessionData } = useSession();
    const user = sessionData?.user;

    const Byline = () => {
        return (
            <div className="flex items-center justify-between gap-x-2">
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <div className="flex items-center gap-x-2">
                    <img src={user?.image ?? ""} alt={user?.name ?? ""} className="w-10 h-10 rounded-full" />
                    <p>{user?.email}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Header />
            <main className="px-24 py-4 flex flex-col gap-4 h-full">
                {user && 
                <>
                    <Byline />
                    <input type="text" placeholder="Title" className="w-full h-10 p-2 rounded-md border-2 border-gray-3000" />
                    <textarea placeholder="Content" className="w-full h-96 p-2 rounded-md border-2 border-gray-300 resize-none overflow-hidden" />
                </>}
            </main>
        </>
    )
}