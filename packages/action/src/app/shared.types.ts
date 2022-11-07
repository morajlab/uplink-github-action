import type { InputOptions, setOutput, info } from '@actions/core';
import type { ProjectResultStruct } from 'uplink-nodejs/dist/project';
import type {
  IUploadInputParams,
  UploadFunction,
} from './functions/upload.types';
import type {
  IDownloadInputParams,
  DownloadFunction,
} from './functions/download.types';
import type {
  IListBucketsInputParams,
  ListBucketsFunction,
} from './functions/listBuckets.types';
import type {
  IListFilesInputParams,
  ListFilesFunction,
} from './functions/listFiles.types';

export interface IActionObject {
  setOutput: typeof setOutput;
  info: typeof info;
}

export interface IInputParamType {
  value?: string;
  options?: InputOptions;
}

export interface ISharedInputParams {
  function: IInputParamType;
  satellite_url: IInputParamType;
  api_key: IInputParamType;
  passphrase: IInputParamType;
}

export interface IExportedFunctions {
  [key: string]:
    | UploadFunction
    | DownloadFunction
    | ListBucketsFunction
    | ListFilesFunction;
}

export type InputParams = ISharedInputParams &
  Partial<IUploadInputParams> &
  Partial<IDownloadInputParams> &
  Partial<IListBucketsInputParams> &
  Partial<IListFilesInputParams>;

export interface IFunctionParams<T> {
  project: ProjectResultStruct;
  action: IActionObject;
  inputs?: ISharedInputParams & T;
}

export type ExportedFunctionType<T> = (
  params: IFunctionParams<T>
) => Promise<void>;
