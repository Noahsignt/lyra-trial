import Header from "~/components/Header"

import Image from "next/image";
import { useRouter } from "next/router";

import { useSession } from "next-auth/react"
import { api } from "~/utils/api"
import { useState } from "react";

export default function Post() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [intro, setIntro] = useState("");

    const router = useRouter();

    const { data: sessionData } = useSession();
    const user = sessionData?.user;
    const { mutate } = api.post.create.useMutation();

    const onClick = () => {
        mutate({
            title: title,
            content: content,
            intro: intro
        }, {
            onSuccess: () => {
                router.push('/').then(() => {
                    return;
                }).catch((error) => {
                    console.log(error);
                });
            },
            onError: (error) => {
                console.log(error);
            }
        })

        
    }

    const Byline = () => {
        return (
            <div className="flex items-center justify-between gap-x-2">
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <div className="flex items-center gap-x-2">
                    <Image src={user?.image ?? ""} alt={user?.name ?? ""} width={40} height={40} className="rounded-full" />
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
                    <input type="text" placeholder="Title" name="Title" onChange={(e) => setTitle(e.target.value)} className="w-full h-10 p-2 rounded-md border-2 border-gray-3000" />
                    <input type="text" placeholder="Intro" name="Intro" onChange={(e) => setIntro(e.target.value)} className="w-full h-10 p-2 rounded-md border-2 border-gray-3000" />
                    <textarea placeholder="Content" name="Content" onChange={(e) => setContent(e.target.value)} className="w-full h-96 p-2 rounded-md border-2 border-gray-300 resize-none overflow-hidden" />
                    <button onClick={onClick} className="px-4 py-2 bg-black text-white rounded-md w-24">
                        Post
                    </button>
                </>}
            </main>
        </>
    )
}