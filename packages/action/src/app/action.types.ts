import type { InputParams, IActionObject } from './shared.types';

export interface ICallFunctionParams {
  inputs: InputParams;
  action: IActionObject;
}
export type CallFunction = (params: ICallFunctionParams) => Promise<void>;
