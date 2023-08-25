module.exports.typeToMethodMap = {
  String: {
    module: 'word',
    type: 'sample',
  },
  Number: {
    module: 'number',
    type: 'int',
  },
  Decimal128: {
    module: 'number',
    type: 'int',
  },
  Date: {
    module: 'date',
    type: 'recent',
  },
  Boolean: {
    module: 'datatype',
    type: 'boolean',
  },
  BigInt: {
    module: 'number',
    type: 'bigInt',
  },
  ObjectID: {
    module: 'database',
    type: 'mongodbObjectId',
  },
};

module.exports.commonFieldsToFakerMap = {
  email: {
    module: 'internet',
    type: 'email',
  },
  firstname: {
    module: 'person',
    type: 'firstName',
  },
  lastname: {
    module: 'person',
    type: 'lastName',
  },
  name: {
    module: 'person',
    type: 'fullName',
  },
  phone: {
    module: 'phone',
    type: 'number',
  },
  city: {
    module: 'location',
    type: 'city',
  },
  country: {
    module: 'location',
    type: 'country',
  },
  street: {
    module: 'location',
    type: 'street',
  },
  state: {
    module: 'location',
    type: 'state',
  },
  address: {
    module: 'location',
    type: 'streetAddress',
  },
  zip: {
    module: 'location',
    type: 'zipCode',
  },
  pincode: {
    module: 'location',
    type: 'zipCode',
  },
  description: {
    module: 'lorem',
    type: 'lines',
  },
  website: {
    module: 'internet',
    type: 'url',
  },
  url: {
    module: 'internet',
    type: 'url',
  },
  _id: {
    module: 'database',
    type: 'mongodbObjectId',
  },
};
