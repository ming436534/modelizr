import { describe, it } from "mocha";
import {assert} from 'chai'
import { Schema } from 'normalizr'
import { model } from '../src'

describe("model", () => {

    const _model = model('tests')
    describe("model instance with initial key 'tests'", () => {
        it("Should be a function", () => {
            assert.isFunction(_model)
        })

        it("Should have a 'schema' property", () => {
            assert.property(_model, "schema")
            assert.isObject(_model.schema)

            const {schema} = _model

            describe("schema", () => {
                it("Should have a model property that should be an instance of Schema", () => {
                    assert.property(schema, "key")
                    assert.instanceOf(schema.model, Schema)
                })

                it("Should have a 'key' property of type string", () => {
                    assert.property(schema, "key")
                    assert.isString(schema.key)

                    assert.equal(schema.key, "tests")
                })
            })
        })

        it("Should have a 'define' function", () => {
            assert.property(_model, "define")
            assert.isFunction(_model.define)

            describe("define()", () => {
                const __model = model('second')

                it("Should change the models schema by adding or adding to _mockTypes", () => {

                   // check that define changes _model

                    // assert.change(
                    //     () => _model.define({
                    //         second: __model
                    //     }),
                    //     _model.schema._mockTypes,
                    //     {from: _model.schema._mockTypes}
                    // )
                })
            })
        })
    })
})
