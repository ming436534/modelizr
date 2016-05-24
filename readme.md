# modelizr
[![Coverage Status](https://coveralls.io/repos/github/julienvincent/modelizr/badge.svg?branch=master)](https://coveralls.io/github/julienvincent/modelizr?branch=master)
[![Build Status](https://travis-ci.org/julienvincent/modelizr.svg?branch=master)](https://travis-ci.org/julienvincent/modelizr)
[![Gitter](https://badges.gitter.im/julienvincent/modelizr.svg)](https://gitter.im/julienvincent/modelizr?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

A Combination of normalizr, json-schema-faker and GraphQL that allows you to define multipurpose models that can generate GraphQL queries, mock deeply nested data and normalize

## Installation

```
npm i --save modelizr
```

## What can I use this for?

+ Easily generating GraphQL queries from models.
+ Flat-mapping responses using [normalizr](https://github.com/gaearon/normalizr).
+ Mocking deeply nested data that match their query.

___

Read my [medium post](https://medium.com/@julienvincent/modelizr-99e59c1c4431#.applec5ut) on why I wrote modelizr.

## What does it look like?

```javascript
import { model, query } from 'modelizr'

const user = model('users', {
    id: {type: 'primary|integer', alias: 'ID'},
    firstName: {type: 'string', faker: 'name.firstName'}
})

const book = model('books', {
    id: {type: 'primary|integer'},
    title: {type: 'string'}
})
user.define({books: [book]})
book.define({author: user})

query(
    user(
        book()
    ),

    book(
        user().as('author')
    ).params(ids: [1, 2, 3])
)
    .path("http:// ... ")
    .then((res, normalize) => {
        normalize(res.body) // -> normalized response.
    })
```
This will generate the following query and make a request using it.
```
{
  users {
     id: ID,
     firstName,
     books {
        id,
        title
     }
  },
  books(ids: [1, 2, 3]) {
     id,
     title,
     author {
        id: ID,
        firstName
     }
  }
}
```

## Documentation

All documentation is located at [julienvincent.github.io](http://julienvincent.github.io/modelizr)

* [Usage](http://julienvincent.github.io/modelizr/docs/usage)
* [Patterns](http://julienvincent.github.io/modelizr/docs/patterns)
* [Modifiers](http://julienvincent.github.io/modelizr/docs/modifiers)
* [API Reference](http://julienvincent.github.io/modelizr/docs/api)
* [Todo](http://julienvincent.github.io/modelizr/docs/Todo.html)
* [Changelog](http://julienvincent.github.io/modelizr/changelog.html)

## Example

+ `npm i`
+ `npm start`
+ navigate to `http://localhost:8000` in your browser

This is just a basic usage example. More specific examples will come.

## Licence

MIT