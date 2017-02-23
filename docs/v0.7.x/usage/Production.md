# Production

Modelizr relies on some large dependencies like `faker` in order to produce high quality mocks, however this is not so great for production builds where mocks aren't needed and small
file sizes are required. Modelizr therefore only requires these large dependencies while `NODE_ENV` is not set to `production` and as long as you have dead code removal in your build
step, your production bundle will be small.

In some situations you may want to keep the stripped dependencies in your production bundle for testing or other reasons. To do this you can manually pass `faker` or `chance` to modelizr
via the mock configuration object.
```javascript
import { prepare } from 'modelizr'
import faker from 'faker'
import chance from 'chance'

const { query, mutation } = prepare().mockConfig({
    exnensions: {
        faker: () => faker,
        chance: () => chance
    }
})
```
Now both `faker` and `chance` will remain in production.