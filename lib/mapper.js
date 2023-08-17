module.exports.typeToMethodMap = {
  String: {
    module: "word",
    type: "sample",
  },
  Number: {
    module: "number",
    type: "int",
  },
  Decimal128: {
    module: "number",
    type: "int",
  },
  Date: {
    module: "date",
    type: "recent",
  },
  Boolean: {
    module: "datatype",
    type: "boolean",
  },
  BigInt: {
    module: "number",
    type: "bigInt",
  },
  ObjectID: {
    module: "database",
    type: "mongodbObjectId",
  },
};
