import type { ProjectResultStruct } from 'uplink-nodejs/dist/project';
import type { InputOptions } from '@actions/core';

export interface IInputParam {
  [key: string]: {
    value?: string;
    options?: InputOptions;
  };
}

export interface IFunctionParams {
  project: ProjectResultStruct;
}

export interface IExportedFunctions {
  [key: string]: (params: IFunctionParams) => void;
}

export type CallFunctionType = () => void;
