import type { ProjectResultStruct } from 'uplink-nodejs/dist/project';
import type { InputOptions } from '@actions/core';

export interface IInputParam {
  value?: string;
  options?: InputOptions;
}
export interface IInputParams {
  function: IInputParam;
  satellite_url: IInputParam;
  api_key: IInputParam;
  passphrase: IInputParam;
}

export interface IFunctionParams {
  project: ProjectResultStruct;
  inputs?: IInputParams;
}

export interface IExportedFunctions {
  [key: string]: (params: IFunctionParams) => void;
}

export type CallFunctionType = (param: IInputParams) => void;
