import type { IInputParamType, ExportedFunctionType } from '../../types';

export interface IUploadInputParams {
  bucket: IInputParamType;
  src: IInputParamType;
  dest?: IInputParamType;
}

export type UploadFunction = ExportedFunctionType<IUploadInputParams>;
