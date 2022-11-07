import { openSync, writeSync, closeSync } from 'fs';
import { DownloadOptions } from 'uplink-nodejs';
import { BUFFER_SIZE } from '../../app/constants';

import type { DownloadFunction } from './download.types';

export const download: DownloadFunction = async ({
  project,
  action,
  inputs,
}) => {
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

export default download;
