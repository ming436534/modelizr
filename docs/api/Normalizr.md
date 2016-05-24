# Normalizer

This is a wrapper around [normalizr](https://github.com/paularmstrong/normalizr). Please read the normalizr documentation if you are not already familiar with it.

#### `normalize(response, ...models)`

Normalize a response based on given models. Returns the normalized flat-map

```javascript
import { normalize } from 'modelizr'

normalize(
    response,
    user()
)
```

##### `arrayOf(model [, options])`

Extension of normalizrs `arrayOf` utility. Used to describe a model as an element in an array.

##### `valuesOf(model [, options])`

Extension of normalizrs `valuesOf` utility. Used to describe a model as a property in an object.