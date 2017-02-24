# Creating Models

Modelizr is a tool that revolves around the models you create. Query generation, data mocking and normalization are all based on the structure of the models
that you build.

In this usage example we will be creating 4 models:

+ Person
+ Dog
+ Cat
+ Animal - `Union of Dog and Cat`

Models are defined by creating schemas. These schemas are then converted into Modelizr models and can be then used in queries. When creating these schemas we need to describe:

+ The model's **normalization key**. This is a string that all variations of the model will be normalized as.
+ The model's **fields** and **field types**. These are used when generating the GraphQL request and mocking a response.
+ Other model relationships that are associated with the model.

```javascript
const Person = {
  normalizeAs: "People",
  fields: {
    id: {
      type: String,
      alias: "ID" // The generated query will contain the alias ID
    },
    firstName: String,
    age: Number,
    Friend: "Person", // Reference the 'Person' model as a relationship
    Pets: ["Animal"] // Wrapping a reference in an array indicates a collection
  },
  primaryKey: "id" // Which field to use as the primary key. Defaults to 'id'
}
```

```javascript
const Dog = {
  normalizeAs: "Dogs",
  fields: {
    __type: String,
    id: String,
    breed: String,
    name: String,
    Owner: "Person"
  }
}
```

```javascript
const Cat = {
  normalizeAs: "Cats",
  fields: {
    __type: String,
    id: String,
    name: String,
    Owner: "Person"
  }
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

Now that we have defined out model data, we can pass it into modelizr and get back model functions which are used when making queries:

```javascript
import { Modelizr } from 'modelizr'

const {models, query, mutate, fetch} = new Modelizr({
  models: {
    Person,
    Dog,
    Cat,
    Animal
  },
  config: {
    endpoint: "http:// ..."
  }
})

const {Person, Dog, Cat, Animal} = models
```
