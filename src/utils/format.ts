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

//arbitrarily calculates how long an article is going to take in minutes
const getReadingTime = (body: string) => {
  const words = body.split(' ');
  const readingTime = Math.ceil(words.length / 200);
  return readingTime;
}

const getReadableDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const getDefaultImgURL = () => {
  return "https://lyra-bucket.s3.amazonaws.com/default.png"
}

export { cacheBustImgURL, getReadingTime, getReadableDate, getDefaultImgURL };