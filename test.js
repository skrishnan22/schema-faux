/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const chai = require('chai');
const mongoose = require('mongoose');
const { generateMock } = require('./index');

describe('Basic Schema with all data types', () => {
  it('Should throw error when valid schema is not used', () => {
    const userSchema = {
      firstName: String,
      age: Number,
    };
    chai
      .expect(() => generateMock(userSchema))
      .to.throw('Valid mongoose schema is required to generate mock');
  });

  it('Should return mock object respecting mongoose schema types', () => {
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      birthDate: Date,
      isActive: Boolean,
      age: Number,
      salary: mongoose.Decimal128,
      accountBalance: BigInt,
      activeAccounts: [String],
      bufferField: Buffer,
      mixedField: mongoose.Schema.Types.Mixed,
    });
    const user = new mongoose.Document({}, userSchema);
    const mockObj = generateMock(userSchema);
    user.set(mockObj);
    const error = user.validateSync();
    chai.expect(error).to.be.undefined;
  });
});

describe('Schema with nested schema', () => {
  const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    zipCode: String,
    bufferField: Buffer,
    mixedField: mongoose.Schema.Types.Mixed,
  });

  const userSchema = new mongoose.Schema({
    firstName: String,
    activeAccounts: [String],
    address: addressSchema,
  });

  it('Should return mock obj conforming to both root and child schemas', () => {
    const user = new mongoose.Document({}, userSchema);
    const mockObj = generateMock(userSchema);
    user.set(mockObj);
    const error = user.validateSync();
    chai.expect(error).to.be.undefined;
  });
});

describe('Schema with enum values', () => {
  const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    zipCode: String,
    country: {
      type: String,
      enum: ['India', 'USA', 'Others'],
    },
  });

  const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    accountType: {
      type: String,
      enum: ['Savings', 'Personal'],
    },
    address: addressSchema,
  });

  it('Should return mock obj conforming to enum values in both root and nested schemas', () => {
    const user = new mongoose.Document({}, userSchema);
    const mockObj = generateMock(userSchema);
    user.set(mockObj);
    const error = user.validateSync();
    chai.expect(error).to.be.undefined;
  });
});

describe('Schema with min/max validators', () => {
  const userSchema = new mongoose.Schema({
    firstName: String,
  });
  describe('Min validation', () => {
    const minTestSchema = userSchema.clone();
    const minValue = 18;
    minTestSchema.add({
      age: { type: Number, min: minValue },
    });
    it('Should return mock obj with age field greater than equal to min', () => {
      const mockObj = generateMock(minTestSchema);
      chai.expect(mockObj.age).to.be.greaterThanOrEqual(minValue);
    });
  });

  describe('Max validation', () => {
    const maxTestSchema = userSchema.clone();
    const maxValue = 200;
    maxTestSchema.add({
      age: { type: Number, max: maxValue },
    });
    it('Should return mock obj with age field lesser than equal to max', () => {
      const mockObj = generateMock(maxTestSchema);
      chai.expect(mockObj.age).to.be.lessThanOrEqual(maxValue);
    });
  });

  describe('Min & Max validation', () => {
    const minMaxTestSchema = userSchema.clone();
    const minValue = 18;
    const maxValue = 200;
    minMaxTestSchema.add({
      age: { type: Number, min: minValue, max: maxValue },
    });
    it('Should return mock obj with age field within min max range', () => {
      const mockObj = generateMock(minMaxTestSchema);
      chai.expect(mockObj.age).to.be.greaterThanOrEqual(minValue);
      chai.expect(mockObj.age).to.be.lessThanOrEqual(maxValue);
    });
  });

  describe('Nested Schema', () => {
    const nestedSchema = {
      field1: {
        type: Number,
        max: 55,
      },
    };
    const nestedFieldSchema = userSchema.clone();
    const minValue = 18;
    const maxValue = 200;
    nestedFieldSchema.add({
      age: { type: Number, min: [minValue, 'Too young bruh!'], max: maxValue },
      nestedField: nestedSchema,
      nestedArray: [nestedSchema],
    });

    it('Should return mock obj with age field within min max range', () => {
      const user = new mongoose.Document({}, nestedFieldSchema);
      const mockObj = generateMock(nestedFieldSchema);
      user.set(mockObj);
      const error = user.validateSync();
      chai.expect(error).to.be.undefined;
    });
  });
});

