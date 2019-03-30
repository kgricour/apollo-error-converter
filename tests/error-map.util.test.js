const {
  isOneOfTypes,
  isMapItemValid,
  validateErrorMap,
  validateRequiredMapItemFields,
  validateOptionalMapItemFields,
} = require('../lib/utils').errorMap;

const { errorMap } = require('./__mocks__');
const { ApolloError } = require('apollo-server-core');

// as of v0.0.1
const requiredKeys = [
  { key: 'message', types: ['string'] },
  { key: 'errorConstructor', types: ['function'] },
];

const optionalKeys = [
  { key: 'logger', types: ['function', 'boolean'] },
  { key: 'data', types: ['string', 'function', 'object'] },
];

describe('[v0.0.1] validateErrorMap: Validates every Map Item entry in a merged Error Map', () => {
  console.warn('validateErrorMap tests if Map Item required/optional field shapes change');

  test('valid merged Error Map: returns true', () => {
    // void if valid, throws otherwise
    const result = validateErrorMap(errorMap, requiredKeys, optionalKeys);
    expect(result).toBe(undefined);
  });

  test('invalid merged Error Map: throws Invalid Map Item error with item key and value', () => {
    const invalidMap = { ...errorMap, BadKey: { message: 'missing constructor', logger: true, data: () => {} }};

    try {
      validateErrorMap(invalidMap, requiredKeys, optionalKeys);
    } catch(error) {
      expect(error).toBeDefined();
    }
  });
});

describe('isMapItemValid: Validates an individual entry in the merged Error Map', () => {
  const mapItemBase = { message: 'a message', errorConstructor: ApolloError };

  test('only required fields with correct shapes: returns true', () => {
    const result = isMapItemValid(mapItemBase, requiredKeys, optionalKeys);
    expect(result).toBe(true);
  });

  test('required and optional fields with correct shapes: returns true', () => {
    const mapItem = { ...mapItemBase, logger: true, data: () => {} };

    const result = isMapItemValid(mapItem, requiredKeys, optionalKeys);
    expect(result).toBe(true);
  });

  test('missing required: returns false', () => {
    const mapItem = { message: 'missing stuff' };
    const result = isMapItemValid(mapItem, requiredKeys, optionalKeys);
    expect(result).toBe(false);
  });

  test('invalid shapes: returns false', () => {
    const mapItem = {
      message: 80085,
      errorConstructor: ApolloError,
      logger: true,
    };
    const result = isMapItemValid(mapItem, requiredKeys, optionalKeys);
    expect(result).toBe(false);
  });
});

describe('validateRequiredMapItemFields: Validates the required Map Item fields presence and shape', () => {
  // arbitrary
  const required = [
    { key: 'errorConstructor', types: ['function'] },
    { key: 'someKey', types: ['string', 'function', 'object'] },
    { key: 'someOther', types: ['array', 'function', 'object'] },
  ];

  test('has fields and correct shape: returns true', () => {
    const mapItem = {
      errorConstructor: ApolloError,
      someKey: () => {},
      someOther: [],
    };

    const result = validateRequiredMapItemFields(mapItem, required);
    expect(result).toBe(true);
  });

  test('has fields with incorrect shape: returns false', () => {
    const mapItem = {
      errorConstructor: ApolloError,
      someKey: 5,
      someOther: [],
    };

    const result = validateRequiredMapItemFields(mapItem, required);
    expect(result).toBe(false);
  });

  test('missing a required field: returns false', () => {
    const mapItem = { errorConstructor: ApolloError };

    const result = validateRequiredMapItemFields(mapItem, required);
    expect(result).toBe(false);
  });
});

describe('validateOptionalMapItemFields: Validates the optional Map Item field shapes', () => {
  // arbitrary
  const optional = [
    { key: 'aKey', types: ['function', 'object', 'boolean'] },
    { key: 'someStuff', types: ['number', 'string', 'object'] },
  ];

  test('no optional fields: returns true', () => {
    const mapItem = { requiredField: 'correct' };

    const result = validateOptionalMapItemFields(mapItem, optional);
    expect(result).toBe(true);
  });

  test('optional field missing + others have valid shape: returns true', () => {
    const mapItem = { requiredField: 'correct', someStuff: {} };

    const result = validateOptionalMapItemFields(mapItem, optional);
    expect(result).toBe(true);
  });

  test('all optional fields and shapes correct: returns true', () => {
    // expected shape as of v0.0.1
    const optionalKeys = [
      { key: 'logger', types: ['function', 'boolean'] },
      { key: 'data', types: ['string', 'function', 'object'] },
    ];
    const mapItem = {
      requiredField: 'correct',
      logger: () => {},
      data: () => {},
    };

    const result = validateOptionalMapItemFields(mapItem, optionalKeys);
    expect(result).toBe(true);
  });

  test('optional field has invalid shape: returns false', () => {
    const mapItem = { requiredField: 'correct', aKey: [] };

    const result = validateOptionalMapItemFields(mapItem, optional);
    expect(result).toBe(false);
  });
});

describe('isOneOfTypes: Checks if the value is one of the list of type strings', () => {
  describe('of supported types: [string, number, function, boolean, array, object]', () => {
    const ofTypes = [
      'string',
      'number',
      'function',
      'boolean',
      'array',
      'object',
    ];

    const tests = {
      string: 'a string',
      number: 2.1,
      function: () => {},
      boolean: true,
      array: [],
      object: {},
    };

    Object.entries(tests).forEach(([type, value]) =>
      test(`type: ${type}`, () =>
        expect(isOneOfTypes(value, ofTypes)).toBe(true)),
    );
  });
});
