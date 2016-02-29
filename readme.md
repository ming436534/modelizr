# modelizr

Combination of normalizr and json-schema-faker that allows you to define multipurpose schemas.

# Installation

```
npm i --save modelizr
```

# What can I use this for?

+ Defining normalizr schemas
+ Producing nested, faked data based on defined schemas, and normalizing them
+ Generating graphQL queries and mutations from the schema

See [normalizr](https://github.com/gaearon/normalizr) and [json-schema-faker](https://github.com/json-schema-faker/json-schema-faker) to get an overview on how they work.

# Usage

First create the schemas you need

```javascript
import { Schema, defineSchemas } from 'modelizr'

const user = new Schema({
    type: 'object',
    key: 'users',
    // Definitions will get parsed using normalizr's Schema.define()
    definitions: {
        books: ['book']
    },
    properties: {
        firstname: {type: 'string', faker: 'name.firstName'},
        lastname: {type: 'string', faker: 'name.lastName'}
    },
    required: ['firstname', 'lastname']
})

const book = new Schema({
    type: 'object',
    key: 'books',
    definitions: {
    	author: 'user'
    },
    properties: {
        author: {type: 'string', faker: 'name.firstName'}
    },
    required: ['author']
})

// Build the normalzr schemas
const model = defineSchemas({
    user,
    book
})

export { model as default, model }
```

Now we can create a request object based on our schemas and use it to generate graphQL requests and mock data

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

    const normalizedResponse = request.normalize(mockedRequest)
    /*
     {
         entities: {
                    users: { '1': [Object], '2': [Object], '3': [Object] },
                    books: { '1': [Object] } 
                   },
         result: {
                    users: [ 1, 2, 3 ]
                 }
     }
     */
}

export { api as default }
```

# API Reference

### `new Schema(schema, [options])`

+ `schema` the schema object of your entity
	+ `key [string]` the key property of the resulting normalizr schema
	+ `definitions [object]` nested relationships between different entities
		+ `array` resolves to `arrayOf('entity')`
		+ `string` resolves to `'entity'`
	+ `properties [object]` all properties of the entity
		+ `type` the type of the property
		+ `faker` what faker.js should fake
+ `[options]` additional options (see [normalizr](https://github.com/gaearon/normalizr))
		
```javascript
{
	key: 'users',
	definitions: {
		books: ['book'], // arrayOf('book')
		avatar: 'image'
	},
	properties: {
		firstname: {type: 'string', faker: 'name.firstName'}
	}
}
```

### `defineSchemas(schemas)`

+ `schemas` an object of schemas. `returns` a model

```javascript
{
	user: [UserSchema],
	book: [BookSchema]
}
```