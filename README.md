# modelizr
[![Coverage Status](https://coveralls.io/repos/github/julienvincent/modelizr/badge.svg?branch=master)](https://coveralls.io/github/julienvincent/modelizr?branch=master)
[![Build Status](https://travis-ci.org/julienvincent/modelizr.svg?branch=master)](https://travis-ci.org/julienvincent/modelizr)
[![npm version](https://badge.fury.io/js/modelizr.svg)](https://badge.fury.io/js/modelizr)
[![Gitter](https://badges.gitter.im/julienvincent/modelizr.svg)](https://gitter.im/julienvincent/modelizr?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

A Combination of normalizr, fakerjs and GraphQL that allows you to define multipurpose models that can generate GraphQL queries, mock deeply nested data and normalize

## Installation

`$ yarn add modelizr`

## What can I use this for?

+ Easily generating GraphQL queries from models.
+ Flat-mapping responses using [normalizr](https://github.com/gaearon/normalizr).
+ Mocking deeply nested data that match the structure of a GraphQL query.

___

Read my [medium post](https://medium.com/@julienvincent/modelizr-99e59c1c4431#.applec5ut) on why I wrote modelizr.

## What does it look like?

```javascript
import { Modelizr } from 'modelizr'

const ModelData = {
  Person: {
    normalizeAs: "People",
    fields: {
      id: Number,
      firstName: String,
      Books: ["Book"]
    }
  },
    
  Book: {
    normalizeAs: "Books",
    fields: {
      id: Number,
      title: String,
      Author: "Person"
    }
  }
}

const {query, models: {Person, Book}} = new Modelizr({
  models: ModelData,
  config: {
    endpoint: "http:// ..."
  }
})

query(
  Person({id: 1}
    Book("Books")
  ),
  
  Book("Books", {ids: [4, 5]})
).then((res, normalize) => {
  normalize(res.body) // -> normalized response.
})
```
This will generate the following query and make a request using it.
```
{
  Person(id: 1) {
    id,
    firstName,
    Books {
      id,
      title
    }
  },
  
  Books(ids: [4, 5]) {
    id,
    title,
    Author {
      id,
      firstName
    }
  }
}
```

## Documentation

**NOTE:** Documentation for pre-`v1.0.0` can be found [Here](https://github.com/julienvincent/modelizr/tree/master/docs/v0.7.x)

All documentation is located at [julienvincent.github.io/modelizr](http://julienvincent.github.io/modelizr)

* [Usage](http://julienvincent.github.io/modelizr/docs/usage)
* [Patterns](http://julienvincent.github.io/modelizr/docs/patterns)
* [API Reference](http://julienvincent.github.io/modelizr/docs/api)
* [Changelog](https://github.com/julienvincent/modelizr/releases)

## Example

+ `$ yarn`
+ `$ yarn start`

navigate to `http://localhost:8000` in your browser
