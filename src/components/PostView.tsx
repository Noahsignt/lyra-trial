import Link from "next/link";

import { useState } from "react";

import { useRouter } from "next/router";

interface PostViewProps {
    post: {
        id: number,
        name?: string,
        img?: string,
        title: string,
        content: string,
        createdAt: Date,
        updatedAt: Date,
        intro: string
    },
    onUserPage?: boolean
}

const EditSVG = () => {
    return (
        <svg width="25" height="25" fill="#718096"><path d="M5 12.5c0 .55.2 1.02.59 1.41.39.4.86.59 1.41.59.55 0 1.02-.2 1.41-.59.4-.39.59-.86.59-1.41 0-.55-.2-1.02-.59-1.41A1.93 1.93 0 0 0 7 10.5c-.55 0-1.02.2-1.41.59-.4.39-.59.86-.59 1.41zm5.62 0c0 .55.2 1.02.58 1.41.4.4.87.59 1.42.59.55 0 1.02-.2 1.41-.59.4-.39.59-.86.59-1.41 0-.55-.2-1.02-.59-1.41a1.93 1.93 0 0 0-1.41-.59c-.55 0-1.03.2-1.42.59-.39.39-.58.86-.58 1.41zm5.6 0c0 .55.2 1.02.58 1.41.4.4.87.59 1.43.59.56 0 1.03-.2 1.42-.59.39-.39.58-.86.58-1.41 0-.55-.2-1.02-.58-1.41a1.93 1.93 0 0 0-1.42-.59c-.56 0-1.04.2-1.43.59-.39.39-.58.86-.58 1.41z" fill-rule="evenodd"></path></svg>
    )
}

const PostView = (props: PostViewProps) => {
    const router = useRouter();

    const [ isDropdownOpen, setIsDropdownOpen ]= useState(false);
    const { post } = props;

    return (
        <Link href={`/post/${post.id}`} key={post.id} className="w-full">
            <div className="bg-white p-4 rounded-md flex flex-col gap-2 px-4 border-b-2 border-gray-200">
                {post.img && post.name && 
                <div className="flex items-center gap-1">
                    <img src={post.img} alt={post.name} className="w-5 h-5 rounded-full" />
                    <p className="text-xs">{post.name}</p>
                    <p>·</p>
                    <p className="text-xs italic">{post.createdAt.toLocaleDateString()}</p>
                </div>} 
                <div>
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                    <p className="text-gray-500">{post.intro}</p>
                    {props.onUserPage && 
                    <div className="flex justify-between text-gray-500 relative">
                        <p>Published on {post.createdAt.toLocaleDateString()}</p>
                        <button onClick={(e) => { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); }} className="text-gray-500">
                            <EditSVG />
                        </button>
                        {isDropdownOpen && (
                            <div className="flex flex-col gap-2  items-start absolute right-0 mt-8 mr-2 bg-white p-4 rounded-md border-2 border-gray-100 w-32 shadow">
                                <button onClick={(e) => {e.preventDefault(); router.push(`/post/${post.id}/edit`)}} className="text-gray-500 hover:text-gray-700 text-sm">Edit story</button>
                                <button onClick={(e) => {e.preventDefault();}} className="text-red-500 hover:text-red-700 text-sm">Delete story</button>
                            </div>
                        )}
                    </div>}
                </div>
            </div>
        </Link>
    )
}

export default PostView;

