import type { IUploadInputParams } from './upload.types';
import type { ExportedFunctionType } from '../shared.types';

export interface IDownloadInputParams extends IUploadInputParams {}

export type DownloadFunction = ExportedFunctionType<IDownloadInputParams>;
