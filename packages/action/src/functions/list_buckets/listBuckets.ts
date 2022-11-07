import { ListBucketsOptions } from 'uplink-nodejs';

import type { ListBucketsFunction } from './listBuckets.types';

export const listBuckets: ListBucketsFunction = async ({ project, action }) => {
  const bucket_list = await project.listBuckets(new ListBucketsOptions());

  // debug(bucket_list);
  action.setOutput('output', bucket_list);
};

export default listBuckets;
