# Mocking

Once you have created your models and setup your queries, you essentially get mocking for free. All you need to do is hack on a `.mock()` modifier, and the query will return a
response that matches the structure of your query.

When mocking, you will never get conflicting id's on entities, no matter how deeply nested they are. Even if you explicitly reference the same id on a model in multiple places, you
will still only get a single mocked entity in return.

For instance, given the following mocked query:
```javascript
query(
    user(
        book()
    )
)
    .mock()
    .then( ... )
```
We will get the following response:
```javascript
{
    users: [
        {
            id: 1,
            firstName: " ... ",
            lastName: " ... ",
            books: [
                {
                    id: 1,
                    title: " ... ",
                    publisher: " ... "
                },
                ...
            ]
        },

        {
            id: 2,
            ...,
            books: [
                {
                    id: 21,
                    ...
                }
            ]
        },
        ...
    ]
}
```

If you would rather use randomly generated id's, you can use modelizr's `UUID_V4` generator
```javascript
import { query, ID } from 'modelizr'

query(
    user()
)
    .mock(true, {
        idType: ID.RANDOM // defaults to ID.INCREMENT
    })
```
->
```javascript
{
    users: {
        c32f6a49-18ee-4786-a188-0101bf03acd1: {
            id: "c32f6a49-18ee-4786-a188-0101bf03acd1",
            firstName: " ... ",
            lastName: " ... "
        },
        ...
    }
}
```

As there is no way for modelizr to determine if the top level model should be mocked as values, elements in an array or simple a lone entity (**Note** modelizr can determine
this information __after__ the request has completed by examining the response.), you will need to use the modifiers `.valuesOf(schemaAttribute)` and `.arrayOf(schemaAttribute)`
to infer the way in which it should be mocked.

> **Do not use these modifiers on child models.**

Here is how it is used:
```javascript
query(
    user(
        book()
    ).valuesOf("type")
)
```
->
```javascript
{
    users: {
        1: {
            id: 1,
            firstName: " ... ",
            lastName: " ... ",
            type: "users",
            books: [ ... ]
        },
        ...
    }
}
```

If you would like to more precisely configure mock generation, there is a `.mockConfig()` modifier that can be applied to any query tool.

```javascript
query( ... )
    .mockConfig({
        extensions: {
            faker: faker => {}
        },
        quantity: 25,
        delay: 200,
        error: false
    })
```

Check out the entire configuration object [here](../api/Mocks.md#mock-configuration)

Please refer to [json-schema-faker](https://github.com/json-schema-faker/json-schema-faker#custom-formats) to learn about these different options