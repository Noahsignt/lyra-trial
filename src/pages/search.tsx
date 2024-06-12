import Header from "~/components/Header"
import LoadingSpinner from "~/components/LoadingSpinner"
import PostView from "~/components/PostView"

import { useSearchParams } from 'next/navigation'

import { api } from "~/utils/api"


const Search = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('q') ?? '';
    const { data: posts, isLoading } = api.post.getBySearch.useQuery({ search: searchTerm });

    return(
        <>
            <Header />
            <main className="py-16">
                {!isLoading ? 
                <div className="w-3/4 mx-auto">
                    <h1 className="text-4xl font-semibold text-black/60">Results for <span className="text-black">{searchTerm}</span></h1>
                    <div className="flex flex-col gap-4">
                        {posts?.map((post) => (
                            <PostView key={post.id} post={post} />
                        ))}
                    </div>
                </div> : 
                <div className="flex items-center justify-center">
                    <LoadingSpinner />
                </div>}
            </main>
        </>
    )
}

export default Search;