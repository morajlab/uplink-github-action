import { normalize } from 'path';

import type { NormalizePathFunction } from './helpers.types';

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

// const debug = (content: any) => {
//   console.log('>> DEBUG:: ', content);
// };
