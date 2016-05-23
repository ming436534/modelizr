# Querying

Models can be used inside of query tools to generate a GraphQL query and send it off to the server.

#### `query`

If we want to generate a query that will fetch a users with ids `[1, 2, 3]` and their respective books, then we can use exported `query()` tool. Both this tool and the models used
can have [modifiers](docs/modifiers/README.md) applied to them.

```javascript
import { query } from 'modelizr'

query(
    user(
        book()
    ).params({ids: [1, 2, 3]})
)
    .path('http://path.to.api/graphql')
    .then((res, normalize) => {
        // res -> the response from the server
        // normalize(res.body) // normalized response
    })
```

Internally this will generate the following query and post it to the specified path.

```
{
  users (ids: [1, 2, 3]) {
     id,
     firstname,
     lastname
     books {
        id,
        title,
        publisher
     }
  }
}
```

We can make a similar query for books and their respective authors, although we will need to use an `as(key)` modifier to alter the models key.

```javascript
query(
    book(
        user().as("author")
    ).params({ids: [1, 2, 3]})
)
    .path('http://path.to.api/graphql')
    .then((res, normalize) => {
        // res -> the response from the server
        // normalize(res.body) // normalized response
    })
```
The resulting query will look like this:
```
{
  books (ids: [1, 2, 3]) {
     id,
     title,
     publisher
     author {
        id,
        firstName,
        lastName
     }
  }
}
```

You can also use the `.normalize()` modifier instead of `.then()` to directly normalize the servers response.

```javascript
query( ... ).normalize(res => {
    // res -> normalized response
})
```

When using unions in a query, modelizr will prefix child keys with `... on`. For instance the following query:

```javascript
query(
    owner(
        user(),
        group()
    )
)
```

Will generate
```
{
  owners {
     id,
     ... on users {
        id,
        firstName,
        lastName
     },
     ... on groups {
        id,
        users {
            id,
            firstName,
            lastName
        }
     }
  }
}
```

#### `mutation`

To make GraphQL mutations, we can use the `mutation()` tool. This works similarly to the `query()` tool although with different query generation. Lets mutate a user - we can pass params
directly into the model without the use of a modifier. This makes more sense for this kind of mutation.

The addition of the `.query()` modifier is to declare that we want the mutated user to be returned by the GraphQL server. This may become the default in future, but for
now you will need to explicitly specify this.

```javascript
import { mutation } from 'graphql'

mutation(
    user({firstName: "John", lastName: "Doe"})
)
    .as("createUser")
    .params({admin: true})
    .path('http://path.to.api/graphql')
    .query()
    .normalize(res => {})
```
This will create a query that looks as follows.
```
mutation createUser(admin: true) {
 users(firstName: "John", lastName: "Doe") {
   id,
   firstName,
   lastName
 }
}
```

#### `request`

Finally we have the `request()` tool. This is for making a request to a non GraphQL server, where the returned data still matches created models. You will need to explicitly
give this request a body.

```javascript
import { request } from 'modelizr'

request(
    user(
        book()
    )
)
    .body({
        firstName: "John",
        lastName: "Doe"
    })
    .path("http://...")
    .method("POST")
    .contentType( ... )
    .headers( ... )
    .then((res, normalize) => {})
```