import { api } from "~/utils/api";

import Image from "next/image";

import LoadingSpinner from "./LoadingSpinner";

//gets first 3 authors
const WhoToFollow = () => {
    const { data: users, isLoading } = api.user.getThreeUsers.useQuery();

    return (
        <div className="flex flex-col gap-2">
            <h1 className="font-medium py-2">
                Who to Follow
            </h1>
            {!isLoading ?
            <div>
                {users?.map((user) => (
                    <div key={user.id} className="grid grid-cols-7 items-center gap-2">
                        <Image src={user.image} alt={user.name} width={28} height={28} className="rounded-full h-7" />
                        <div className="flex flex-col col-start-2 col-end-6">
                            <h1 className="font-medium">{user.name}</h1>
                            <p className="text-sm text-gray-500 overflow-hidden">{user.bio}</p>
                        </div>
                        <div className="col-start-6 flex justify-start">
                            <button className="cursor-not-allowed border border-black rounded-full text-sm px-4 h-3/4">Follow</button>
                        </div>
                    </div>
                ))}
            </div>
            :<div className="flex justify-center items-center py-4">
                <LoadingSpinner />
            </div>
            }
        </div>
    )
}

export default WhoToFollow;