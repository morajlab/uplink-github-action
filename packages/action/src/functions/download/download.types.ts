import type { IUploadInputParams } from '../upload';
import type { ExportedFunctionType } from '../../types';

export interface IDownloadInputParams extends IUploadInputParams {}

export type DownloadFunction = ExportedFunctionType<IDownloadInputParams>;
