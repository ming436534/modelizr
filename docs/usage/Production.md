# Production

Modelizr relies on `fakerjs` in order to produce high quality mocks, however this is not so great for production builds where mocks aren't needed and small
file sizes are required. Modelizr therefore only requires `fakerjs` while `NODE_ENV` is not set to `production` and as long as you have dead code removal 
in your build step, your production bundle will be small.

In some situations you may want to keep the stripped dependencies in your production bundle for testing or other reasons. To do this you can manually pass 
`faker` into modelizr via configuration object.
```javascript
import { Modelizr } from 'modelizr'
import faker from 'fakerjs'

const client = new Modelizr({
  models: { ... },
  config: {
    faker
  }
})
```

Now fakerjs will remain in production. You may also use this configuration option to pass in a custom fakerjs instance if you want to extend faker.