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
