# Query Tools

### `query(...models)`

Generate a GraphQL query

### `mutation(...models)`

Generate a GraphQL mutation

### `request(...models)`

Create a non-graphql request where the response is expected to match the given models. Uses the `.body()` modifier to specify the request body

```javascript
request(
    user()
).mock().normalize(res => {})
```

### `prepare(modifiers)`

A utility method that allows you to apply modifiers to all three of the above query tools. `prepare` accepts a collection of custom modifiers that will get added to each
query tools list of modifiers

###### `custom modifiers`

Each modifier should be a nested function. The root function gets given two parameters:

+ `apply(key, value)` - This method sets the field `key` on the query tool to the value of `value` and then returns the modified query tool.
+ `valueOf(key)` - Returns the value of the field `key` on the query tool.

The child function becomes the modifier. It accepts whatever is passed to it when called on a query tool. This function must return the result of `apply()`

Here is a example of the above described pattern.
```javascript
{
    customModifier: (apply, valueOf) => () => apply()
}
```

###### `prepare.get()`

Returns an object containing the three query tools

```javascript
import { prepare } from 'modelizr'

const { query, mutation, request } = prepare({
    customModifier: (apply, valueOf) => someValue => {
        return apply('someKey', {...valueOf('someKey'), ...someValue})
    }
})
    .headers({ ... })
    .path("http:// ... ")
    .mockConfig({
        quantity: 5,
        delay: 300
    })

query(
    user()
)
    .customModifier({ ... })
    .then( ... )
```