# Unpublished

+ Deprecated query tool mutators on prepare method. Replaced with `.get()`.
+ Model `setSchema(schema)` now merges the schema instead of overwriting.
+ Repaired `unionOf` mocking.
+ Added ability to specify jsf options, formats and extensions via a `.mockConfig()` mutator or via the second parameter of `.mock()`.
+ `.then()` mutator gets passed a normalizr tool as the last argument.
+ Passing an object to a prop gets stringified.
+ Union child models get prefixed with `... on ` to represent a union fragment.
+ If specifying a field as a primary key through the `type` property, using a pipe - `|` - you can specify the type of the primary key.
+ When generating mocks for a union, the schema to mock will be chosen from one of the given models in the schema - or, if non are given - the
schema will be chosen from the unions collection of pre-defined models.
+ Added ability to specify the amount of entities to mock by default.

## 0.6.0 (May 10th 2016)

+ Changed internals of sharing mutators across objects.
+ `Breaking` - Solidified the `prepare()` api. Adding custom mutators are now passed `apply` and `valueOf` tools as respective parameters.
+ `Breaking` - Added `.custom()` mutator to make anonymous mutations. Also accepts `apply` and `valueOf` tools.
+ `breaking` - `valuesOf()` and `arrayOf` wrappers now correctly alter mocked entities.
+ `.arrayOf()` `.valuesOf()` mutators for top level models and unions for forcing definition types.
+ Improved algorithm for determining types of server/mock responses. (arrayOf | unionOf | valueOf)
+ Added `unionOf` sub-model for defining collections of models.
+ Mocking support for unions. (Recursively picks a random model from the unions collection and mocks it)
+ Added ability to specify models as schema property types which is useful for mocking.
+ Added `.setSchema()` mutator for defining models and their associated schemas separately.

## 0.5.1 (May 5th 2016)

+ Importing normalizr tools now happens from `modelizr/lib/normalizer`. This is not 'breaking' as
the previous API for importing normalizr tools was not properly defined.

## 0.5.0 (April 27th 2016)

+ `breaking` Removed auto-id functionality from models
+ Added functionality to specify the primary key of a model by:
    + `primaryKey()` mutator
    + `{type: 'primary'}` schema definition
    + `primaryKey: 'property'` schema definition
+ Added support for aliasing in GraphQL requests by adding an `{alias: 'ID'}` definition to a property