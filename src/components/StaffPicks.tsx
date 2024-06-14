import { api } from "~/utils/api";

import { useRouter } from "next/router";

import LoadingSpinner from "./LoadingSpinner";

import Image from "next/image";

// top 3 posts shown currently
const StaffPicks = () => {
    const router = useRouter();
    const { data: posts, isLoading } = api.post.getAll.useQuery();

    return (
        <>
            {isLoading ? <LoadingSpinner /> : (
                <div className="flex flex-col gap-3">
                    <h1 className="py-2 font-medium">Staff Picks</h1>
                    {posts?.slice(0, 3).map((post) => (
                        <div key={post.id}>
                            <div className="flex flex-row gap-2 items-center text-xs">
                                <Image src={post.createdBy.image} alt={post.title} width={24} height={24} className="rounded-full h-6"/>
                                <p className="font-semibold cursor-pointer" onClick={async () => await router.push(`/user/${post.createdBy.email}`)}>{post.createdBy.name} <span className="text-black/60 font-normal">in</span> {post.createdBy.name}</p>
                            </div>
                            <h1 className="text-m font-semibold cursor-pointer" onClick={async () => await router.push(`/post/${post.id}`)}>{post.title}</h1>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}

export default StaffPicks;