import { faker } from '@faker-js/faker';
import { callFunction } from '../src/app';

import type { IInputParams } from '../src/app';

describe('Test Uplink Github action', () => {
  describe('Test input data', () => {
    test('Test function type', async () => {
      const function_type: string = faker.random.word();
      const fake_data: IInputParams = {
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
          value: function_type,
        },
      };

      try {
        await callFunction(fake_data);
      } catch (error) {
        expect(error).toEqual(
          new Error(`function '${function_type}' is invalid.`)
        );
      }
    });
  });
});
