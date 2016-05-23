# Query Preparation

Looking at the way we are using query tools up to this point, we can see how things can quick become very verbose and out of hand when it comes to setting up query tools.
For instance, if we want to make queries, mutations and requests to the same endpoint, using the same headers and the same api - then we will need to apply our
`.path()`, `.headers()` and `.api()` modifiers to all three tools.

To solve this, modelizr exports a `prepare()` helper which allows you to chain query tool modifiers on it. When you are done modifying, you can call `.get()` and have access to
all three tools.

```javascript
import { prepare } from 'mdoelizr'

const {
    query,
    mutation,
    request
} = prepare().path("http:// ... ").headers({ ... }).api(() => {})

query( ... ).then( ... )
```

Additionally, you can pass in a collection of custom modifiers that you would like available on all query tools.

```javascript
const { request } = prepare({
    customPathModifiers: apply => path => apply(`http://localhost/${path}`)
})

request( ... ).customPathModifier('get-users')
```