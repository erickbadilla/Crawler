export const chunkArray = <T>(array: T[], desiredChunks: number): T[][] => {
  const chunksSpaces: T[][] = [];
  const idealBucketSize: number = Math.floor(array.length / desiredChunks);

  let chuckBucketIndex = 0;

  for (let i = 0; i < array.length; i++) {
    if (!chunksSpaces[chuckBucketIndex]) {
      chunksSpaces[chuckBucketIndex] = [];
    }

    chunksSpaces[chuckBucketIndex].push(array[i]);

    if (chunksSpaces[chuckBucketIndex].length === idealBucketSize) {
      chuckBucketIndex++;
    }
  }

  return chunksSpaces;
};
