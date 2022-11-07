import { normalize, basename, join } from 'path';
import {
  Uplink,
  ListBucketsOptions,
  UploadOptions,
  DownloadOptions,
} from 'uplink-nodejs';
import {
  openSync,
  statSync,
  readSync,
  closeSync,
  accessSync,
  writeSync,
  constants,
} from 'fs';

import type {
  IExportedFunctions,
  UploadFunction,
  DownloadFunction,
  ListBucketsFunction,
  ListFilesFunction,
  CallFunction,
  NormalizePathFunction,
} from './action.types';

const BUFFER_SIZE: number = 80000;

// const debug = (content: any) => {
//   console.log('>> DEBUG:: ', content);
// };

export const normalizePath: NormalizePathFunction = (path) => {
  const bad_paths: string[] = ['.', './', '/'];
  let new_path = normalize(path);

  // TODO: Complete function
  for (const p of bad_paths) {
    if (new_path === p) {
      return '';
    }
  }

  return new_path;
};

const upload: UploadFunction = async ({ project, action, inputs }) => {
  const { dest, bucket, src } = inputs;

  for (const [key, input] of Object.entries({ bucket, src })) {
    if (!input || !input?.value || input?.value.trim().length === 0) {
      throw new Error(`Input item '${key}' is required !`);
    }
  }

  accessSync(src.value, constants.R_OK);

  let _dest: string = basename(src.value);

  if (dest?.value && dest?.value.trim().length > 0) {
    dest.value = normalizePath(dest.value);

    if (dest.value.length > 0) {
      if (dest.value.endsWith('/')) {
        _dest = join(dest.value, _dest);
      } else {
        _dest = dest.value;
      }
    }
  }

  const options = new UploadOptions();

  options.expires = 0;

  const upload_object = await project.uploadObject(
    bucket.value,
    _dest,
    options
  );
  let loop: boolean = true;
  let bytesRead: number = 0;
  let buffer = Buffer.alloc(BUFFER_SIZE);
  let fileHandle = openSync(src.value, 'rs');
  const size = {
    actuallyWritten: 0,
    file: statSync(src.value).size,
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

  await upload_object.commit();
  const info_object = await upload_object.info();

  action.info(
    `Object Name : ${info_object.key}\nObject Size : ${info_object.system.content_length}`
  );

  closeSync(fileHandle);
};
const download: DownloadFunction = async ({ project, action, inputs }) => {
  const { bucket, src, dest } = inputs;
  const options = new DownloadOptions();

  options.offset = 0;
  options.length = -1;

  const download_object = await project.downloadObject(
    bucket.value,
    src.value,
    options
  );

  let object_size: number = 0;

  const info_object = await download_object.info();
  object_size = info_object.system.content_length;
  let buffer = Buffer.alloc(BUFFER_SIZE);
  let file_handle = openSync(dest.value, 'w');
  let loop = true;
  const size = {
    actuallyWritten: 0,
    downloaded: 0,
    totalWritten: 0,
  };

  while (loop) {
    if (
      object_size - size.totalWritten > 0 &&
      object_size - size.totalWritten < BUFFER_SIZE
    ) {
      buffer = Buffer.alloc(object_size - size.totalWritten);
    }

    try {
      const bytes_read = await download_object.read(buffer, buffer.length);

      size.downloaded = (bytes_read as any).bytes_read;
      size.actuallyWritten = writeSync(
        file_handle,
        buffer,
        0,
        size.downloaded,
        size.totalWritten
      );
      size.totalWritten += size.actuallyWritten;

      if (size.actuallyWritten >= object_size) {
        loop = false;
      }

      if (size.totalWritten > 0 && object_size > 0) {
        action.info(
          `File Dowloaded : ${(
            (Number(size.totalWritten) / Number(object_size)) *
            100
          ).toFixed(4)} %`
        );
      }
    } catch (error) {
      loop = false;

      throw error;
    }

    if (size.totalWritten >= object_size) {
      break;
    }
  }

  closeSync(file_handle);
  await download_object.close();
  action.info('Object Downloaded Successfully');
};
const listBuckets: ListBucketsFunction = async ({ project, action }) => {
  const bucket_list = await project.listBuckets(new ListBucketsOptions());

  // debug(bucket_list);
  action.setOutput('output', bucket_list);
};
const listFiles: ListFilesFunction = async ({ project }) => {};

export const exported_functions: IExportedFunctions = {
  upload,
  download,
  list_buckets: listBuckets,
  list_files: listFiles,
};

export const callFunction: CallFunction = async ({ inputs, action }) => {
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
  } as any);

  await project.close();
};
