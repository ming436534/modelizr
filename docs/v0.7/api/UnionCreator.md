# Union Creator

Instead of exporting a tool like `unionOf` - modelizr exports a **union creator**. It is used similarly to a model creator, and the resulting union can be used in the same
manner as a **model**.

#### `union(key, models, options)`

Create a new union that can be used in queries, mocked and used to validate entities.

+ `key [string]` - The unions key. This will feature in generated queries, and will be used by normalizr to flat-map entities.
+ `models [object]` - A collection of models that belong to the union.
+ `options [object]` - Additional `normalizr` Schema options. The property `schemaAttribute` is required.

The schemaAttribute is the field on the response that defines of what type the entity is.

```javascript
import { union } from 'modelizr'
import { user, group } from './models'

const member = union('members', {
    user,
    group
}, {schemaAttribute: "type"})
```

You may also pass a function to infer the schema type. The function accepts the entity.

When using a function instead of a string, you will need to specify the name of the schemaAttribute that will get mocked. You can do this in each models schema, or using the
`mockAttribute` property.

```javascript
const member = union('members', {
    user,
    group
}, {schemaAttribute: entity => entity.type})
```

This can now be used in a query
```javascript
// ...

import { query } from 'modelizr'

query(
    member(
        user(),
        group()
    )
).then((res, normalize) => { ... })
```

When mocking a union, a random model from one of the models defined in the query will be selected and mocked for each instance of the union. If no models are provided in the query,
then a random model will be selected from its pre-defined collection of models and mocked for each instance of the union.