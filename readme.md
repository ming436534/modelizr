# modelizr

A Combination of normalizr, json-schema and faker.js allowing you to define multipurpose models that can generate graphQL queries, mock deeply nested fake data and normalize

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
import { model } from 'modelizr'

const user = model('users', {
    id: {type: 'primary', alias: 'ID'},
	firstname: {type: 'string', faker: 'name.firstName'},
    lastname: {type: 'string', faker: 'name.lastName'}
})

const book = model({
    properties: {
        id: {type: 'integer'},
        title: {type: 'string', faker: 'name.firstName'},
        edition: {type: 'integer', faker: 'random.number'}
    },
    required: ['title', 'edition'],
    primaryKey: 'id'
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
import { query as Query, normalize } from 'modelizr'
import { user, book } from './schemas'

const query = Query(
	user(
		book(
			user().as('author')
		)
	).as('user').params({id: 1})
)

console.log(query.generate())
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
query.path('http://...').normalize(res => {
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
const query = Query.path('http://...').useApi(api)

query(
	user()
).then(res => {})
```

### `model(key, schema [, options])`

Create a new model from a schema. The schema must be defined with the `json-schema` schema style.

```javascript
import { model } from 'modelizr'

const user = model('users', {
    properties: {
        id: {type: 'integer'},
        firstname: {type: 'string', faker: 'name.firstName'},
        lastname: {type: 'string', faker: 'name.lastName'}
    },
    required: ['firstname'], // defaults to all properties,
    additionalProperties: true, // defaults to false
    primaryKey: 'id'
})

// or if you plan to use the defaults, you can directly specify properties
const user = model('users', {
	firstname: {type: 'string', faker: 'name.firstName'},
	lastname: {type: 'string', faker: 'name.lastName'}
})
user.primaryKey('id')
```

+ `key [string]` - gets used to create a `normalizr` schema. Is also the default name of an entity when generating a graph request or mocking
+ `schema [object]` - used to define properties that get added to generated requests, mocked and used in validation
+ `options [object]` - `normalizr` schema options

| Name                   | Description   |
| ---------------------- | ------------- |
| `properties [object]`  | A collection of properties that follow `json-schema-faker`'s API |
| `required [array]`     | A collection of properties that will be mocked. Also used to validate state against the model. Defaults to all values within `properties` |
| `additionalProperties [boolean]` | Specify if the entity can have additional, unspecified properties. Used for validation |
| `primaryKey [string]`  | The schemas primary key attribute. Passed to normalizr's `idAttribute` and used in mocks |

You can additionally specify any of `json-schema`'s schema definitions as well as an `alias` definition which will append the specified alias in your query:

```javascript
const user = model('users', {
    id: {type: 'primary', alias: 'ID'}
})

{
  user {
     id: ID,
  }
}
```

If you would like to exclude `json-schema-faker` from your production build, you can export `MODELIZR_CHEAP_MOCK` as `true` and pass your bundle through an uglify step. 
This is recommended as the `faker.js` library used is very large and should only be included during development. The resulting mocked entities will just
contain ids

### `model.define(definitions)`

Define relationships between models

+ `definitions [object]` - a collection of models structured as they are expected to be received

```javascript
const user = model('users', {})
const book = model('books', {})

user.define({
	books: [book],
	book: book
})

// or you can use the provided normalizr tools
import { arrayOf } from 'modelizr/lib/normalizer'

user.define({
	books: arrayOf(book)
})
```

`'modelizr/lib/normalizer'` exports a function with the same name for all of `normalizr`'s schema tools. `arrayOf | valuesOf | unionOf`. **Note** if you use
actual `normalizr` methods, it will not work.

### `model.primaryKey(key)`

Specify the primary key to be given to normalizr, and used in mocks. Assumes `id` by default.

```javascript
user.primaryKey('ID')
```

### model instance `model()([params,] ...models)`

Define a nested query that can be generated or mocked

+ `params [object]` - (optional) Parameters that get added to the generated request. Note that parameters that are specified as `primaryKeys` are used when mocking to create
entities with expected ids. A single `param<primaryKey>` will generate a single mocked entity, and an array of `param<primaryKey>` will generate an array of entities
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

If you want the mutation to query as well you can use the `query()` mutator

```javascript
import { mutation } from 'normalizr'

mutation(
	user()
).query().then(res => {})
```

To change the mutation name and add params - you can use the `as()` and `params()` mutators

### `mock(...models)`

Generate nested mock data

+ `models [model]` - A collection of nested models to define the generated request

```javascript
import { mock } from 'normalizr'

mock(
	user()
).then(res => {})
```

Mock are generating with a cache, so if you reference the same `id` twice, you won't get conflicting entities. If your query contains nesting of
the same model, then their `id's` will always continue from the last mocked entity. eg:

```javascript
{
  user {
     id,
     books {
        id
     }
  }
}

// results in this pattern of ids

[
    {
        id: 1,
        books: [1, 2, 3, ... n]
    },
    
    {
        id: 2,
        books: [n +  1, n + 2, n + 3, ...]
    },
    
    ...
]
```

This will continue for all levels of nesting.

The id mocking algorithm is as follows:

+ If an `id` parameter or a parameter with a `primaryKey` is provided, then mocking will follow this pattern:
    + If the `id` or `primaryKey` parameter is an array, then an array of entities will be generated with matching values
    + If the `id` or `primaryKey` parameter is an integer, then a single entity with that value will be generated
+ If no `id` or `primaryKey` parameter is provided, the mocks will be generated as follows:
    + If the entity is a top level query, then 20 entities will be generated with ids `1 => 20`
    + If the entity is nested and is defined in its parent model then it will be mocked according to its normalizr definition. eg:
        + `arrayOf()` and the other function definitions will generate 20 entities with ids `n + 1 => n + 20`
        + A plain `model` will generate a single entity with id `n + 1`

#### mutation / query mutators / mock mutators

| Name                   | Accepts       | Effect
| ---------------------- | ---------------------- | --------------------------
| `path(endpoint)`   | `[string]` | Define the endpoint for the graphQL request |
| `as(name)` | `[string]` default `mutation` | Specify the name of a mutation query |
| `params()` | `[object]` | Add top level parameters to a mutation query |
| `api(api)` | `[function (path, query)]` that returns a promise | Replace the default request API (isomorphic-fetch) |
| `spaces(spaces)` | `[integer]` default `3` | Specify by how many spaces to indent the generated query |
| `generate()` | N\A | Causes `query()` to return the generated query as a string |
| `mock(shouldMock)` | `[boolean]` default `true` | Mock the request |
| `delay(delay)` | `[integer]` default `500` (ms) | Add a delay to your mock |
| `error(type)` | `[string | integer]` default `throw` | Mock returns an error. If you give it a string `throw` it will throw an error and you will need to catch it. if you give it an integer it will treat it as an http status code. |
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

### `prepare(mutators)`

This is a convenience method that allows you to pre-configure all query types.

```javascript
import { prepare } from 'modelizr'

const prepared = prepare().path('http://...')

const query = prepared.query()
const mutation = prepared.mutation()
const mock = prepared.getMock()
```

The api for prepare isn't very stable and is likely to change. There is also a very hacky way to add custom mutators:

```javascript
const prepared = prepare({
    customPathMutator: function (path) {
        return this.apply('_path', 'http://api.example.com/' + path)
    }
})

const query = prepared.query()

query(
    model()
).customPathMutator('graphql')
```

**Note** all existing mutators apply to properties of the same name but prefixed by `_`. Eg: `.mock()` applies to `_mock`. The custom mutators must be
 `function`'s and not a lambdas. To mutate properties, they have access to `this.apply(key, value)` where `key` is the property name (eg `_mock`) and `value`
 is the new value you want to set.

### `request(body)`

Perform a plain request with the default or configured api. The api will receive an `isPlain` property in its second parameter
To mock a normal request, you can give it a response to mock in the `.mock()` mutator. the response can be either a function or plain data.

```javascript
import { request } from 'modelizr'

request({
    email: 'johndoe@gmail.com',
    password: 'mysecret'
})
    .method('post')
    .contentType('application/json')
    .mock({
        name: "John",
        email: "johndoe@gmail.com"
    })
    .then(res => {})

// or
import { prepare } from 'modelizr'

const request = prepare().contentType(...).request()
```

### `api(query, opts)`

The format of the api.

+ `query [string | object]` - will be the stringified query unless using a plain request, in which case it will be the request object
+ `opts [object]` - some request settings

| Option Name                   | Purpose       
| ---------------------- | ---------------------- 
| `path [string]`   | The request endpoint | 
| `contentType [string]` | Request contentType header. Defaults to `application/json`| 
| `headers [object]` | Any additional headers | 
| `method [string]` | `post | get | put | delete` Defaults to `post` | 
| `isPlain [boolean]` | Specify if the query is a graphQL query or not | 

##### returns

Expects server response body to be in json. Returns a response with the following format:

```javascript
{
    status: 200, // http status code
    body: response // the response body after res.json() has been called
}
```

# Tests

+ `npm i`
+ `npm test`
+ navigate to `http://localhost:8000` in your browser

Use the tests as basic usage examples.

# Todo

+ Move the current tests to examples.
+ Write proper tests.
+ Model support for `unionOf()`