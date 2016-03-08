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
    properties: {
        firstname: {type: 'string', faker: 'name.firstName'},
        lastname: {type: 'string', faker: 'name.lastName'}
    }
})

const book = schema({
    properties: {
        title: {type: 'string', faker: 'name.firstName'},
        edition: {type: 'integer', faker: 'random.number'}
    }
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

Now we can create a request object from our model and use it to generate graphQL requests or mock data

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

console.log(q.getQuery())
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
q.path('http://...').query().normalize()
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
).path('http://...')
```

### `schema(key, schema [, options])`

Create a new model from a schema. The schema must be defined with the `json-schema-faker` schema style.

```javascript
const user = schema('users', {
    properties: {
        firstname: {type: 'string', faker: 'name.firstName'},
        lastname: {type: 'string', faker: 'name.lastName'}
    }
})
```

+ `key [string]` - gets used to create a `normalizr` schema. Is also the default name of an entity when generating a graph request or mocking
+ `schema [object]` - used to define properties that get added to generated requests, mocked and used in validation
+ `options [object]` - `normalizr` schema options

| Name                   | Description   |
| ---------------------- | ------------- |
| `properties [object]`  | A collection of properties that follow `json-schema-faker`'s API |
| `required [array]`     | A collection of properties that will be mocked. Also used to validate state against the model. Defaults to all values within `properties` |

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

### `model([params,] ...models)`

Define a nested query that can be generated or mocked

+ `params [object]` - Options that get added to the generated request. Note `id [integer]` and `ids [array]` parameters are used when mocking to create
entities with expected ids
+ `models [model]` - Nested models

#### model mutators

| Name                   | Accepts       | Effect
| ---------------------- | ---------------------- | --------------------------
| `as()`   | `[string]` | Change the name of the key to be used when generating requests and mocking |
| `params()` | `[object]` | Define parameters for the generated request. |
| `only()` | `[array]` | Use only the properties specified in `[array]` |
| `except()` | `[array]` | Exclude the properties specified in `[array]` |
| `onlyIf()` | `[boolean]` | Only include the model this is applied to if its parameter is true |

### `query(...models)`

Generate and make a graphQL query

+ `models [model]` - A collection of nested models to define the generated request

```javascript
query(
	user()
).getQuery()
```

### `mutation(...models)`

Generate and make a graphQL mutation

```javascript
mutation(
	user()
).getQuery()
```

If you want the mutation to query as well you can use the `withQuery()` mutator

```javascript
mutation(
	user().withQuery()
).getQuery()
```

#### mutation / query mutators

| Name                   | Accepts       | Effect
| ---------------------- | ---------------------- | --------------------------
| `path()`   | `[string]` | Define the endpoint for the graphQL request |
| `useAPI()` | `[function (path, query)]` that returns a promise | Replace the default request API (isomorphic-fetch) |
| `getQuery()` | N\A | Causes `query()` to return the generated query as a string |
| `then()` | `[function (result)]` | Make the request and pass the result as it's first parameter |
| `mock()` | `[boolean]` default `true` | Mock the request |
| `normalize()` | `[function (result)]` | Normalize the query after receiving a response and pass the normalized response as the first parameter |

### `mock(...models)`

Generate nested mock data

```javascript
mock(
	user()
)
```

#### mock mutators

| Name                   | Accepts       | Effect
| ---------------------- | ---------------------- | --------------------------
| `then()` | `[function (result)]` | Make the request and pass the result as it's first parameter |
| `normalize()` | `[function (result)]` | Normalize the query after receiving a response and pass the normalized response as the first parameter |

### `normalize(response, ...models)`

Normalize a response based on models

```javascript
normalize(
	response,
	user()
)
```