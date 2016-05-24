# Model Creator

## `model(key, schema, [, options])`

Create a new model that can be used in queries, mocked and used to validate entities.

+ `key [string]` - The model key. This will feature in generated queries, and will be used by normalizr to flat-map entities.
+ `schema [object]` - Define the structure of the model.
+ `options [object]` - Additional `normalizr` Schema options.

```javascript
import { model } from 'modelizr'

const user = model('users', {
    properties: {
        id: {type: 'integer', alias: 'ID'},
        firstName: {type: 'string', faker: 'name.firstName'},
        lastName: {type: 'string', faker: 'name.lastName'}
    },
    required: ['firstname'], // If not included, defaults to all fields that are a part of properties
    primaryKey: 'id'
})
```
+ The `primaryKey` field is used when mocking, and by normalizr when flat-mapping.
+ The `alias` property (show at the `id` field) will produce a GraphQL alias when generating the query.

If you only care about defining the properties of a model, then that's all you need to define.
```javascript
const user = model('users', {
    id: {type: 'primary|integer'},
    firstName: {type: 'string', faker: 'name.firstName'},
    lastName: {type: 'string', faker: 'name.lastName'}
})
```
You specify the primary key through the `type` field - and separate the actual type with a `|`. The `required` field is automatically fulled with all properties you have defined.

You may also specify models as property types. You do not need to specify the faker property if you have already specified the type as a model. Modelizr will mock the field based on the
given model.
```javascript
const user = model('users', {
    ...
})

const book = model('books', {
    ...,
    author: {type: book}
})
```

#### `.define(relationships)`

Describe the models relationship with other models. Modelizr additionally exports `arrayOf` and `valuesOf` utilities. **They are not the same as normalizrs utilities**.

```javascript
// ...

import { arrayOf, valuesOf } from 'modelizr'

user.define({
    books: arrayOf(book)
})

book.define({
    author: user,
    editors: valuesOf(user, {schemaAttribute: "type"})
})
```
Or you can use the `[]` shorthand for `arrayOf` definitions

```javascript
user.define({
    books: [book]
})
```

#### `.primaryKey(key)`

Explicitly set the primary key of the model

#### `.getKey()`

Get the models entity key.

#### `.setSchema(schema [, options])`

Explicitly set the models schema. This is useful if you have circular model dependencies in your schema. For example:

```javascript
const user = model('users')
const book = model('books', {
    id: {type: 'integer'},
    ...
})

const collection = union('collections', {
    books: book,
    users: user
}, {schemaAttribute: 'type'})

user.setSchema({
    id: {type: 'integer', alias: 'ID'},
    ...,
    collections: {type: collection}
})
```