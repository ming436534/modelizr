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

###### ID Mocking

There are two types of id mocking provided by modelizr and they can be toggled in the `configuration object`. The default type, `INCREMENT`, will generate incrementing numerical
ids for each entity. The second, `RANDOM`, will generate a `UUID` id using the `V4` protocol. If you would like to provide your own id generator, you can do so in the
`configuration object`. It will only be used when `idType` is set to `RANDOM`.

Example of changing the idType and adding a custom generator.
```javascript
import { query, ID } from 'modelizr'

query(
    user()
)
    .mock(true, {
        idType: ID.RANDOM,
        idGenerator: () => Math.random()
    })
    .then((res, normalize) => { ... })
```

The mocking 'algorithm' for `INCREMENT` is as follows:

+ If a parameter that matches the models `primaryKey` is provided, then mocking will follow the following pattern:
    + If the `primaryKey` parameter is an array, then an array of entities will be generated with matching values.
    + If the `primaryKey` parameter is an integer, then a single entity with that value will be generated

+ If no `primaryKey` parameter is provided, then mocks will be generated as follows:
    + If the entity is a top level query, then 20 entities will be generated with ids `1 => 20`. (the  quantity can be changed through `.mockConfig({ ... })`)
    + If the entity is nested and is defined in its parent model then it will be mocked according to its normalizr definition. eg:
        + `arrayOf()` and `valueOf()` will generate 20 entities with ids `n + 1 => n + 20`
        + A plain `model` will generate a single entity with id `n + 1`

###### Mocking Mutations

When mocking a `mutation`, model parameters that match their properties will be given to the generated entities, and model parameters that match nested models will be treated as the
nested models' id's. For example:
```javascript
import { mutation } from 'modelizr'
import { user, book } from './models.js'

mutation(
    user({id: "PRESET_ID", firstName: "PRESET_NAME", books: ["PRESET_BOOK_1", "PRESET_BOOK_2"]},
        book()
    )
)
    .mock()
    .query()
    .normalize(res => { ... })

// The result
{
    users: {
        PRESET_ID: {
            id: "PRESET_ID",
            firstName: "PRESET_NAME",
            books: [
                "PRESET_BOOK_1",
                "PRESET_BOOK_2"
            ]
            ... // other properties get generated normally
        }
    },

    books: {
        PRESET_BOOK_1: {
            id: "PRESET_BOOK_1",
            ...
        },
        PRESET_BOOK_2: {
            id: "PRESET_BOOK_2",
            ...
        }
    }
}
```

###### Mock Configuration

```javascript
{
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
    error: true, // Always throw an error when mocking. Default is false
    idType: ID.RANDOM, // The type of id to generate. Defaults to ID.INCREMENT
    idGenerator: () => Math.random() // A custom id generator to use when idType is set to random. Defaults to a UUID_V4 generator
}
```