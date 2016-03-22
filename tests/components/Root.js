import { Component, createFactory, createElement } from 'react'
import { render } from 'react-dom'

import { mock } from '../../src/index'
import { user } from '../models/index'

import store from '../store/index'
import DevTool from './DevTool'
import { div, button } from './elements'
import { requestUsers, mutateUser } from '../actions/index'

class Root extends Component {
    constructor() {
        super()

        this.state = {
            mock: false
        }
    }

    render() {
        const {mock} = this.state

        return div({},
            button({onClick: () => this.setState({mock: !mock})}, `${mock ? 'stop' : 'start'} mocking`),

            button({onClick: () => requestUsers(mock)}, "request users"),
            button({onClick: () => mutateUser(mock)}, "mutate user"),

            DevTool({store})
        )
    }
}

window.onload = () => {
    render(createElement(Root), document.getElementById('root'))
}