import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { api } from "~/utils/api";
import { cacheBustImgURL } from "~/utils/format";

import { CloseSVG } from "~/components/Icons";

import Header from "~/components/Header";
import LoadingSpinner from "~/components/LoadingSpinner";
import PostView from "~/components/PostView";

import { createServerSideHelpers } from '@trpc/react-query/server';
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import type { NextPage} from "next";
import superjson from 'superjson';
import { appRouter } from '~/server/api/root';
import { db } from '~/server/db';

export async function getStaticProps( context: GetStaticPropsContext<{ email: string }>, ) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {db, session: null},
    transformer: superjson, 
  });
  const email = context.params!.email;
  await helpers.user.getUserByEmail.prefetch({ email });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      email,
    },
    revalidate: 1,
  };
}

export const getStaticPaths: GetStaticPaths =  () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const Home : NextPage<PageProps> = (props) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: sessionData, status } = useSession();
  const { data: userData } = api.user.getUserByEmail.useQuery({ email: props.email })
  const { data: postsData, isLoading: isPostsLoading, refetch: refetchPosts } = api.post.getPostsByUserEmail.useQuery({ email: props.email })
  
  if(!userData) {
    return <div>404</div>
  }

  const isLoading = () => {
    return status === 'loading';
  }

  const isUsersPage = () => {
    return sessionData && sessionData.user.id === userData.id;
  }

    const { mutate: deletePost } = api.post.delete.useMutation({
      onSuccess: async () => {
          await refetchPosts();  
      },
      onError: (error) => {
          console.error("Error deleting post:", error);
      }
  });

  const { mutate: updatePostPublishStatus } = api.post.updatePostPublishStatus.useMutation({
    onSuccess: async () => {
        await refetchPosts();  
    },
    onError: (error) => {
        console.error("Error updating post:", error);
      }
  });

  const handlePostDeleted = async (id: string) => {
    deletePost({ id: id });
  };

  const handlePostPublishStatusChange = async (id: string, status: boolean) => {
    updatePostPublishStatus({ id: id, published: status });
  }

  //renders the card to edit profile details, overlaid over the page we are currently on. 
  const ProfileEditCard = ({ onClose } : {onClose: () => void}) => {
    const [name, setName] = useState(userData.name);
    const [bio, setBio] = useState(userData.bio);
    const [img, setImg] = useState<File | undefined>(undefined);
    const [imgUrl, setImgUrl] = useState(userData.image);
    const [hasChanged, setHasChanged] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { mutate: generateURL } = api.profilePicture.generatePresignedURL.useMutation();
    const { mutate: updateImage } = api.user.updateImage.useMutation();
    const { mutate: updateUserInfo } = api.user.updateInfo.useMutation();

    const utils = api.useUtils();

    useEffect(() => {
      setHasChanged(!(name === userData.name && bio === userData.bio && img === undefined));
    }, [name, bio, img]);

    //handles front-end state for new profile picture, updates preview so that user can see their selection
    const handleNewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
        setImg(file);
        const url = URL.createObjectURL(file)
        setImgUrl(url);
      }
    }

    //handles back-end state for submitting changes to name/bio/image
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      //nothing has changed, should never be able to get here
      if(!(hasChanged)){
        return;
      }

      setIsLoading(true);
      const promises = [];

      if(name !== userData.name || bio !== userData.bio){
        const updateUserPromise = new Promise<void>((resolve, reject) => {
          updateUserInfo({name: name, bio: bio}, {onSuccess: () => {
            resolve();
          }, onError: (error) => {
            reject(error);
          }})
        })

        promises.push(updateUserPromise);
      }

      //pass undefined as generateURL relys entirely on user ctx and no parameters
      if(img){
        const s3Promise = new Promise<void>((resolve, reject) => 
          generateURL(undefined, {onSuccess: (data: string) => { 
          setIsLoading(true);
          // unbound-method seems to be a bug here
          //eslint-disable-next-line @typescript-eslint/unbound-method
          fetch(data, {method: 'PUT', body: img}).then(res => {
            //update prisma link
            updateImage({
              //strip query string
              image: new URL(res.url).origin + new URL(res.url).pathname
            }, {onSuccess: () => {
              utils.user.invalidate().then(() => {
                resolve();
              }).catch(reject);
            }, onError: reject})
          }).catch(reject);
        }, onError: reject}));

        promises.push(s3Promise);
      }

      Promise.all(promises).then(() => {
        setIsLoading(false);
        onClose();
      }).catch(error => {
        console.log(error);
        setIsLoading(false);
      })
    }

    const SaveBtn = ({ isBtnLoading } : {isBtnLoading: boolean}) => {
      if(isBtnLoading) {
        return (
          <button className="opacity-50 cursor-not-allowed rounded-full border-2  px-3 py-2 text-white bg-green-600 hover:bg-green-800 text-sm">
            Saving
          </button>
        )
      }

      return hasChanged ? <button type="submit" className="rounded-full border-2  px-3 py-2 text-white bg-green-600 hover:bg-green-800 text-sm">
        Save
      </button> :
      <button className="opacity-50 cursor-not-allowed rounded-full border-2  px-3 py-2 text-white bg-green-600 hover:bg-green-800 text-sm">
        Save
      </button>
    }

    return (
      <div className="fixed top-0 left-0 w-screen h-screen z-10 bg-black/30 flex items-center justify-center" onClick={() => setIsEditOpen(false)}>
        <div className="relative w-full h-full sm:w-3/5 lg:w-2/5 sm:h-3/4 flex flex-col z-20 bg-white rounded-md py-8 opacity-100 gap-10" onClick={(e) => e.stopPropagation()}>
          <div className="absolute right-5 top-5 cursor-pointer" onClick={() => onClose()}>
            <CloseSVG />
          </div>
          <div className="flex justify-center">
            <h1 className="text-xl font-medium">
              Profile information
            </h1>
          </div>
        <form onSubmit={(e) => onSubmit(e)} className="flex flex-col px-8 gap-4 h-full">
          <p className="text-sm text-gray-400">Photo</p>
          <div className="flex py-2 gap-4 sm:gap-8">
            <Image src={`${cacheBustImgURL(imgUrl)}`} alt={`${userData.name}'s profile picture`} width={72} height={72} className="rounded-full h-16 sm:h-18 object-cover"/>
            <div className="flex flex-col justify-between">
              <div className="flex gap-4">
                <label htmlFor="pfp-upload" className="cursor-pointer bg-transparent text-sm font-light text-green-700 hover:text-green-900">
                  Update
                </label>
                <input id="pfp-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {handleNewFile(e)}} aria-label="Update profile picture"/>
                <button className="bg-transparent text-sm font-light text-red-500 hover:text-red-700">
                  Remove
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Recommended: Square JPG, PNG, or GIF, at least 1,000 pixels per side.
              </p>
            </div>
          </div>
          <label htmlFor="name" className="text-sm">Name*</label>
          <input type="text" name="name" onChange={(e) => {setName(e.target.value)}} value={name} className="bg-gray-100 rounded-md h-10 outline-black px-4"/>
          <label htmlFor="bio" className="text-sm">Short bio</label>
          <input type="text" name="bio" onChange={(e) => {setBio(e.target.value)}} value={bio} className="bg-gray-100 rounded-md h-10 outline-black px-4"/>
          <div className="flex justify-end items-end flex-grow gap-4">
            {isLoading ? <SaveBtn isBtnLoading={true} /> :
            <>
              <button onClick={() => onClose()} className="rounded-full border-2  px-3 py-2 border-green-600 text-green-600 hover:border-green-800 hover:text-green-800 text-sm">
                Cancel
              </button>
              <SaveBtn isBtnLoading={false} />
            </>
            }
          </div>
        </form>
      </div>
    </div>
    )
  }

  return (
    <>
      <Head>
        <title>{`${userData.name}'s Profile`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="mx-auto min-h-screen w-full lg:w-3/4">
        {!isLoading() ?
        <div className="grid grid-cols-4 min-h-screen">
          <div className="col-start-1 col-end-4 border-r-2 border-gray-100 px-8 py-16">
            <h1 className="text-4xl font-medium">
              {userData.name}
            </h1>
            <div className="py-8">
              {!isPostsLoading ? 
                <div>
                  {postsData?.map((post) => {
                    return <PostView key={post.id} post={post} onUserPage={isUsersPage() ?? false} onPostDeleted={() => handlePostDeleted(post.id)} onPostPublishStatusChange={(status) => handlePostPublishStatusChange(post.id, !status)}/>
                  })}
                </div> :
                <div className="flex justify-center items-center h-screen">
                  <LoadingSpinner />
                </div>}
            </div>
          </div> 
          <div className="flex flex-col items-start py-10 px-8 gap-4">
            <Image src={cacheBustImgURL(userData.image)} alt={`${userData.name}'s profile picture`} width={88} height={88} className="md:h-[88px] rounded-full object-cover"/>
            <div className="flex flex-col">
              <p className="font-medium">{userData.name}</p>
              <p className="text-black/70 text-sm">{userData.bio}</p>
            </div>
            {isUsersPage() ?
            <button className="bg-transparent text-green-700 hover:text-green-900" onClick={() => setIsEditOpen(true)}>
              Edit Profile
            </button> :
            <button className="opacity-50 cursor-not-allowed bg-green-600 text-white px-4 py-2 rounded-full text-sm">
              Follow
            </button>}
          </div>
        </div> :
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
        }
      </main>
      {isEditOpen && <ProfileEditCard onClose={() => setIsEditOpen(false)}/>}
    </>
  );
}

export default Home;
