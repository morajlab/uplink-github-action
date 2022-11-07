import type { InputOptions, setOutput, info } from '@actions/core';
import type { ProjectResultStruct } from 'uplink-nodejs/dist/project';

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

export interface IFunctionParams<T> {
  project: ProjectResultStruct;
  action: IActionObject;
  inputs?: ISharedInputParams & T;
}

export type ExportedFunctionType<T> = (
  params: IFunctionParams<T>
) => Promise<void>;
