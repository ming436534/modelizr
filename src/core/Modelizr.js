// @flow
import _ from 'lodash'

import CreateModel from './CreateModel'
import { ModelFunction } from '../types'

type ClientDescriptionType = {
    config: {
        endpoint: String,
        headers: ?Object<String>,
        mock: ?Boolean,
        debug: ?Boolean
    },
    models: Object
}

export default class Modelizr {

    ClientDescription: ClientDescriptionType;

    models: Object<ModelFunction> = {};

    constructor(ClientDescription: ClientDescriptionType) {
        if (!ClientDescription) throw new Error("Modelizr expects a Client Description as its first parameter")

        this.ClientDescription = ClientDescription

        this.generateModelFunctions()
        this.defineRelationships()
    }

    generateModelFunctions() {
        const {models} = this.ClientDescription

        _.forEach(models, (data, name) => {
            this.models[name] = CreateModel(name)
        })
    }

    defineRelationships() {

    }
}