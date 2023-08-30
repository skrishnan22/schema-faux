const mongoose = require('mongoose');

const { Decimal128 } = mongoose;
const { generateMock } = require('./index');
// Example usage
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  zipCode: {
    type: String,
    required: true,
  },
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
    required: true,
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
    field931: {
      type: fiel931Schema,
      required: true,
    },
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
  address: {
    type: addressSchema,
    required: true,
  },
  hobbies: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        years: {
          type: Number,
          enum: [1995, 2000, 2010, 2020, 2025],
        },
      },
    ],
    required: true,
  },
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
        field9: {
          type: field9Schema,
          required: true,
        },
      },
    },
    field3: Number,
  },
});
const mockUserAllFields = generateMock(userSchema, { requiredOnly: false });
console.log(JSON.stringify(mockUserAllFields, null, 2));
