import type { ProjectResultStruct } from 'uplink-nodejs/dist/project';
import type { InputOptions, setOutput, info } from '@actions/core';

export interface IActionObject {
  setOutput: typeof setOutput;
  info: typeof info;
}

export type NormalizePathFunction = (path: string) => string;

export interface IInputParamType {
  value?: string;
  options?: InputOptions;
}

export interface IUploadInputParams {
  bucket: IInputParamType;
  src: IInputParamType;
  dest?: IInputParamType;
}
export interface IDownloadInputParams {}
export interface IListBucketsInputParams {}
export interface IListFilesInputParams {}

export interface ISharedInputParams {
  function: IInputParamType;
  satellite_url: IInputParamType;
  api_key: IInputParamType;
  passphrase: IInputParamType;
}

export interface IFunctionParams<T> {
  project: ProjectResultStruct;
  action: IActionObject;
  inputs?: ISharedInputParams & T;
}

export type InputParams = ISharedInputParams &
  Partial<IUploadInputParams> &
  Partial<IDownloadInputParams> &
  Partial<IListBucketsInputParams> &
  Partial<IListFilesInputParams>;
export interface ICallFunctionParams {
  inputs: InputParams;
  action: IActionObject;
}
export type CallFunction = (params: ICallFunctionParams) => Promise<void>;

export type ExportedFunctionType<T> = (
  params: IFunctionParams<T>
) => Promise<void>;

export type UploadFunction = ExportedFunctionType<IUploadInputParams>;
export type DownloadFunction = ExportedFunctionType<IDownloadInputParams>;
export type ListBucketsFunction = ExportedFunctionType<IListBucketsInputParams>;
export type ListFilesFunction = ExportedFunctionType<IListFilesInputParams>;

export interface IExportedFunctions {
  [key: string]:
    | UploadFunction
    | DownloadFunction
    | ListBucketsFunction
    | ListFilesFunction;
}
