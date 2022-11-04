import { getInput, setFailed } from '@actions/core';
import { callFunction } from './app';

import { IInputParams } from './app';

const inputs: IInputParams = {
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
};

async function run() {
  try {
    for (const input in inputs) {
      inputs[input].value = getInput(input, inputs[input].options);
    }

    callFunction(inputs);
  } catch ({ message }) {
    setFailed(message);
  }
}

run();
