import { upload } from './upload';
import { download } from './download';
import { listBuckets } from './list_buckets';
import { listFiles } from './list_files';

import type { IExportedFunctions } from './index.types';

export const EXPORTED_FUNCTIONS: IExportedFunctions = {
  upload,
  download,
  list_buckets: listBuckets,
  list_files: listFiles,
};

export * from './download';
export * from './upload';
export * from './list_buckets';
export * from './list_files';

export * from './index.types';
