# Query Modifiers

These modifiers only apply to query tools - **query**, **mutation** and **request**.

#### `path(endpoint)`

Define the endpoint that the Fetch API should point at.

```javascript
query( ... ).path("http:// ... ")
```

#### `as(name)`

Can only be applied to **mutation**. Specify the name of a mutation query.

```javascript
mutation( ... ).as("createUser")
```

#### `as(name)`

Can only be applied to **mutation**. Add parameters to a mutation query.

```javascript
mutation( ... ).params({forceDelete: true})
```

#### `api(function)`

Replace the default Fetch API with your own custom api. Please read up on the format of the Fetch API.

```javascript
const customAPI = mutations => { ... }
query( ... ).api(customAPI)
```

#### `spaces(amount)`

Specify by how many spaces to indent the generated query

```javascript
query( ... ).spaces(2)
```

#### `generate()`

Causes the query tool to return the generated query as a string. Does not apply to **request**.

```javascript
console.log(query( ... ).generate())

/*
{
    users {
        id,
        ...
    }
}
 */
```

#### `mockConfig(config)`

A configuration object for the mocking api.

```javascript
query( ... ).mockConfig({
    extensions: {
        faker: faker => {},
        chance: chance => {}
    },
    formats: {
        semver: (gen, schema) => {}
    },
    jsfOptions: {
        failOnInvalidTypes: true,
        ...
    },
    quantity: 25, // Amount of entities to generate unless otherwise specified in a query
    delay: 200, // Add a delay before mocking. Default is 0ms
    error: true // Always throw an error when mocking. Default is false
})
```

#### `mock(shouldMock, config)`

The first argument determines weather or not to mock the query. The second is a configuration object for the mocking api as defined above.

```javascript
query( ... ).mock(true, {
    quantity: 3,
    error: true
})
```

#### `then((res, normalize) => {})`

Generate the query and send it to the specified GraphQL server. You will get a promise returned and can continue chaining `.then` and `.catch`.

You will be given the response as the first argument, and a normalize tool as the second.

```javascript
query(
    user()
).then((res, normalize) => {
    // res -> the returned response
    // normalize(res.body) -> the normalize response according to the given model structure.
})
```

#### `normalize((res, normalize) => {})`

Similar to `.then()`, except this will further attempt to normalize the response and give you the normalized response.

```javascript
query(
    user()
).normalize(res => {
    // res -> the normalized response
})
```

#### `custom((apply [, valueOf]) => apply(key, value)`

Make a custom modification. Similar to `prepares` custom modifiers. This can be used to make a modification to the query tool.

Should be given a function that can accept two parameters. `apply(key, value)` and `valueOf(key)`. The function should **return** the result of `apply()`

```javascript
query(
    user()
).custom((apply, valueOf) => apply('path', `${valueOf('path')}/get-users`))
```
