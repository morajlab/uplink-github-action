import type { ProjectResultStruct } from 'uplink-nodejs/dist/project';
import type { InputOptions, setOutput } from '@actions/core';

export interface IActionObject {
  setOutput: typeof setOutput;
}

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
  action: IActionObject;
  inputs?: IInputParams;
}

export interface IExportedFunctions {
  [key: string]: (params: IFunctionParams) => void;
}

export type CallFunctionType = (
  param: IInputParams,
  action: IActionObject
) => void;
