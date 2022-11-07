import * as chalk from 'chalk';
import { faker } from '@faker-js/faker';
import { resolve } from 'path';
import { callFunction } from '../src/app';
import { EXPORTED_FUNCTIONS } from '../src/functions';

import type { InputParams } from '../src/app';
import type { IUplinkEnVars } from './action.types';
import type { IActionObject } from '../src/types';

const UPLINK_ENVARS: IUplinkEnVars = {
  API_KEY: 'API_KEY',
  PASSPHRASE: 'PASSPHRASE',
  SATELLITE_URL: 'SATELLITE_URL',
};

// TODO: Add silent option
const action: IActionObject = {
  setOutput(name, value) {
    console.log(`${name}: ${value}`);
  },
  info(message) {
    console.log(message);
  },
};

const getUplinkEnvar = (key: string) => process.env[`UPLINK_${key}`];

const isUplinkEnVarsSetted = (): boolean => {
  for (const v of Object.keys(UPLINK_ENVARS)) {
    if (!getUplinkEnvar(v) || getUplinkEnvar(v).trim().length === 0) {
      return false;
    }
  }

  return true;
};

const testif = (
  name: string,
  condition: boolean,
  message: string = null,
  fn?: jest.ProvidesCallback,
  timeout?: number
) =>
  condition
    ? test(name, fn, timeout)
    : (() => {
        if (message) {
          name = `'${chalk.italic(name)}'.${chalk.dim(message)}`;
        }

        test.skip(name, fn);
      })();

jest.setTimeout(20000);

describe('Test Uplink Github action', () => {
  describe('Test input data', () => {
    let inputs: InputParams;

    const expectCallFunction = (fn_name?: string) => {
      if (fn_name) {
        inputs.function.value = fn_name;
      }

      return expect(callFunction({ inputs, action }));
    };

    beforeEach(() => {
      inputs = {
        api_key: {
          value: faker.random.alphaNumeric(50),
        },
        passphrase: {
          value: faker.lorem.sentence(),
        },
        satellite_url: {
          value: faker.internet.url(),
        },
        function: {
          value: faker.random.word(),
        },
      };
    });

    test('Test function type', async () => {
      await expectCallFunction().rejects.toThrow(
        `function '${inputs.function.value}' is invalid.`
      );
    });

    test("Test 'api_key', 'passphrase', 'satellite_url'", async () => {
      const expect_result = await expectCallFunction(
        Object.keys(EXPORTED_FUNCTIONS)[0]
      ).rejects;

      expect_result.toThrow();
      expect_result.not.toThrow(
        `function '${inputs.function.value}' is invalid.`
      );
    });

    testif(
      'Test valid input data',
      isUplinkEnVarsSetted(),
      "For passing this test you should set 'UPLINK_API_KEY', 'UPLINK_PASSPHRASE' and 'UPLINK_SATELLITE_URL' environment variables",
      async () => {
        inputs = {
          api_key: {
            value: getUplinkEnvar(UPLINK_ENVARS.API_KEY),
          },
          passphrase: {
            value: getUplinkEnvar(UPLINK_ENVARS.PASSPHRASE),
          },
          satellite_url: {
            value: getUplinkEnvar(UPLINK_ENVARS.SATELLITE_URL),
          },
          function: {},
        };

        await expectCallFunction(
          Object.keys(EXPORTED_FUNCTIONS)[2]
        ).resolves.not.toThrow();
      }
    );
  });

  testif(
    'Test upload() function',
    isUplinkEnVarsSetted(),
    "For passing this test you should set 'UPLINK_API_KEY', 'UPLINK_PASSPHRASE' and 'UPLINK_SATELLITE_URL' environment variables",
    async () => {
      const inputs: InputParams = {
        api_key: {
          value: getUplinkEnvar(UPLINK_ENVARS.API_KEY),
        },
        passphrase: {
          value: getUplinkEnvar(UPLINK_ENVARS.PASSPHRASE),
        },
        satellite_url: {
          value: getUplinkEnvar(UPLINK_ENVARS.SATELLITE_URL),
        },
        function: {
          value: 'upload',
        },
      };

      await expect(callFunction({ inputs, action })).rejects.toThrow(
        /^Input item \'\w+\' is required !$/
      );

      inputs.bucket = { value: faker.random.word() };
      inputs.src = { value: '/to/undefined/path' };

      await expect(callFunction({ inputs, action })).rejects.toThrow(
        /^ENOENT: no such file or directory/
      );
      await expect(callFunction({ inputs, action })).rejects.not.toThrow(
        /^Input item \'dest\' is required !$/
      );

      inputs.src = { value: resolve(__dirname, 'action.types.ts') };

      await expect(callFunction({ inputs, action })).rejects.toThrow();

      inputs.bucket = { value: 'beta' };

      await expect(callFunction({ inputs, action })).resolves.not.toThrow();
    },
    100000
  );
});
