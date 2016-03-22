# modelizr

A Combination of normalizr and json-schema-faker allowing you to define multipurpose models that can generate graphQL queries, mock deeply nested fake data and normalize

# Installation

```
npm i --save modelizr
```

# What can I use this for?

+ Easily generating graphQL queries and mutations based off models
+ Normalizing the graphQL response using [normalizr](https://github.com/gaearon/normalizr). The normalized response will base off the generated query
+ Mocking deeply nested queries from models that can be passed through normalizr.

See [normalizr](https://github.com/gaearon/normalizr) and [json-schema-faker](https://github.com/json-schema-faker/json-schema-faker) to get an overview on how they work.

# Example usage

Define a collection of models to be used when generating queries or mutations

```javascript
import { schema } from 'modelizr'

const user = schema('users', {
	firstname: {type: 'string', faker: 'name.firstName'},
    lastname: {type: 'string', faker: 'name.lastName'}
})

const book = schema({
    properties: {
        title: {type: 'string', faker: 'name.firstName'},
        edition: {type: 'integer', faker: 'random.number'}
    },
    required: ['title', 'edition']
})

// define nested models
user.define({
	books: [book]
})

book.define({
	author: user
})

export { user, book }
```

Now we can create a request object from our models and use it to generate graphQL requests or mock data

```javascript
import { query, normalize } from 'modelizr'
import { user, book } from './schemas'

const q = query(
	user(
		book(
			user().as('author')
		)
	).as('user').params({id: 1})
)

console.log(q.generate())
/*
{
  user (id: 1) {
     id,
     firstname,
     lastname
     books {
        id,
        title,
        edition,
        author {
           id,
           firstname,
           lastname
        }
     }
  }
}
*/

// make a request and normalize it
q.path('http://...').normalize(res => {
	console.log(res) // normalized response
})
/*
{
   entities: { users: { '1': [Object] }, books: { '1': [Object], '2': [Object], ... } },
   result: { user: 1 }
}
*/
```

# API Reference

## Mutators

These are methods that can be applied to models or request generators to change how they work.

```javascript
query(
	user().as('user').params({})
).path('http://...').then(res => {
	console.log(res) // server response
})
```

Mutators can also be used to pre-configure models or request generators

```javascript
const q = query.path('http://...').useApi(api)

q(
	user()
).then(res => {})
```

### `schema(key, schema [, options])`

Create a new model from a schema. The schema must be defined with the `json-schema-faker` schema style.

```javascript
import { schema } from 'modelizr'

const user = schema('users', {
    properties: {
        firstname: {type: 'string', faker: 'name.firstName'},
        lastname: {type: 'string', faker: 'name.lastName'}
    },
    required: ['firstname'] // defaults to all properties,
    additionalProperties: true // defaults to false
})

// or if you plan to use the defaults, you can directly specify properties
const user = schema('users', {
	firstname: {type: 'string', faker: 'name.firstName'},
	lastname: {type: 'string', faker: 'name.lastName'}
})
```

+ `key [string]` - gets used to create a `normalizr` schema. Is also the default name of an entity when generating a graph request or mocking
+ `schema [object]` - used to define properties that get added to generated requests, mocked and used in validation
+ `options [object]` - `normalizr` schema options

| Name                   | Description   |
| ---------------------- | ------------- |
| `properties [object]`  | A collection of properties that follow `json-schema-faker`'s API |
| `required [array]`     | A collection of properties that will be mocked. Also used to validate state against the model. Defaults to all values within `properties` |
| `additionalProperties [boolean]` | Specify if the entity can have additional, unspecified properties. Used for validation |

You can additionally specify any of `json-schema-faker`'s schema definitions.

If you would like to exclude `json-schema-faker` from your production build, you can export `MODELIZR_CHEAP_MOCK` as `true` and pass your bundle through an uglify step. 
This is recommended as the `faker.js` library within `json-schema-faker` is very large and should only be included during development

### `schema.define(definitions)`

Define relationships between models

+ `definitions [object]` - a collection of models structured as they are expected to be received

```javascript
const user = schema('users', {})
const book = schema('books', {})

user.define({
	books: [book],
	book: book
})

// or you can use the provided normalizr tools
import { arrayOf } from 'modelizr/normalizer'

user.define({
	books: arrayOf(book)
})
```

`'modelizr/normalizer'` exports a function with the same name for all of `normalizr`'s schema tools. `arrayOf | valuesOf | unionOf`

### model `schema()([params,] ...models)`

Define a nested query that can be generated or mocked

+ `params [object]` - Options that get added to the generated request. Note `id [integer]` and `ids [array]` parameters are used when mocking to create
entities with expected ids
+ `models [model]` - Nested models

#### model mutators

| Name                   | Accepts       | Effect
| ---------------------- | ---------------------- | --------------------------
| `as(key)`   | `[string]` | Change the name of the key to be used when generating requests and mocking |
| `params(params)` | `[object]` | Define parameters for the generated request. |
| `properties(props [, overwrite]) | props()` | `[array | object], ([boolean])` | add properties to the model, if overwrite is `true`, then the models props will be overwritten |
| `only(props)` | `[array]` | Use only the properties specified in `[array]` |
| `except(props)` | `[array]` | Exclude the properties specified in `[array]` |
| `onlyIf(statement)` | `[boolean]` | Only include the model this is applied to if its parameter is true |
| `normalizeAs(key)` | `[boolean]` | Replace a models normalize key. Primarily used for empty requests using the provided `request()` model |

### `query(...models)`

Generate and make a graphQL query

+ `models [model]` - A collection of nested models to define the generated request

```javascript
import { query } from 'normalizr'

query(
	user()
).then(res => {})
```

### `mutation(...models)`

Generate and make a graphQL mutation

+ `models [model]` - A collection of nested models to define the generated request

```javascript
import { mutation } from 'normalizr'

mutation(
	user()
).then(res => {})
```

If you want the mutation to query as well you can use the `withQuery()` mutator

```javascript
import { mutation } from 'normalizr'

mutation(
	user()
).withQuery().then(res => {})
```

### `mock(...models)`

Generate nested mock data

+ `models [model]` - A collection of nested models to define the generated request

```javascript
import { mock } from 'normalizr'

mock(
	user()
).then(res => {})
```

#### mutation / query mutators / mock mutators

| Name                   | Accepts       | Effect
| ---------------------- | ---------------------- | --------------------------
| `path(endpoint)`   | `[string]` | Define the endpoint for the graphQL request |
| `useAPI(api)` | `[function (path, query)]` that returns a promise | Replace the default request API (isomorphic-fetch) |
| `setSpaces(spaces)` | `[integer]` default `3` | Specify by how many spaces to indent the generated query |
| `generate()` | N\A | Causes `query()` to return the generated query as a string |
| `mock(shouldMock)` | `[boolean]` default `true` | Mock the request |
| `then(res, query)` | `[function (result)]` | Make the request and pass the result as it's first parameter, and the parsed query as the second |
| `normalize(res, query)` | `[function (result)]` | To be used instead of `.then()`. Normalize the query after receiving a response and pass the normalized response as the first parameter, and the parsed query as the second |

### `normalize(response, ...models)`

Normalize a response based on models

```javascript
normalize(
	response,
	user()
)
```

Recommended to rather use the `.normalize()` mutator on requests

In order to make arbitrary requests or mocks, you may also import 'request' from modelizr which is essentially an empty schema that you can call mutators on

```javascript
import { query, mutation, request } from 'modelizr'

query(
	request().props(['name', 'title']).params({id: 1}).as('customRequest').normalizeAs('user')
).then(res => {})

mutation(
	request().params({id: 1, title: 'something'}).as('mutateEntity')
)
```

# Todo

+ Validation
+ entrypoint to add mutators

# Tests

+ `npm i`
+ `npm test`
+ navigate to `http://localhost:9000` in your browser

Use the tests as usage examples.