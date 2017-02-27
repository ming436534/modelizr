# Introduction

Modelizr is a tool to simplify data handling in an application. It was specifically written for use with GraphQL - but if you have a REST api instead or some other achitecture, it will
still work with modelizr.

You can use modelizr for writing **queries**, **mocking**, making **requests** and **normalizing** data.

#### `What it solves`

1. When working with a GraphQL server, you will almost always have deeply nested queries and responses that match - but no one wants to work with data that is structured like that.
So we use normalizr, however we then need to write normalizr schemas and describe the structure of the response to normalizr in order for it to know how to flat-map the response.
With modelizr, you get normalizr for free. You write a query and normalizr can infer how to flat-map your response.

2. Trying to integrate mocks into your application can be tedious, especially getting it to return data that matches your GraphQL responses. There is the option of having your
API return mocks according to defined GraphQL types - but what if you haven't constructed the API yet and you still want to mock? Again you get this for free with modelizr.
You write your queries once, and you get mocked data that matches the same structure as the query. Exactly how you would get your real response from GraphQL.

3. Writing queries can be ugly and hard to read, especially as it is hard to format in a text editor or IDE. Modelizr queries are more readable and easier to write.

___

have a look at the [usage example](usage/README.md) to get an idea of how you can integrate it into your application.