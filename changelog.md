# Unpublished

+ `Breaking` - When `NODE_ENV` is set to `production`, the `faker` and `change` dependencies are excluded. To include them, manually extend jsf via the mocking config object.
+ Added warnings in the place of the stripped `faker` and `chance` modules.
+ Added information about the stripped modules to docs.
+ Debugger now groups requests and logs them on completion.
+ Realised isomorphic-fetch wasn't actually being used, and was causing modelizr to break outside of a fetch supported browser. Implemented the dependency.
+ Model parameters are now correctly parsed using `JSON.stringify()`.

# 0.7.5 (June 15th 2016)

+ Restructured internal api to avoid using .apply and .valueOf Object properties.
+ Added a warning for duplicate keys in a query.
+ Can now mock entities with random `UUID_V4` generated ids.
+ When mocking a `mutation`, entities will inherit properties from the parameters of the mutation.

# 0.7.4 (June 13th 2016)

+ When aliasing a model with a string as the models first parameter, modelizr uses the alias() util to perform the alias.

# 0.7.3 (June 4th 2016)

+ Can now pass a key as a model or union's first argument.
+ Can now alias unions in addition to models.
+ No longer support `schemaAttribute`'s in arrayOf and valuesOf model definitions. It is essentially syntactic-sugar for wrapping a `union` in a model definition and adds unnecessary
complexity to modelizr.
+ Added support for a `schemaAttribute` as a `function` to manually infer schemas in a `union`.
+ Added the `'schemaAttribute'` type definition to schemas. This is used when a union has a function `schemaAttribute` option to allow modelizr to correctly mock the field on the entity.

# 0.7.2 (May 24th 2016)

+ Updated docs.
+ Added an `alias(model, key)` tool to alias models.

# 0.7.1 (May 24th 2016)

+ Fixed bug that caused multiple root models to mock conflicting `id`s

# 0.7.0 (May 24th 2016)

+ `Breaking` - Re-wrote request tool. can now specify models. added `.body()` mutator to apply a body to it
+ `Breaking` - Renamed `unionOf` to `union`.
+ The `arrayOf()` and `valuesOf()` definition tools are now exported directly from modelizr
+ Deprecated `.error()` and `.delay` modifiers.
+ Added fields `delay` and `error` to mock configuration object

# 0.6.1 (May 22nd 2016)

+ Deprecated query tool getters on the prepare method. Replaced them with `.get()`.
+ Model `setSchema(schema)` now merges the schema instead of overwriting.
+ Repaired `unionOf` mocking.
+ Added ability to specify jsf options, formats and extensions via a `.mockConfig()` modifier or via the second parameter of `.mock()`.
+ `.then()` modifier gets passed a normalizr tool as the last argument.
+ Passing an object to a prop gets stringified.
+ Union child models get prefixed with `... on ` to represent a union fragment.
+ If specifying a field as a primary key through the `type` property, using a pipe - `|` - you can specify the type of the primary key.
+ When generating mocks for a union, the schema to mock will be chosen from one of the given models in the schema - or, if non are given - the
schema will be chosen from the unions collection of pre-defined models.
+ Added ability to specify the amount of entities to mock by default.

## 0.6.0 (May 10th 2016)

+ Changed internals of sharing mutators across objects.
+ `Breaking` - Solidified the `prepare()` api. Adding custom mutators are now passed `apply` and `valueOf` tools as respective parameters.
+ `Breaking` - Added `.custom()` modifier to make anonymous modifications. Also accepts `apply` and `valueOf` tools.
+ `breaking` - `valuesOf()` and `arrayOf` wrappers now correctly alter mocked entities.
+ `.arrayOf()` `.valuesOf()` modifiers for top level models and unions for forcing definition types.
+ Improved algorithm for determining types of server/mock responses. (arrayOf | unionOf | valueOf)
+ Added `unionOf` sub-model for defining collections of models.
+ Mocking support for unions. (Recursively picks a random model from the unions collection and mocks it)
+ Added ability to specify models as schema property types which is useful for mocking.
+ Added `.setSchema()` modifier for defining models and their associated schemas separately.

## 0.5.1 (May 5th 2016)

+ Importing normalizr tools now happens from `modelizr/lib/normalizer`. This is not 'breaking' as
the previous API for importing normalizr tools was not properly defined.

## 0.5.0 (April 27th 2016)

+ `breaking` Removed auto-id functionality from models
+ Added functionality to specify the primary key of a model by:
    + `primaryKey()` modifier
    + `{type: 'primary'}` schema definition
    + `primaryKey: 'property'` schema definition
+ Added support for aliasing in GraphQL requests by adding an `{alias: 'ID'}` definition to a property