# schema-faux

![Build](https://github.com/skrishnan22/schema-faux/actions/workflows/main.yml/badge.svg)

**schema-faux** is a JS library designed to generate realistic mock data based on Mongoose schemas. This library is essential for testing scenarios where you need accurate simulated data. It caters to Node.js applications employing Mongoose for MongoDB integration, as well as other applications requiring lifelike fake data.

## Features

- **Generate Realistic Mock Data**: Create mock data that accurately reflects the structure and constraints of your Mongoose schemas.

- **Flexible Configuration Options**: Customize the data generation process using a variety of options to align with your specific use cases.

- **Support for Nested Schemas**: Efficiently handle nested schemas, including subdocuments, to ensure precise mock data generation, even for intricate data structures.

- **Array Field Handling**: Seamlessly generate mock data for fields with array types, catering to both primitive types and subdocuments.

## Installation

Install **schema-faux** using npm:

```bash
npm install schema-faux
```

## Usage

Import the `generateMock` function from the library and use it to generate mock data based on your Mongoose schema.

```javascript
const { generateMock } = require('schema-faux');
const mongoose = require('mongoose');

// Define your Mongoose schema
const userSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: true,
  },
  age: Number,
  posts: [
    {
      title: String,
      content: String,
    },
  ],
});

// Generate mock data based on the schema
const mockUser = generateMock(userSchema);

console.log(mockUser);
// Output: Mock data object with realistic values based on the schema
{
  username: 'Joan Bogan',
  email: 'Laisha.Blick20@gmail.com',
  age: 64,
  posts: [
    {
      title: 'past',
      content: 'failing',
      _id: 'b64edf4fdafacfb33b73bfe7'
    }
  ],
  _id: '504dda8e8becb7ed78b2e9ef'
}
```

## Supported Mongoose Schema Types

**schema-faux** supports a wide range of Mongoose schema types, including:

- `String`
- `Number`
- `Date`
- `Buffer`
- `Boolean`
- `Mixed`
- `ObjectId`
- `Array`
- `Decimal128`
- `Schema`
- `BigInt`


## Configuration Options

**schema-faux** provides options to fine-tune the mock data generation process:

- **requiredOnly**: Generate mock data for required fields only. Useful for scenarios where only mandatory data points need to be generated.
```javascript
const { generateMock } = require('schema-faux');
const mongoose = require('mongoose');

// Define your Mongoose schema
const addressSchema = new mongoose.Schema({
  street: String,
  city: {
    type: String,
    required: true
  },
  zipCode: String
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
     required: true
  },
  email: {
    type: String,
    required: true,
  },
  age: Number,
  address: {
    type: addressSchema,
    required: true
  },
  posts: [
    {
      title: String,
      content: String,
    },
  ],
});

// Generate mock data based on the schema
const mockUser = generateMock(userSchema, {requiredOnly: true});

console.log(mockUser);

// Output: Mock data object with only required fields

{
  username: 'Mrs. Bernice Berge',
  email: 'Garret79@hotmail.com',
  address: { city: 'Prudencehaven' }
}

```

## Handling Common Fields

Commonly used fields such as addresses, countries, and cities can be easily generated with valid data. Example,
```javascript
const mongoose = require('mongoose');
const { generateMock } = require('schema-faux');

// Define your Mongoose schema
const addressSchema = new mongoose.Schema({
  street: String,
  city: {
    type: String,
    required: true,
  },
  zipCode: String,
});

const oraganizationSchema = new mongoose.Schema({
  name: String,
  address: addressSchema,
  website: String,
  phone: String,

});
// Generate mock data based on the schema
const mockOrganization = generateMock(oraganizationSchema);

console.log(mockOrganization);

// Output: Mock data object with fields with valid values
{
  name: 'Margarita Champlin',
  address: {
    street: 'Flatley Village',
    city: 'Fort Destinview',
    zipCode: '45073',
    _id: '33f28364efb2dee4be91ce46'
  },
  website: 'https://powerful-tadpole.net',
  phone: '(684) 763-2445',
  _id: '47c14bbb478ee9fa197e5ebb'
}
```

## Handling Enum Values

**schema-faux** handles enum values by utilizing the `enum` property defined in the Mongoose schema. If your schema defines an `enum` property for a field, the generated mock data will adhere to the specified enum values.

## Handling Mongoose Validations

Min and max values specified in the schema for `Number`, as well as `minLength` and `maxLength` for `String`, are taken into account during mock data generation. The library ensures that generated data adheres to these constraints while remaining realistic.

## Contributing

Contributions to **schema-faux** are highly appreciated! If you discover a bug, have enhancement ideas, or want to contribute in any capacity, please feel free to open an issue or a pull request on the [GitHub repository](https://github.com/skrishnan22/schema-faux).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
