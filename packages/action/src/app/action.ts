import {
  openSync,
  statSync,
  readSync,
  closeSync,
  accessSync,
  constants,
} from 'fs';
import {
  Uplink,
  ListBucketsOptions,
  UploadOptions,
  CustomMetadataEntry,
  CustomMetadata,
} from 'uplink-nodejs';

import type {
  IExportedFunctions,
  IFunctionParams,
  CallFunctionType,
} from './action.types';

// const debug = (content: any) => {
//   console.log('>> DEBUG:: ', content);
// };

const upload = async ({ project, action, inputs }: IFunctionParams) => {
  const { dest, bucket, src } = inputs;

  for (const [key, value] of Object.entries({ dest, bucket, src })) {
    if (!value || value.trim().length === 0) {
      throw new Error(`Input item ${key} is required !`);
    }
  }

  accessSync(src, constants.R_OK);

  const BUFFER_SIZE: number = 80000;
  const options = new UploadOptions();

  options.expires = 0;

  const upload_object = await project.uploadObject(bucket, dest, options);
  let loop: boolean = true;
  let bytesRead: number = 0;
  let buffer = Buffer.alloc(BUFFER_SIZE);
  let fileHandle = openSync(src, 'rs');
  const size = {
    actuallyWritten: 0,
    file: statSync(src).size,
    toWrite: 0,
    totalWritten: 0,
  };

  while (loop) {
    size.toWrite = size.file - size.totalWritten;

    if (size.toWrite > BUFFER_SIZE) {
      size.toWrite = BUFFER_SIZE;
    } else if (size.toWrite === 0) {
      break;
    }

    bytesRead = readSync(
      fileHandle,
      buffer,
      0,
      size.toWrite,
      size.totalWritten
    );

    try {
      const write_object = await upload_object.write(buffer, bytesRead);
      size.actuallyWritten = write_object.bytes_written;
      size.totalWritten += size.actuallyWritten;

      if (size.totalWritten > 0 && size.file > 0) {
        action.info(
          'File Uploaded On Storj  : ' +
            ((Number(size.totalWritten) / Number(size.file)) * 100).toFixed(4) +
            ' %'
        );
      }
    } catch (error) {
      loop = false;

      throw error;
    }

    if (size.totalWritten >= size.file) {
      break;
    }
  }

  const customMetadataEntry1 = new CustomMetadataEntry();
  const customMetadataEntry2 = new CustomMetadataEntry();

  customMetadataEntry1.key = 'testing';
  customMetadataEntry1.key_length = customMetadataEntry1.key.length;
  customMetadataEntry1.value = 'testing1';
  customMetadataEntry1.value_length = customMetadataEntry1.value.length;

  customMetadataEntry2.key = 'value';
  customMetadataEntry2.key_length = customMetadataEntry2.key.length;
  customMetadataEntry2.value = 'value1';
  customMetadataEntry2.value_length = customMetadataEntry2.value.length;

  const customMetadata = new CustomMetadata();
  const customMetadataEntryArray = [customMetadataEntry1, customMetadataEntry2];

  customMetadata.count = customMetadataEntryArray.length;
  customMetadata.entries = customMetadataEntryArray;

  await upload_object.setCustomMetadata(customMetadata);
  await upload_object.commit();
  const info_object = await upload_object.info();

  action.info(
    `Object Name : ${info_object.key}\nObject Size : ${info_object.system.content_length}`
  );

  closeSync(fileHandle);
};
const download = async ({ project }: IFunctionParams) => {};
const listBuckets = async ({ project, action }: IFunctionParams) => {
  const bucket_list = await project.listBuckets(new ListBucketsOptions());

  // debug(bucket_list);
  action.setOutput('output', bucket_list);
};
const listFiles = async ({ project }: IFunctionParams) => {};

export const exported_functions: IExportedFunctions = {
  upload,
  download,
  list_buckets: listBuckets,
  list_files: listFiles,
};

export const callFunction: CallFunctionType = async (inputs, action) => {
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

  await exported_functions[function_type.toLowerCase()]({
    project,
    inputs,
    action,
  });
};
