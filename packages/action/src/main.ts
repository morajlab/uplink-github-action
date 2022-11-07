import * as action from '@actions/core';
import { accessSync, constants } from 'fs';
import { join, dirname } from 'path';
import { callFunction } from './app';

import type { InputParams } from './app';

const inputs: InputParams = {
  satellite_url: {
    options: {
      required: true,
      trimWhitespace: true,
    },
  },
  api_key: {
    options: {
      required: true,
      trimWhitespace: true,
    },
  },
  passphrase: {
    options: {
      required: true,
      trimWhitespace: true,
    },
  },
  function: {
    options: {
      required: true,
      trimWhitespace: true,
    },
  },
  bucket: {
    options: {
      required: false,
      trimWhitespace: true,
    },
  },
  dest: {
    options: {
      required: false,
      trimWhitespace: true,
    },
  },
  src: {
    options: {
      required: false,
      trimWhitespace: true,
    },
  },
};

const setLDEnVariable = () => {
  let error_msg: string = '';
  const sharedLibPaths: string[][] = [
    ['node_modules', 'uplink-nodejs', 'libuplinkcv1.2.4.so'],
    ['dist', 'libuplinkcv1.2.4.so'],
  ];

  for (const path of sharedLibPaths) {
    try {
      accessSync(join(...path), constants.R_OK);
      // TODO: Append 'LD_LIBRARY_PATH' value
      action.exportVariable('LD_LIBRARY_PATH', dirname(join(...path)));

      return;
    } catch ({ message }) {
      error_msg += message;
    }
  }

  throw new Error(error_msg);
};

async function run() {
  try {
    setLDEnVariable();

    for (const input in inputs) {
      inputs[input].value = action.getInput(input, inputs[input].options);
    }

    await callFunction({ inputs, action });
  } catch ({ message }) {
    action.setFailed(message);
  }
}

run();
