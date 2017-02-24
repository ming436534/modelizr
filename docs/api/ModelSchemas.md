# Model Schemas

A schema is a piece of data that describes the fields and relationships of models.

### Model Schema Properties

###### name `string`

The name of the model. This key is used for defining relationships with other models. Defaults to the model `key` when given to modelizr

###### normalizeAs `string`

The key under which all variations of this model will be normalized. Defaults to the model's `name`

###### fields `object<Field>`

A collection of `name` => `field` that describes the fields and relationships of the model

###### primaryKey `string`

The field which represents the primary key of the model. Defaults to `id`

#### Field

A `field` can be either a javascript `Type`, a `string` or an `object`. A `string` type field represents a relationship with another model. If the type of the field
is wrapped in an array, it will be assumed to be a collection and will be normalized as such (for relationships) and mocked as an array.

An `object` type field can have the following properties:

###### type `Type` **`required`**

This is the type of the field, and can be one of the 4 javascript Types: `String`, `Number`, `Boolean`, `Object`

###### properties `object<Field>`

A collection of `name` => `field`. This property is used in conjunction with `type: Object`

###### alias `string`

Used to declare a GraphQL aliased field. This changes the generated GraphQL query

###### faker `string`

A string referencing a faker category to use when mocking the field. Refer to [Faker Categories](https://github.com/marak/Faker.js/#api-methods) for a 
list of available values.

###### pattern `string`

A pipe separated collection of values to use when mocking the field. Example: `Yes|No|Maybe`

###### min `number`

Specify the minimum number to generate when mocking. Used in conjunction with `type: Number`

###### max `number`

Specify the maximum number to generate when mocking. Used in conjunction with `type: Number`

###### decimal `boolean`

Specify whether the generated number should be a decimal or not when mocking. Used in conjunction with `type: Number`. Defaults to `false`

###### quantity `number`

An amount of entities to generate when mocking the field. Used in conjunction with a collection type, eg: `type: [String]`

### Union Schema Properties

A union is a collection of models and is defined slightly differently. A schema is considered a union of it has the following properties:

###### models `array<string>` `required`

A collection of model names that the union is a group of.

###### schemaAttribute `string | function` `required`

A field from each of its model children that can be used to identify the model. The name of the model is used in schema relationships. If a `function` is 
given, the function will be used to infer the schema.

### Example

```javascript
const Cat = {
  name: "Cat",
  normalizeAs: "Cats",
  fields: {
    ID: String,
    name: {
      type: String,
      faker: "name.firstName"
    },
    age: {
      type: Number,
      min: 1,
      max: 10
    },
    Owner: "Person"
  },
  primaryKey: "ID"
}

const Cat = {
  name: "Dog",
  normalizeAs: "Dogs",
  fields: {
    id: String,
    name: {
      type: String,
      faker: "name.firstName"
    },
    breed: {
      type: String,
      pattern: "Lab|GS|Colly"
    },
    Owner: "Person"
  }
}

const Animal = {
  name: "Animal",
  models: ["Cat", "Dog"],
  schemaAttribute: "__type"
}

const Person = {
  name: "Person",
  normalizeAs: "People",
  fields: {
    id: String,
    name: {
      type: String,
      faker: "name.firstName"
    },
    currentLocation: {
      type: Object,
      properties: {
        latitude: {
          type: Number,
          decimal: true
        },
        longitude: {
          type: Number,
          decimal: true
        }
      }
    },
    Pets: ["Animal"]
  }
}

import { Modelizr } from 'modelizr'

const {models} = new Modelizr({
	models: {
		Person, Dog, Cat, Animal
	}
})

// {Person, Dog, Cat, Animal} = models
```