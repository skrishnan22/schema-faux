const mongoose = require("mongoose");
const { typeToMethodMap, commonFieldsToFakerMap } = require("./lib/mapper");
const { isMongooseSchema } = require("./lib/utils");
const { Decimal128 } = mongoose;
const { faker } = require("@faker-js/faker/locale/en");
const unflatten = require("flat").unflatten;
/**
 * Handle Array fields - There are two types here
 * 1. Array of mongoose primitive data types
 * 2. Array of subdocuments with its own schema
 * @param {*} schemaField - Field in mongoose schema of type array
 * @param {string} fieldName  - Name of the array field
 */
function _mockArrayDataType(schemaField, fieldName) {
  if (schemaField.schema) {
    return [generateMock(schemaField.schema)];
  }
  const fieldType = schemaField["$embeddedSchemaType"].instance;
  return [_getMockValue(fieldName, fieldType)];
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
  const matchingCommonField = commonFields.find((field) =>
    fieldName.toLowerCase().includes(field)
  );

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
  if (mongooseField?.enumValues?.length) {
    fakerOptions.enum = true;
    fakerOptions.enumValues = mongooseField.enumValues;
  }
  return fakerOptions;
}
/**
 * Create a mock object based on mongoose schema
 * @param {*} schema - mongoose schema
 * @param {object} options -  options from client for mock generation
 */
function generateMock(schema, options = {}) {
  if (!schema || !isMongooseSchema(schema)) {
    throw new Error("Valid mongoose schema is required to generate mock");
  }

  const mock = {};
  for (const fieldName in schema.paths) {
    const field = schema.paths[fieldName];
    const fieldType = field.instance;

    // Handle nested schemas
    if (fieldType === "Embedded") {
      mock[fieldName] = generateMock(field.schema);
    }
    // Handle arrays
    else if (fieldType === "Array") {
      mock[fieldName] = _mockArrayDataType(field, fieldName);
    } else {
      const fakerOptions = _constructFakerOptions(field);
      mock[fieldName] = _getMockValue(fieldName, fieldType, fakerOptions);
    }
  }

  return mock;
}

// Example usage
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  zipCode: String,
});

const field9Schema = new mongoose.Schema({
  field91: Number,
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
            enum: ['either this', 'or that']
        },
        field9: field9Schema,
      },
    },
    field3: Number,
  },
});
let mockUserAllFields = generateMock(userSchema);
mockUserAllFields = unflatten(mockUserAllFields, { safe: true });
console.log(JSON.stringify(mockUserAllFields, null, 2));