const mongoose = require("mongoose");
const { typeToMethodMap } = require("./lib/mapper");
const { isMongooseSchema } = require("./lib/utils");
const { Decimal128 } = mongoose;
const { faker } = require('@faker-js/faker/locale/en');

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
  
  if (fakerMethod) {
    return faker[fakerMethod.module][fakerMethod.type]();
  }

  return null;
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
      mock[fieldName] = _getMockValue(fieldName, fieldType);
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

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phoneNumber: String,
  firstName: { type: String, required: true },
  lastName: String,
  age: Number,
  birthDate: Date,
  isActive: Boolean,
  address: addressSchema,
  hobbies: [{
    name: {
        type: String
    },
    years: {
        type: Number
    }
   }],
  salary: Decimal128,
  accountBalance: BigInt,
});

const mockUserAllFields = generateMock(userSchema);
console.log(mockUserAllFields)