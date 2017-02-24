# Models

Modelizr model functions are generated from schemas. These model functions are what is used when constructing GraphQL queries and mutations. They have various
properties to make it more convenient to work with them.

Model functions are a type of `Builder Function` that means they always return another model function when called or chained. Although they are functions, they do
not need to be executed in order to be used in queries, but more on that later.

#### Execution `<Model>([fieldName: string, params: object, ...children: Model])`

All models can be executed with three optional parameters. When executed, the model function returns a new model function.

###### fieldName `string`

If specified, this changes the fieldName in the generated query. As an example, A model with `name: Person` would generate the following query:

```javascript
{
  Person {
    id,
    name,
    ...
  }
}
```

Specifying the fieldName as friend - `Person("Friend")` - would generate the following:

```javascript
{
  Friend {
    id,
    name,
    ...
  }
}
```

###### params `object`

If specified, this adds parameters to the generated query. As an example, `Person({id: 1})` would generate the following query:

```javascript
{
  Person(id: 1) {
    id,
    name,
    ...
  }
}
```

###### children `...Model`

All additional arguments may be Model children and will result in the children model's fields being added as sub-fields. As an example, `Person(Dog)` will
generate the following query:

```javascript
{
  Person {
    id,
    name,
    ...,
    Dog {
      id,
      ...
    }
  }
}
```

#### Modifiers

In addition to execution parameters, there are a few modifiers which can be applied to models. Modifiers also return a new Model Function when called.

###### `.only(fields: Array<string>)`

Limits the generated fields to only contain fields

```javascript
query(
  Person.only(["name"])
)

...

{
  Person {
    name
  }
}
```

###### `.without(fields: Array<string>)`

Limits the generated fields to not contain certain fields

```javascript
query(
  Person.without(["name"])
)

...

{
  Person {
    id,
    ...
  }
}
```

###### `.empty()`

Remove all fields from the generated query. Commonly used when making empty mutations

```javascript
mutate(
  Person({id: 1, name: "James"}).empty()
)

...

mutation modelizr_mutation {
  Person(id: 1, name: "James")
}
```