# Creating Models

Modelizr is a tool that revolves around the models you create. Query generation, data mocking and normalization` are all based on the structure of the models
that you build.

In this usage example we will be creating 4 models:

+ Person `[model]`
+ Dog `[model]`
+ Cat `[Model]`
+ Animal `[union(Dog, Cat)]`

Models are just json objects that are then interpreted into modelizr models. When creating these models we need to describe:

+ The model's **name**. This is later used internally and externally as a reference.
+ The model's **normalization key**. This is a key that all variations of the model will be normalized under.
+ The model's **fields** and **field types**. These are used when generating the GraphQL request and mocking a response.

Model fields can also contain relationship references to other models by referencing their model name and collection's of data can be referenced with an array `[ ]`.

```javascript
const Person = {
    normalizeAs: "People",
    fields: {
        id: String,
        firstName: String,
        age: Number,
        Friend: "Person",
        Pets: ["Animals"]
    },
    primaryKey: "id"
}
```

```javascript
const Dog = {
    normalizeAs: "Dogs",
    fields: {
        __type: String,
        id: String,
        breed: String,
        Owner: "Person"
    },
    primaryKey: "id"
}
```

```javascript
const Cat = {
    normalizeAs: "Cats",
    fields: {
        __type: String,
        id: String,
        type: String,
        Owner: "Person"
    },
    primaryKey: "id"
}
```

Creating a union is done using a utility tool. To create a union you need to define an array of **models** of which it is a union of, and a schemaAttribute which is a key on each model
that describes the type of model it is.

```javascript
import { union } from 'modelizr'

const Animal = union({
    models: ["Cat", "Dog"],
    schemaAttribute: "__type"
})
```

Now that we have defined out model data, we can pass it into modelizr get get back model functions which are used when making queries:

```javascript
import { Modelizr } from 'modelizr'

const {models, query, mutate, fetch} = new Modelizr({
    models: {
        User,
        Dog,
        Cat,
        Animal
    },
    config: {
        endpoint: "http:// ..."
    }
})

// models = {User, Dog, Cat, Animal}: Object<Function>
```