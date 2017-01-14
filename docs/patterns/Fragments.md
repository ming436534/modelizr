# Fragments

A useful pattern when making multiple queries that use the same sequence of models is to pre-define a query fragment. Something like this:

fragments.js
```javascript
const {models} = new Modelizr({})

const {User, Dog} = models

const DogFragment = Dog(
    user("Owner")
)

export { DogFragment }
```

actions.js
```javascript
import { query } from 'modelizr'
import { BookFragment } from './fragments'

query(
    BookFragment
).then(res => { ... })
```