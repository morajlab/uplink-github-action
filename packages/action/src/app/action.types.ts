import type { IActionObject, ISharedInputParams } from '../types';
import type { ExportedFunctionsParams } from '../functions';

export type InputParams = ISharedInputParams & ExportedFunctionsParams;

export interface ICallFunctionParams {
  inputs: InputParams;
  action: IActionObject;
}
export type CallFunction = (params: ICallFunctionParams) => Promise<void>;
