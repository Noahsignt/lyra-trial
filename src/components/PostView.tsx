import Link from "next/link";
import Image from "next/image";

import { useState } from "react";

import { useRouter } from "next/router";

import { cacheBustImgURL } from "~/utils/format";

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

const EditSVG = () => {
    return (
        <svg width="25" height="25" fill="#718096"><path d="M5 12.5c0 .55.2 1.02.59 1.41.39.4.86.59 1.41.59.55 0 1.02-.2 1.41-.59.4-.39.59-.86.59-1.41 0-.55-.2-1.02-.59-1.41A1.93 1.93 0 0 0 7 10.5c-.55 0-1.02.2-1.41.59-.4.39-.59.86-.59 1.41zm5.62 0c0 .55.2 1.02.58 1.41.4.4.87.59 1.42.59.55 0 1.02-.2 1.41-.59.4-.39.59-.86.59-1.41 0-.55-.2-1.02-.59-1.41a1.93 1.93 0 0 0-1.41-.59c-.55 0-1.03.2-1.42.59-.39.39-.58.86-.58 1.41zm5.6 0c0 .55.2 1.02.58 1.41.4.4.87.59 1.43.59.56 0 1.03-.2 1.42-.59.39-.39.58-.86.58-1.41 0-.55-.2-1.02-.58-1.41a1.93 1.93 0 0 0-1.42-.59c-.56 0-1.04.2-1.43.59-.39.39-.58.86-.58 1.41z" fill-rule="evenodd"></path></svg>
    )
}

const PostVisibleSVG = () => {
    return <svg fill="#4b5563" width="25" height="25" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
    <path d="M243.65527,126.37561c-.33886-.7627-8.51172-18.8916-26.82715-37.208-16.957-16.96-46.13281-37.17578-88.82812-37.17578S56.12891,72.20764,39.17188,89.1676c-18.31543,18.31641-26.48829,36.44531-26.82715,37.208a3.9975,3.9975,0,0,0,0,3.249c.33886.7627,8.51269,18.88672,26.82715,37.19922,16.957,16.95606,46.13378,37.168,88.82812,37.168s71.87109-20.21191,88.82812-37.168c18.31446-18.3125,26.48829-36.43652,26.82715-37.19922A3.9975,3.9975,0,0,0,243.65527,126.37561Zm-32.6914,34.999C187.88965,184.34534,159.97656,195.99182,128,195.99182s-59.88965-11.64648-82.96387-34.61719a135.65932,135.65932,0,0,1-24.59277-33.375A135.63241,135.63241,0,0,1,45.03711,94.61584C68.11133,71.64123,96.02344,59.99182,128,59.99182s59.88867,11.64941,82.96289,34.624a135.65273,135.65273,0,0,1,24.59375,33.38379A135.62168,135.62168,0,0,1,210.96387,161.37463ZM128,84.00061a44,44,0,1,0,44,44A44.04978,44.04978,0,0,0,128,84.00061Zm0,80a36,36,0,1,1,36-36A36.04061,36.04061,0,0,1,128,164.00061Z"/>
  </svg>
}

const PostNotVisibleSVG = () => {
    return (
        <div>
            <PostVisibleSVG />
            <div className="absolute top-0 left-1 text-gray-600 text-2xl p-1">
                /
            </div>
        </div>
    )
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
                    <div className="flex gap-1 items-center">
                        <p className="text-xs">{post.createdBy.name}</p>
                        <p>·</p>
                        <p className="text-xs italic">{post.createdAt.toLocaleDateString()}</p>
                    </div>
                </div>} 
                <div>
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                    <p className="text-gray-500">{post.intro}</p>
                    {onUserPage && 
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
                    </div>}
                </div>
            </div>
        </Link>
    )
}

export default PostView;

