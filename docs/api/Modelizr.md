# `Modelizr(options: object) => Client`

The constructor for this library. Accepts model schemas and some configuration options. Returns the query tools and model functions

### options

#### models `object`

A collection of schemas that will be interpreted by Modelizr

```javascript
import { Modelizr } from 'modelizr'

const Person = {
  normalizeAs: "People",
  fields: { ... }
}

const client = new Modelizr({
  models: {
    Person: Person
  },
  config: {
    ...
  }
})
```

#### config `object`

Global configuration properties

###### endpoint `string` `required`

The endpoint to send requests to

###### mock `boolean`

Whether or not to mock all requests. Defaults to `false`

###### debug `boolean`

Whether or not to enable debugging. Defaults to `false`

###### throwsOnErrors `boolean`

Whether or not to throw an error when a GraphQL response contains errors. Defaults to `true`

Throws a `GraphQLError`:

```javascript
import { GraphQLError } from 'modelizr'

...

query(
  Person
)
  .then(res => { ... })
  .catch(e => {
    if (e instanceof GraphQLError) {
      // contains graphQL errors
    }
  })
```

###### api `Function`

Replace the fetch api used internally with a custom one. Have a look at the [Modelizr Fetch Api]() to see what Modelizr expects.

## Client

The client that is constructed contains query tools and model functions generated from the provided model schemas

```javascript
import { Modelizr } from 'modelizr'

const {models, query, mutate, fetch} = new Modelizr({})
```