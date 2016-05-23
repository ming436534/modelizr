# Model Modifiers

These modifiers only apply to **models** and **unions**.

#### `as(key)`

Accepts a new key which will be used when generating queries and mocking

```javascript
query(
    book(
        user().as("author")
    )
)
```

#### `params(params)`

Define parameters for the generated query. Parameters that are of type `array` will get directly mapped in, and parameters of type `object` will get stringified.

```javascript
query(
    user().params({
        ids: [1, 2, 3],
        options: {isAdmin: true}
    })
)
```

#### `properties(props [, overwrite])`

Add additional properties to the model, if overwrite is `true`, then the models props will be overwritten.

It is advised to rather add all properties that can be returned to the model before hand, and removed the optional properties from the `required` schema field.

```javascript
query(
    user().properties({
        middleName: {type: "string"}
    })
)
```

#### `only(props)`

Use only the properties specified in `[props]` when generating a query.

```javascript
query(
    user().only(["id", "firstName"])
)
```

#### `except(props)`

Use all properties except those specified in `[props]` when generating a query.

```javascript
query(
    user().except(["lastName"])
)
```

#### `onlyIf(statement)`

Only include this model if `statement` is `true`

```javascript
query(
    user(
        book().onlyIf(shouldQueryBooks)
    )
)
```

#### `normalizeAs(key)`

Generate a query using the models key, but normalize it under a different entity key. You shouldn't really be doing this.

```javascript
query(
    book(
        user().normalizeAs("authors")
    )
)
```

#### `arrayOf(schemaAttribute)`

Forcefully specify the model definition as an array. Should only be applied to top level models. infer the model based on `schemaAttribute`.

```javascript
query(
    user(
        book()
    ).arrayOf("type")
)
```

#### `valuesOf(schemaAttribute)`

Forcefully specify the model definition as values. Should only be applied to top level models. infer the model based on `schemaAttribute`.

```javascript
query(
    user(
        book()
    ).valuesOf("type")
)
```
