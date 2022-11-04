import { Uplink, ListBucketsOptions } from 'uplink-nodejs';

import type {
  IExportedFunctions,
  IFunctionParams,
  CallFunctionType,
} from './action.types';

const upload = async ({ project }: IFunctionParams) => {};
const download = async ({ project }: IFunctionParams) => {};
const listBuckets = async ({ project }: IFunctionParams) => {
  const bucket_list = await project.listBuckets(new ListBucketsOptions());

  console.log(bucket_list);
};
const listFiles = async ({ project }: IFunctionParams) => {};

const exported_functions: IExportedFunctions = {
  upload,
  download,
  list_buckets: listBuckets,
  list_files: listFiles,
};

export const callFunction: CallFunctionType = async (inputs) => {
  const function_type = inputs.function.value;

  if (!Object.keys(exported_functions).includes(function_type.toLowerCase())) {
    throw new Error(`function '${function_type}' is invalid.`);
  }

  const uplink = new Uplink();
  const access = await uplink.requestAccessWithPassphrase(
    inputs.satellite_url.value,
    inputs.api_key.value,
    inputs.passphrase.value
  );
  const project = await access.openProject();

  exported_functions[function_type.toLowerCase()]({ project, inputs });
};
