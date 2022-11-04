import { faker } from '@faker-js/faker';
import { callFunction, exported_functions } from '../src/app';

import type { IInputParams } from '../src/app';

describe('Test Uplink Github action', () => {
  describe('Test input data', () => {
    let fake_data: IInputParams;

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
      await expect(callFunction(fake_data)).rejects.toThrow(
        `function '${fake_data.function.value}' is invalid.`
      );
    });

    test("Test 'api_key', 'passphrase', 'satellite_url'", async () => {
      fake_data.function.value = Object.keys(exported_functions)[0];

      const expect_result = await expect(callFunction(fake_data)).rejects;

      expect_result.toThrow();
      expect_result.not.toThrow(
        `function '${fake_data.function.value}' is invalid.`
      );
    });
  });
});
