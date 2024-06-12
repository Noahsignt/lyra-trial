//used to bust the cache when the img points to s3 bucket
const cacheBustImgURL = (url: string | null) => {
    if(!url){
      return '';
    }

    //lyra prefix for s3 bucket link
    const bucketPrefix = 'https://lyra';
    if(url.startsWith(bucketPrefix)){
      return `${url}?v=${new Date().getTime()}`;
    }

    return url;
  }

  export { cacheBustImgURL };