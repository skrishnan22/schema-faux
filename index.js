/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/en');
const { unflatten } = require('flat');
const { typeToMethodMap, commonFieldsToFakerMap } = require('./lib/mapper');
const { isMongooseSchema } = require('./lib/utils');

const { Decimal128 } = mongoose;

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

  if (fakerOptions.enum && fakerOptions.enumValues) {
    return faker.helpers.arrayElement(fakerOptions.enumValues);
  }

  if (matchingCommonField) {
    fakerMethod = commonFieldsToFakerMap[matchingCommonField];
    return faker[fakerMethod.module][fakerMethod.type]();
  }

  if (fakerMethod) {
    return faker[fakerMethod.module][fakerMethod.type]();
  }

  return null;
}

/**
 * Use mongoose field options like enum, min, max etc to form options to use while
 * creating faker object
 * @param {object} mongooseField
 */
function _constructFakerOptions(mongooseField) {
  const fakerOptions = {};
  /**
   * Using options.enum instead of enumValues at root level of field definition
   * since enumValues is not available in case of nested schemas.
   */
  if (mongooseField?.options?.enum) {
    fakerOptions.enum = true;
    fakerOptions.enumValues = mongooseField.options.enum;
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
function generateMock(schema, options = {}) {
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

const field9Schema = new mongoose.Schema({
  field91: {
    type: Number,
    enum: [42, 69, 420],
  },
  field92: String,
  field93: {
    field931: String,
  },
});
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phoneNumber: String,
  firstName: { type: String, required: true },
  lastName: String,
  age: Number,
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
