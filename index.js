/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/en');
const { unflatten } = require('flat');
const { typeToMethodMap, commonFieldsToFakerMap } = require('./lib/mapper');
const { isMongooseSchema } = require('./lib/utils');

const { Decimal128 } = mongoose;

/**
 * Extract min/max validator values for String & Number schema types
 * Min/Max can be a Number or Array
 * @param {Number | Array} validator
 * @returns
 */
function _getMinMaxFromSchema(validator) {
  if (Array.isArray(validator)) {
    return validator[0];
  }
  return validator;
}
/**
 * Get mock value from faker for given field type
 * @param {string} fieldName
 * @param {string} fieldType
 * @param {object} fakerOptions
 */
function _getMockValue(fieldName, fieldType, fakerOptions = {}) {
  let fakerMethod = typeToMethodMap[fieldType];
  const commonFields = Object.keys(commonFieldsToFakerMap);
  const matchingCommonField = commonFields.find((field) => fieldName.toLowerCase().includes(field));
  const {
    min, max, minLength, maxLength,
  } = fakerOptions;

  if (fakerOptions.enum && fakerOptions.enumValues) {
    // TODO=> Validate if enum values follow min/max validations
    return faker.helpers.arrayElement(fakerOptions.enumValues);
  }

  if (min || max) {
    const options = {
      ...(min && { min }),
      ...(max && { max }),
    };
    return faker[fakerMethod.module][fakerMethod.type](options);
  }

  if (minLength || maxLength) {
    const options = {
      ...(minLength && { min: minLength }),
      ...(maxLength && { max: maxLength }),
    };
    /**
     * Using different faker module since word.sample will error/return incorrect value
     * when it can't find word within given min/max range in its corpus
     */
    return faker.string.sample(options);
  }

  if (matchingCommonField) {
    fakerMethod = commonFieldsToFakerMap[matchingCommonField];
    return faker[fakerMethod.module][fakerMethod.type]();
  }

  if (fakerMethod) {
    return faker[fakerMethod.module][fakerMethod.type]();
  }

  if (fieldType === 'Buffer') {
    return Buffer.from(faker.string.alphanumeric(), 'utf-8');
  }
  // Fallback/default faker value
  return faker.string.sample();
}

/**
 * Use mongoose field options like enum, min, max etc to form options to use while
 * creating faker object
 * @param {object} mongooseField
 */
function _constructFakerOptions(mongooseField) {
  const fakerOptions = {};
  const mongooseValidators = ['min', 'max', 'minLength', 'maxLength'];
  /**
   * Using options.enum instead of enumValues at root level of field definition
   * since enumValues is not available in case of nested schemas.
   */
  if (mongooseField?.options?.enum) {
    fakerOptions.enum = true;
    fakerOptions.enumValues = mongooseField.options.enum;
  }
  if (mongooseField?.options) {
    for (const validator of mongooseValidators) {
      fakerOptions[validator] = _getMinMaxFromSchema(mongooseField.options[validator]);
    }
  }

  return fakerOptions;
}

/**
 * Handle Array fields - There are two types here
 * 1. Array of mongoose primitive data types
 * 2. Array of subdocuments with its own schema
 * @param {*} schemaField - Field in mongoose schema of type array
 * @param {string} fieldName  - Name of the array field
 */
function _mockArrayDataType(schemaField, fieldName) {
  if (schemaField.schema) {
    // eslint-disable-next-line no-use-before-define
    return [generateMock(schemaField.schema)];
  }
  const fieldType = schemaField.$embeddedSchemaType.instance;
  return [_getMockValue(fieldName, fieldType)];
}
/**
 * Create a mock object based on mongoose schema
 * @param {*} schema - mongoose schema
 * @param {object} options -  options from client for mock generation
 */
function generateMock(schema) {
  if (!schema || !isMongooseSchema(schema)) {
    throw new Error('Valid mongoose schema is required to generate mock');
  }

  const mock = {};
  for (const fieldName in schema.paths) {
    const field = schema.paths[fieldName];
    const fieldType = field.instance;
    // Handle nested schemas
    if (fieldType === 'Embedded') {
      mock[fieldName] = generateMock(field.schema);
    } else if (fieldType === 'Array') {
      mock[fieldName] = _mockArrayDataType(field, fieldName);
    } else {
      const fakerOptions = _constructFakerOptions(field);
      mock[fieldName] = _getMockValue(fieldName, fieldType, fakerOptions);
    }
  }
  return unflatten(mock, { safe: true });
}

// Example usage
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  zipCode: String,
});

const fiel931Schema = new mongoose.Schema({
  field9311: {
    type: String,
    enum: ['Hey', 'there'],
  },
  field9312: {
    type: Number,
    min: 10,
    max: 12,
  },
  field9313: {
    type: String,
    minLength: 5,
    maxLength: 15,
  },
});

const field9Schema = new mongoose.Schema({
  field91: {
    type: Number,
    enum: [42, 69, 420],
  },
  field92: {
    type: Number,
    min: 1000,
    max: 1050,
  },
  field93: {
    field931: fiel931Schema,
  },
  field94: {
    type: String,
    minLength: 50,
    maxLength: 500,
  },
});
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phoneNumber: String,
  firstName: { type: String, required: true },
  lastName: {
    type: String,
    minLength: 5,
    maxLength: 200,
  },
  age: {
    type: Number,
    min: [10, 'Become an adult bruh'],
    max: 100,
  },
  birthDate: Date,
  isActive: Boolean,
  address: addressSchema,
  hobbies: [
    {
      name: {
        type: String,
      },
      years: {
        type: Number,
        enum: [1995, 2000, 2010, 2020, 2025],
      },
    },
  ],
  salary: Decimal128,
  accountBalance: Decimal128,
  field1: {
    field2: {
      field4: Date,
      field6: {
        field7: {
          type: String,
          enum: ['either this', 'or that'],
        },
        field9: field9Schema,
      },
    },
    field3: Number,
  },
});
const mockUserAllFields = generateMock(userSchema);
console.log(JSON.stringify(mockUserAllFields, null, 2));

module.exports.generateMock = generateMock;
