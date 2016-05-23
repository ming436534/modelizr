# Creating Models

Modelizr is a tool that revolves around the models you create. Generated queries, mocked data and normalizing are all based on of the structure of the models
tha you define. The models are a mix between json-schema-faker schemas and normalizr schemas.

When defining normalizr schemas, normalizr provides you with three tools - `arrayOf()`, `valuesOf()` and `unionOf` - to help describe your data structure. Modelizr
exports similar tools **but they are not the same**. Do not attempt to use normalizr's tools when working with modelizr models. Additionally, modelizrs' version of `unionOf()`
(called `union`) should be used in a similar manor to `models` - but more on that later.

Going forward with this usage example, we will be creating three models - **user**, **group** and **book** - and a union model - **owner**. Each model will get a key to describe
its entity collection, and a schema to describe the structure of the model.

```javascript
import { model, union } from 'modelizr'

const user = model('users', {
    id: {type: "primary"},
    firstName: {type: "string", faker: "name.firstName"},
    lastName: {type: "string", faker: "name.lastName"}
})

const book = model('books', {
    id: {type: "primary"},
    title: {type: "string"},
    publisher: {type: "string"}
})

const group = model('groups', {
    id: {type: "primary"}
})
```
These are basic model representations. Look at the API reference to see what else can be done with schemas.

We can now further describe the relationship between these two models. A **user** might own a collection of books, which would result in an array of the **book** model.

```javascript
import { arrayOf } from 'modelizr'

user.define({
    books: arrayOf(book)
})
```
Or as a shorthand for `arrayOf` we can wrap the model in `[]`.
```javascript
user.define({
    books: [book]
})
```

A **book** might have an author, which would result in a single **user** model. We can define this like so:

```javascript
book.define({
    author: user
})
```

A **group** will just have a collection of users. In other words, an `arrayOf(**user**)`

```javascript
group.define({
    users: [user]
})
```

And finally our **owner** union will be a collection of users and groups. The union needs to have a `schemaAttribute` specified to allow normalizr to determine the model.

```javascript
const owner = union('owners', {
    user,
    group
}, {schemaAttribute: 'type'})
```