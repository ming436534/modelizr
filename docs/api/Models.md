# Models

The created model. This can be given to query tools to generate queries, mock data and normalize responses. Can also be used to validate entities.

### `model([params ,] ...models)`

Define a nested query that can be generated or mocked. If nothing is given to the model, the resulting query will just contain the model key.

`params [object]` - (optional) Parameters that get added to the generated request.

**Note** When mocking, parameters that are specified as `primaryKeys` are used when mocking to create entities with expected ids. A single `param<primaryKey>`
will generate a single mocked entity, and an array of `[param<primaryKey>]` will generate an array of entities

```javascript
query(
    user(
        book()
    ).params({id: 2}),

    book({ids: [1, 2, 3]},
        user().as("author")
    )
).then( ... )
```