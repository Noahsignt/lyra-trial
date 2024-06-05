import Link from "next/link";

interface PostViewProps {
    post: {
        id: number,
        name?: string,
        img?: string,
        title: string,
        content: string,
        createdAt: Date,
        updatedAt: Date,
    }
}

const PostView = (props: PostViewProps) => {
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
                    <p>{post.content}</p>
                </div>
            </div>
        </Link>
    )
}

export default PostView;

