# Query Tools

Query tools accept model functions and use them to generate GraphQL queries.

###### `query(...models)` | `mutate(...models)`

Generate a GraphQL query

```javascript
query(
  Person("People",
    Animal("Pets", Cat)
  ),
  Dog("Dogs")
).then(res => {})
```

### Modifiers

Modifiers are functions that can be called on query tools. Modifiers return the query tool which allows them to be chained.

###### `endpoint(url: string)`

Change the endpoint the request will be sent to

###### `headers(headers: object)`

Add request headers to the query

###### `api(fetchApi: Function => Promise)`

Change the api used to make fetch requests

###### `mock([shouldMock: boolean])`

Set whether the request should be mocked or not. `shouldMock` defaults to `true` when called

###### `debug([shouldDebug: boolean])`

Set whether the request should `console.log` debug information while making the request. `shouldDebug` default to `true` when called

###### `throwOnErrors([shouldThrow: boolean])`

Set whether the request should reject the promise when the GraphQL response contains errors. `shouldThrow` defaults to `true` when called

###### `generate(cb: Function)`

When set, the generated query will be given to the callback

###### `then(cb: Function)`

> Terminator

When called, the request will be made. This returns a promise and the callback will be given the request `response` and an augmented `normalize` function

example:
```javascript
query(
  Person
).then((res, normalize) => {
  return normalize(res.data)
}).then(normalizedEntities => {
  ...
})
```

###### `normalize(cn: Function)`

> Terminator

Identical to `.then` except that it automatically normalizes the response before resolving

### Fetch

There is another convenience query tool called `fetch`. This can be used to make a normal `REST` request where the expected response is formatted according to the 
model schemas.

The only difference is that a graphQL query is not generated. The `body` of the request must be provided manually. In addition to the modifiers mentioned above,
this tool has a few additional modifiers.

###### `method(method: string)`

The method to use when making the query. Can be `GET` `POST` `HEAD` `UPDATE`

###### `body(body: object)`

The body of the request. Automatically serialized