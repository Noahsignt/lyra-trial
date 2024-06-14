import Link from "next/link";
import Image from "next/image";

import { useState } from "react";

import { useRouter } from "next/router";

import { PostVisibleSVG, PostNotVisibleSVG, EditSVG, SaveSVG} from "./Icons";

import { cacheBustImgURL, getReadingTime, getReadableDate } from "~/utils/format";

interface PostViewProps {
    post: {
        id: string,
        createdBy: {
            image: string | null,
            name: string
        }
        title: string,
        content: string,
        createdAt: Date,
        updatedAt: Date,
        intro: string,
        published: boolean
    },
    onUserPage?: boolean | undefined,
    onPostDeleted?: () => void,
    onPostPublishStatusChange?: (status: boolean) => void,
}

const PostView = ({post, onUserPage = false, onPostDeleted, onPostPublishStatusChange}: PostViewProps) => {
    const router = useRouter();

    const [ isDropdownOpen, setIsDropdownOpen ]= useState(false);

    return (
        <Link href={`/post/${post.id}`} key={post.id} className="w-full">
            <div className="bg-white p-4 rounded-md flex flex-col gap-4 px-4 border-b-2 border-gray-200">
                {post.createdBy.image && post.createdBy.name && 
                <div className="flex items-center gap-2">
                    <Image src={cacheBustImgURL(post.createdBy.image)} alt={post.createdBy.name} width={20} height={20} className="rounded-full h-5 object-cover" />
                    <div className="flex gap-1 items-center text-sm">
                        <p>{post.createdBy.name}</p>
                        <p>·</p>
                        <p className="text-black/70">{getReadableDate(post.createdAt)}</p>
                    </div>
                </div>} 
                <div>
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                    <p className="text-gray-500">{post.intro}</p>
                    {onUserPage ?
                    <div className="flex justify-between items-center text-gray-500 relative pt-2">
                        {post.published ? 
                        <div onClick={(e) => {e.preventDefault(); onPostPublishStatusChange && onPostPublishStatusChange(post.published);}}>
                            <PostVisibleSVG />
                        </div> : 
                        <div onClick={(e) => {e.preventDefault(); onPostPublishStatusChange && onPostPublishStatusChange(post.published);}}>
                            <PostNotVisibleSVG />
                        </div>}
                        <button onClick={(e) => { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); }} className="text-gray-500">
                            <EditSVG />
                        </button>
                        {isDropdownOpen && (
                            <div className="flex flex-col gap-2  items-start absolute right-0 mt-8 mr-2 bg-white p-4 rounded-md border-2 border-gray-100 w-32 shadow">
                                <button onClick={async (e) => {e.preventDefault(); await router.push(`/post/${post.id}/edit`)}} className="text-gray-500 hover:text-gray-700 text-sm">Edit story</button>
                                <button onClick={(e) => {e.preventDefault(); onPostDeleted ? onPostDeleted() : null; }} className="text-red-500 hover:text-red-700 text-sm">Delete story</button>
                            </div>
                        )}
                    </div> :
                    <div className="flex justify-between text-gray-600 pt-8 text-sm">
                        <p>{getReadingTime(post.content)} min read</p>
                        <div className="flex gap-2 cursor-not-allowed">
                            <SaveSVG />
                            <EditSVG />
                        </div>
                    </div>}
                </div>
            </div>
        </Link>
    )
}

export default PostView;

