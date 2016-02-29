# modelizr

A Combination of normalizr and json-schema-faker allowing you to define multipurpose schemas that can generate graphQL queries, mock deeply nested fake data and normalize

# Installation

```
npm i --save modelizr
```

# What can I use this for?

+ Defining normalizr schemas and easily normalizing data
+ Producing deeply nested, faked data through the faker.js library
+ Easily generating graphQL queries and mutations

See [normalizr](https://github.com/gaearon/normalizr) and [json-schema-faker](https://github.com/json-schema-faker/json-schema-faker) to get an overview on how they work.

# Example usage

Define a collection of schemas to be used within your system

```javascript
import { Schema, defineSchemas } from 'modelizr'

const user = new Schema({
    key: 'users',
    definitions: {
        books: ['book']
    },
    properties: {
        firstname: {type: 'string', faker: 'name.firstName'},
        lastname: {type: 'string', faker: 'name.lastName'}
    }
})

const book = new Schema({
    key: 'books',
    definitions: {
    	author: 'user'
    },
    properties: {
        author: {type: 'string', faker: 'name.firstName'}
    }
})

// Build a model from the defined schemas
const model = defineSchemas({
    user,
    book
})

export { model as default }
```

Now we can create a request object from our model and use it to generate graphQL requests or mock data

```javascript
import model from './schemas'

const api = () => {
    const request = model.buildRequest({
        users: {
            model: 'user',
            params: {
                ids: [1, 2, 3]
            },
            books: {
                model: 'book'
            }
        }
    })

    const graphQLQuery = request.getGraphQuery()
    /*
     {
         users(ids: [1,2,3]) {
             firstname,
             lastname,
             books() {
                author
             }
         }
     }
     */

    const mockedRequest = request.mock()
    /*
     {
     users: [
              {
                firstname: 'Samanta',
                lastname: 'Murphy',
                id: 1,
                books: [
                         {
                           author: 'Angelica',
                           id: 1
                         }
                       ]
              }
            ]
     }
     */

    const normalizedResponse = request.normalize(mockedRequest) // returns a normalized response
}

export { api as default }
```

# API Reference

### `new Schema(schema, [options])`

Instantiates a new schema that extends `normalizr`'s `Schema` but accepts a `json-schema-faker` style schema instead of a `key`

```javascript
const user = new Schema({
    key: 'users',
    definitions: {
        books: ['book'],
        avatar: 'image'
    },
    properties: {
        firstname: {type: 'string', faker: 'name.firstName'},
        lastname: {type: 'string', faker: 'name.lastName'}
    }
})
```

| Name                   | Description   |
| ---------------------- | ------------- |
| `key [string]`         | gets passed to `normalizr`'s constructor |
| `definitions [object]` | follows `normalizr`'s `define()` call but accepts one of `string: ` name of another schema; `array[string]: ` containing the name of another schema. `array[string]` is the equivalent of `normalizr`'s `arrayOf('schema')`. also accepts one of `normalizr`'s `arrayOf | valuesOf | unionOf` properties      |
| `properties [object]`  | A collection of properties that follow `json-schema-faker`'s API      |

You can additionally specify any of `json-schema-faker`'s schema definitions.

If you would like to exclude `json-schema-faker` from your production build, you can export `MODELIZR_CHEAP_MOCK` as `true` and pass your bundle through an uglify step.

### `defineSchemas(schemas)`

This will run a `Schema.define()` on all given schemas and return a model containing a few useful methods.

+ `schemas [object]` - a collection of schemas

```javascript
const model = defineSchemas({
	user
})
```

### `Model`

The returned model from `defineSchemas()`

#### `schemas`

A collection of all defined schemas

#### `mock(schema [, ids])`

Generate mock data for a schema.

+ `schema [schema | string]` - either the key of a schema or the schema definition itself.
+ `ids [int | array]` - if `int`, returns a single mocked object with `ids` as its id. If `array`, returns an array of mocked objects with `ids` as their mapped ids.

#### `buildRequest(query)`

Create a request object containing methods for a specified `query`

+ `query [object]` - a query to be formed into a graphQL query/mutation

```javascript
// For generating a query
const request = buildRequest({
	users: {
		model: 'user',
		params: {
			ids: [1, 2, 3]
		},
		books: {
			model: 'book'
		}
	},
	
	books: {
		model: 'book',
		params: {
			id: 25
		}
	}
})

// For generating a mutation
const request = buildRequest({
	user: {
		type: 'mutation',
		model: 'user',
		params: {
			firstname: 'John',
			lastname: 'Doe'
		}
	}
})
```

| Name                   | Description   |
| ---------------------- | ------------- |
| `model [string]`         | The schema to use for the generated request, or mocked data |
| `type [string]` | Either `query or mutation`, defaults to `query`. define the type of query to make. Does not influence mocks      |
| `params [object]`  | A collection of parameters to give to the graphQL query or mutation. Mocks make use of the `id | ids` param to generate either a single entity or an array or entities. defaults to `[1...20]`      |

The request object returned contains the following methods

##### `getGraphRequest()`

Generates a graphQL request/mutation based on the `query`

##### `mock()`

Returns a mocked request that mimics the structure of the `query`

##### `normalize(response)`

Normalizes the response based on the `query`

# Todo

+ Make use of jsf's validate method.
+ Add support for custom jsf faker statements
+ Properly implement tests

All contributions are welcome!