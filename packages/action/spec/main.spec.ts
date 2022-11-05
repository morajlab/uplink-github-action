import { faker } from '@faker-js/faker';
import { callFunction, exported_functions } from '../src/app';

import type { IInputParams, IActionObject } from '../src/app';

const action: IActionObject = {
  setOutput(name, value) {
    console.log(`${name}: ${value}`);
  },
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
          console.log(`>> WARNING:: ${message}`);
        }

        test.skip(name, fn);
      })();

describe('Test Uplink Github action', () => {
  describe('Test input data', () => {
    let fake_data: IInputParams;

    const expectCallFunction = (fn_name?: string) => {
      if (fn_name) {
        fake_data.function.value = fn_name;
      }

      return expect(callFunction(fake_data, action));
    };

    beforeEach(() => {
      fake_data = {
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
        `function '${fake_data.function.value}' is invalid.`
      );
    });

    test("Test 'api_key', 'passphrase', 'satellite_url'", async () => {
      const expect_result = await expectCallFunction(
        Object.keys(exported_functions)[0]
      ).rejects;

      expect_result.toThrow();
      expect_result.not.toThrow(
        `function '${fake_data.function.value}' is invalid.`
      );
    });

    testif(
      'Test valid input data',
      process.env.UPLINK_API_KEY &&
        process.env.UPLINK_PASSPHRASE &&
        process.env.UPLINK_SATELLITE_URL
        ? true
        : false,
      "For passing this test you should set 'UPLINK_API_KEY', 'UPLINK_PASSPHRASE' and 'UPLINK_SATELLITE_URL' environment variables",
      async () => {
        fake_data = {
          api_key: {
            value: process.env.UPLINK_API_KEY,
          },
          passphrase: {
            value: process.env.UPLINK_PASSPHRASE,
          },
          satellite_url: {
            value: process.env.UPLINK_SATELLITE_URL,
          },
          function: {},
        };

        await expectCallFunction(
          Object.keys(exported_functions)[2]
        ).resolves.not.toThrow();
      }
    );
  });
});
