# Fetch API

The internal Fetch API used by Modelizr. The API is a function that accepts all modifications made to the query tool calling it, and returns a promise 
containing the server result.

Basic structure of the API
```javascript
type ConfigType = {
  endpoint: string,
  api: Function,
  headers: ?{[key: string]: string},
  method: ?string,
  mock: ?boolean | Object,
  debug: ?boolean,
  body: ?Object,
  throwOnErrors: boolean
}

export const FETCH_API = (config: ConfigType) => {
  const method: string = (config.method || "POST").toUpperCase()
  let server_response

  return fetch(config.endpoint, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...config.headers
    },
    method,
    ...(method != "GET" && method != "HEAD" ? {
      body: JSON.stringify(config.body)
    } : {})
  })
    .then(res => {
      server_response = res
      return res.json()
    })
      .then(res => {
        if (res.errors && config.throwOnErrors) {
          if (config.throwOnErrors) throw new GraphQLError("The GraphQL server responded with errors.", res.errors)
      }

        return {
          server_response,
          ...res
        }
    })
}
```

If you are wanting to provide your own custom fetch api, then it must return a promise in order to work with modelizr.