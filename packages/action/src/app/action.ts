import { Uplink } from 'uplink-nodejs';

import { upload } from './functions/upload';
import { download } from './functions/download';
import { listBuckets } from './functions/listBuckets';
import { listFiles } from './functions/listFiles';

import type { CallFunction } from './action.types';
import type { IExportedFunctions } from './shared.types';

export const EXPORTED_FUNCTIONS: IExportedFunctions = {
  upload,
  download,
  list_buckets: listBuckets,
  list_files: listFiles,
};

export const callFunction: CallFunction = async ({ inputs, action }) => {
  const function_type = inputs.function.value;

  if (!Object.keys(EXPORTED_FUNCTIONS).includes(function_type.toLowerCase())) {
    throw new Error(`function '${function_type}' is invalid.`);
  }

  const uplink = new Uplink();
  const access = await uplink.requestAccessWithPassphrase(
    inputs.satellite_url.value,
    inputs.api_key.value,
    inputs.passphrase.value
  );
  const project = await access.openProject();

  await EXPORTED_FUNCTIONS[function_type.toLowerCase()]({
    project,
    inputs,
    action,
  } as any);

  await project.close();
};