describe('Schema with minLength/maxLength validators', () => {
  const userSchema = new mongoose.Schema({
    firstName: String,
  });
  describe('MinLength validation', () => {
    const minTestSchema = userSchema.clone();
    const minLength = 10;
    minTestSchema.add({
      address: { type: String, minLength },
    });
    it('Should return mock obj with address field greater than 10 char length', () => {
      const mockObj = generateMock(minTestSchema);
      chai.expect(mockObj.address.length).to.be.greaterThanOrEqual(minLength);
    });
  });

  describe('MaxLength validation', () => {
    const maxTestSchema = userSchema.clone();
    const maxLength = 25;
    maxTestSchema.add({
      address: { type: String, maxLength },
    });
    it('Should return mock obj with address field lesser than 25 char length', () => {
      const mockObj = generateMock(maxTestSchema);
      chai.expect(mockObj.address.length).to.be.lessThanOrEqual(maxLength);
    });
  });

  describe('MinLength & MaxLength validation', () => {
    const minMaxTestSchema = userSchema.clone();
    const minLength = 5;
    const maxLength = 25;
    minMaxTestSchema.add({
      address: { type: String, minLength, maxLength },
    });
    it('Should return mock obj with address field in range of minLength & maxLength', () => {
      const mockObj = generateMock(minMaxTestSchema);
      chai.expect(mockObj.address.length).to.be.greaterThanOrEqual(minLength);
      chai.expect(mockObj.address.length).to.be.lessThanOrEqual(maxLength);
    });
  });

  describe('Nested Schema', () => {
    const nestedSchema = {
      field1: {
        type: String,
        maxLength: 30,
        minLength: 10,
      },
    };
    const nestedFieldSchema = userSchema.clone();
    const minLength = 5;
    const maxLength = 15;
    nestedFieldSchema.add({
      address: { type: String, minLength: [minLength, 'Too short sir!Type more'], maxLength },
      nestedField: nestedSchema,
      nestedArray: [nestedSchema],
    });

    it('Should return mock obj with adress field within min max range', () => {
      const user = new mongoose.Document({}, nestedFieldSchema);
      const mockObj = generateMock(nestedFieldSchema);
      user.set(mockObj);
      const error = user.validateSync();
      chai.expect(error).to.be.undefined;
    });
  });
});

describe('Options - requiredOnly', () => {
  it('Should return mock object only with required fields, when requiredOnly is true', () => {
    const addressSchema = new mongoose.Schema({
      street: String,
      city: {
        type: String,
        required: true,
      },
      zipCode: String,
    });

    const userSchema = new mongoose.Schema({
      firstName: {
        type: String,
        required: true,
      },
      lastName: String,
      age: Number,
      activeAccounts: {
        type: [String],
        required: true,
      },
      address: {
        type: addressSchema,
        required: true,
      },
    });
    const mockObj = generateMock(userSchema, { requiredOnly: true });
    chai.expect(mockObj).to.haveOwnProperty('firstName');
    chai.expect(mockObj).to.haveOwnProperty('activeAccounts');
    chai.expect(mockObj.activeAccounts).to.be.an('array').to.have.lengthOf.at.least(1);
    chai.expect(mockObj).to.not.haveOwnProperty('lastName');
    chai.expect(mockObj).to.not.haveOwnProperty('age');
    chai.expect(mockObj).to.haveOwnProperty('address');
    chai.expect(mockObj.address).to.haveOwnProperty('city');
    chai.expect(mockObj.address).to.not.haveOwnProperty('street');
    chai.expect(mockObj.address).to.not.haveOwnProperty('zipCode');
  });
});
