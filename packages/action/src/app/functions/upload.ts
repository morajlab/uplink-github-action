import { basename, join } from 'path';
import { UploadOptions } from 'uplink-nodejs';
import { normalizePath } from '../helpers';
import { BUFFER_SIZE } from '../constants';
import {
  accessSync,
  openSync,
  statSync,
  readSync,
  closeSync,
  constants,
} from 'fs';

import type { UploadFunction } from './upload.types';

export const upload: UploadFunction = async ({ project, action, inputs }) => {
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

export default upload;
