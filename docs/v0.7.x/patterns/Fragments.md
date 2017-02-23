# Fragments

A useful pattern when making multiple queries that use the same sequence of models is to pre-define a query fragment. Something like this:

fragments.js
```javascript
import { user, book } from './models'

const BookFragment = book(
    user().as('author')
)

export { BookFragment }
```

actions.js
```javascript
import { query } from 'modelizr'
import { BookFragment } from './fragments'

query(
    BookFragment
).then(res => { ... })
```