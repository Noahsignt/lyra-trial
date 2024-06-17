import Header from "~/components/Header"

import Image from "next/image";
import { useRouter } from "next/router";

import { useSession } from "next-auth/react"
import { api } from "~/utils/api"
import { cacheBustImgURL } from "~/utils/format";
import { useState } from "react";

import { CloseSVG } from "~/components/Icons";

export default function Post() {
    const [publishStoryMenu, setPublishStoryMenu] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [intro, setIntro] = useState("");
    const [coverImg, setCoverImg] = useState<File | undefined>(undefined);

    const router = useRouter();

    const { data: sessionData } = useSession();
    const user = sessionData?.user;

    const createPost = api.post.create.useMutation();
    const getBucket = api.aws.generateCoverPresignedURL.useMutation();
    const updateImageURL = api.post.updatePostImg.useMutation();

    const handlePostClick = () => {
        if(canPost()) {
            setPublishStoryMenu(true)
        }
    }

    const canPost = () => {
        return title && content;
    }

    const handleNewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
  
        if (file) {
          setCoverImg(file);
        }
    }

    const onClick = async () => {
        if(!(intro && title && content && coverImg)){
            return;
        }

        try {
            // grab id earlier to do less crud
            const post = await createPost.mutateAsync({
                title: title,
                content: content,
                intro: intro
            })
            const url = await getBucket.mutateAsync({
                id: post.id
            })
            const res = await fetch(url, {method: 'PUT', body: coverImg});
            await updateImageURL.mutateAsync({
                id: post.id,
                url: new URL(res.url).origin + new URL(res.url).pathname
            })

            await router.push('/')
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Header />
            <main className="px-4 sm:px-24 py-4 flex flex-col items-center justify-center h-full w-full">
                {user && 
                <div className="flex flex-col items-center justify-center gap-6 w-full sm:w-3/4 lg:w-1/2">
                    <input type="text" placeholder="Title" name="Title" onChange={(e) => setTitle(e.target.value)} className="font-serif w-full text-2xl h-10 rounded-md outline-none" />
                    <textarea placeholder="Tell your story..." name="Content" onChange={(e) => setContent(e.target.value)} className="font-serif w-full h-96 rounded-md resize-none overflow-y-scroll outline-none" />
                    <button onClick={handlePostClick} className={`w-24 rounded-full px-4 py-2 bg-green-700 hover:bg-green-900 text-white w-24 ${!canPost() && "bg-green-700/30 hover:bg-green-700/30 cursor-not-allowed"}`}>
                        Post
                    </button>
                </div>}
            </main>
            {publishStoryMenu && 
            <div className="absolute flex items-center justify-center w-screen h-screen top-0 left-0 bg-white">
                <div className="sm:w-3/4 sm:h-1/2 lg:w-1/2 px-2 flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-12">
                    <div className="flex flex-col gap-2">
                        <h2 className="font-semibold">
                            Story Preview
                        </h2>
                        <label htmlFor="cover-pic" className={`bg-black/5 ${coverImg && "bg-transparent"} text-black/30 h-[200px] cursor-pointer flex flex-row justify-center items-center text-center px-12`}>
                            {coverImg ? <Image src={URL.createObjectURL(coverImg)} alt="Chosen cover picture" height={32} width={32} className="h-full w-auto"/> :
                            <p>Include a high-quality image in your story to make it more inviting to readers.</p>}
                            <input type='file' id='cover-pic' onChange={(e) => handleNewFile(e)} className="hidden"></input>
                        </label>
                        <h1 className="text-lg font-semibold border-b border-gray-300">
                            {title}
                        </h1>
                        <input placeholder="Write a preview subtitle..." onChange={(e) => setIntro(e.target.value)} className="bg-transparent text-sm border-b border-gray-300 outline-none"/>
                        <p className="text-gray-400 text-sm">
                            <span className="text-gray-600 font-semibold">Note:</span> Changes here will affect how your story appears in public places like Medium’s homepage and in subscribers’ inboxes — not the contents of the story itself.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-black/50">
                            Publishing to: <span className="text-black font-semibold">{user?.name}</span>
                        </h1>
                        <p className="text-sm text-black/80">
                            Add or change topics (up to 5) so readers know what your story is about
                        </p>
                        <input className="h-[50px] outline-none bg-black/5 px-2 text-sm cursor-not-allowed" placeholder="Add a topic..."/>
                        <p className="text-sm text-black/40 py-4">
                            <span className="underline">Learn more</span> about what happens to your post when you publish.
                        </p>
                        <button className={`bg-green-700 hover:bg-green-900 text-white rounded-full w-[110px] py-2 text-sm ${!intro && "bg-green-700/30 hover:bg-green-700/30 cursor-not-allowed"}`} onClick={onClick}>Publish now</button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 md:top-48 md:right-32 lg:right-64 cursor-pointer" onClick={() => setPublishStoryMenu(false)}>
                    <CloseSVG />
                </div>
            </div>}
        </>
    )
}