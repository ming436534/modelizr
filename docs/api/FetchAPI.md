# Fetch API

The internal Fetch API used by Modelizr. The API is a function that accepts all modifications made to the query tool calling it, and returns a promise 
containing the server result.

Basic structure of the API
```javascript
const api = ({body, path, contentType, headers, method}) => {
    return fetch(path, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': contentType || 'application/json',
            ...headers || {}
        },
        method: method || 'POST',
        body
    }).then(res => res.json())
}
```

If you are wanting to provide your own custom fetch api, then it must return a promise in order to work with modelizr.