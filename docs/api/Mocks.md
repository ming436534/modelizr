# Mocks

#### `mock(...models)`

Generate fake data that follows the given model definitions.

```javascript
import { mock } from 'modelizr'

mock(
    user()
).then((res, normalize) => {
        ...
    })
```
The mocking 'algorithm' is as follows:

+ If a parameter that matches the models `primaryKey` is provided, then mocking will follow the following pattern:
    + If the `primaryKey` parameter is an array, then an array of entities will be generated with matching values.
    + If the `primaryKey` parameter is an integer, then a single entity with that value will be generated

+ If no `primaryKey` parameter is provided, then mocks will be generated as follows:
    + If the entity is a top level query, then 20 entities will be generated with ids `1 => 20`. (the  quantity can be changed through `.mockConfig({ ... })`)
    + If the entity is nested and is defined in its parent model then it will be mocked according to its normalizr definition. eg:
        + `arrayOf()` and `valueOf()` will generate 20 entities with ids `n + 1 => n + 20`
        + A plain `model` will generate a single entity with id `n + 1`