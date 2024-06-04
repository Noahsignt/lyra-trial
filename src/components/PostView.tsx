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
        <Link href={`/post/${post.id}`} key={post.id} className="w-3/4">
            <div className="bg-white p-4 rounded-md flex flex-col gap-4 px-4">
                {post.img && post.name && 
                <div className="flex items-center gap-2">
                    <img src={post.img} alt={post.name} className="w-8 h-8 rounded-full" />
                    <p className="text-sm">{post.name}</p>
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

