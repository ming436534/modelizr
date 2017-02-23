# Query Modifiers

> These modifiers only apply to query tools - **query**, **mutation** and **request**.

These modifiers can be applied to either a static or an active tool.
```javascript
import { query } from 'modelizr'

query
    .path("http:// ... ")
    .mock()

// same as
query( models )
    .path("http:// ... ")
    .mock()
```

#### `path(endpoint)`

Define the endpoint that the Fetch API should point at.

```javascript
query.path("http:// ... ")
```

#### `as(name)`

Can only be applied to **mutation**. Specify the name of a mutation query.

```javascript
mutation.as("createUser")
```

#### `params(name)`

Can only be applied to **mutation**. Add parameters to a mutation query.

```javascript
mutation.params({forceDelete: true})
```

#### `api(function)`

Replace the default Fetch API with your own custom api. Please read up on the [format of the Fetch API](../api/FetchAPI.md).

```javascript
const customAPI = mutations => { ... }
query.api(customAPI)
```

#### `spaces(amount)`

Specify by how many spaces to indent the generated query

```javascript
query.spaces(2)
```

#### `generate()`

Causes the query tool to return the generated query as a string.

> No modifiers can be chained after using this modifier, and cannot be used on static tools.

Does not apply to **request**.

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

Configuration for the mocking api.

```javascript
query.mockConfig({
    extensions: {
        faker: faker => {}
    },
    quantity: 25
})
```

Check out the full configuration object [here](../api/Mocks.md#mock-configuration)

#### `mock(shouldMock, config)`

The first argument determines weather or not to mock the query (`true` if undefined). The second is a configuration object for the mocking api as defined
[here](../api/Mocks.md#mock-configuration).

```javascript
query.mock(true, {
    quantity: 3,
    error: true
})
```

#### `then((res, normalize) => {})`

Generate the query and send it to the specified GraphQL server. You will get a promise returned and can continue chaining `.then` and `.catch`.

> No modifiers can be chained after using this modifier, and cannot be used on static tools.

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

Similar to `.then()`, except this will also attempt to normalize the response and give you the normalized response.

> No modifiers can be chained after using this modifier, and cannot be used on static tools.

```javascript
query(
    user()
).normalize(res => {
    // res -> the normalized response
})
```

#### `middleware(middleware)`

Add middleware to the request api. Accepts an array of functions. Each function is given the response, a resolve function and a reject function. Each middleware **must** call `next`.

```javascript
query(
    user()
)
    .middleware([(res, next, reject) => next(res)])
    .normalize(res => {
        // res -> the normalized response
    })
```

#### `custom((apply [, valueOf]) => apply(key, value))`

Make a custom modification. Similar to `prepares` custom modifiers. Used for once-off, anonymous modifications.

Should be given a function that can accept two parameters. `apply(key, value)` and `valueOf(key)`. The function should **return** the result of `apply()`. Read up on
[custom modifiers](../api/QueryTools.md#custom-modifiers)

```javascript
query.custom((apply, valueOf) => apply('path', `${valueOf('path')}/get-users`))
```

#### `headers(headers)`

Give the request or query some headers.

```javascript
query.headers({
    token: " ... "
})
```

#### `contentType(type)`

Specify the content-type of the request

```javascript
request.contentType('application/json')
```

#### `method(type)`

Specify the method with which to make a request. `GET`, `POST`, `PUT`, `DELETE`. This modifier only applies to **request**

```javascript
request.method('GET')
```

#### `body(requestBody)`

Specify the body of the request. This modifier only applies to **request**

`object` values will be stringified.

```javascript
request.body({ ... })
```