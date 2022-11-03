import { Uplink, ListBucketsOptions } from 'uplink-nodejs';
import { getInput, setFailed } from '@actions/core';

import type {
  IExportedFunctions,
  IFunctionParams,
  CallFunctionType,
  IInputParam,
} from './main.types';

const inputs: IInputParam = {
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

const callFunction: CallFunctionType = async () => {
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

  await exported_functions[function_type.toLowerCase()]({ project });
};

async function run() {
  try {
    for (const input in inputs) {
      inputs[input].value = getInput(input, inputs[input].options);
    }

    await callFunction();
  } catch ({ message }) {
    setFailed(message);
  }
}

run();
