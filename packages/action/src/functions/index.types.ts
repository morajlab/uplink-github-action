import type { UploadFunction, IUploadInputParams } from './upload';
import type { DownloadFunction, IDownloadInputParams } from './download';
import type {
  ListBucketsFunction,
  IListBucketsInputParams,
} from './list_buckets';
import type { ListFilesFunction, IListFilesInputParams } from './list_files';

export interface IExportedFunctions {
  [key: string]:
    | UploadFunction
    | DownloadFunction
    | ListBucketsFunction
    | ListFilesFunction;
}

export type ExportedFunctionsParams = Partial<IUploadInputParams> &
  Partial<IDownloadInputParams> &
  Partial<IListBucketsInputParams> &
  Partial<IListFilesInputParams>;
