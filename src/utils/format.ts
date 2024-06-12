//used to bust the cache when the img points to s3 bucket
const cacheBustImgURL = (url: string | null) => {
    if(!url){
    return '';
    }

    //lyra prefix for s3 bucket link
    const bucketPrefix = 'https://lyra';
    if (url.startsWith(bucketPrefix)) {
        const timestamp = Math.floor(Date.now() / 1000);
        return `${url}?v=${timestamp}`;
    }

  return url;
}

export { cacheBustImgURL };