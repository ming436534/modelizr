# Models

The created model. This can be given to query tools to generate queries, mock data and normalize responses. Can also be used to validate entities.

> Entity validation does not yet exist, but it is coming.

Please note that this documentation also applies to **unions**.

### `model([key, params ,] ...models)`

Define a nested query that can be generated or mocked. If nothing is given to the model, the resulting query will just contain the model key.

`params [object]` - (optional) Parameters that get added to the generated request.

`key [string]` - (optional) Pass an alternative key to use for the model. Can use this syntax as a replacement to `aliases` or the `.as()` modifier.
Reference: [#2](https://github.com/julienvincent/modelizr/issues/2)

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

### `alias(model|union, key)`

Create an alias of a **model** or a **union** to improve query readability. Functionally the same as `model().as(key)`

```javascript
import { alias, query } from 'modelizr'
import { book, user } from './models'

const author = alias(user, "author")

query(
    book(
        author()
    )
).then( ... )
```