# Mocking

Once you have created your models and setup your queries, you pretty much get mocking for free. All you need to do is hack on a `.mock()` modifier, and the query will pass
through the mocks and return a response that matches the model structure you gave the query tool.

When mocking, you will never get conflicting id's on entities, no matter how deeply nested that are. If you explicitly reference the same id on a model in multiple places, you
will still only get a single mocked entity in return.

Given the following mocked query:
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
    body: {
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
}
```

As there is no way for modelizr to determine if the top level model should be mocked as values instead of elements in an array (**Note** modelizr can infer this information __after__
the request has completed based on the response.), you can use the `.valuesOf(schemaAttribute)` modifier to explicitly define how it should be mocked. There is also an
`.arrayOf(schemaAttribute)` modifier to use.

> Do not use these modifiers on child models.

Here is how it is used:
```javascript
query(
    user().valuesOf("type")
)
```
->
```javascript
{
    body: {
        users: {
            1: {
                id: 1,
                firstName: " ... ",
                lastName: " ... ",
                type: "users"
            },
            ...
        }
    }
}
```

If you would like to more precisely configure the mocking system, there is a `.mockConfig()` modifier that can be applied to any query tool.

```javascript
query( ... )
    .mock()
    .mockConfig({
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
        quantity: 25 // Amount of entities to generate unless otherwise specified in a query
    })
```

Please refer to [json-schema-faker](https://github.com/json-schema-faker/json-schema-faker#custom-formats) to learn about these different options