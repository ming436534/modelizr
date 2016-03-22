import { Component, createFactory, createElement } from 'react'
import { render } from 'react-dom'

import store from '../store/index'
import DevTool from './DevTool'
import { div, button } from './elements'
import { requestUsers, mutateUser, mutateUserAndFetch } from '../actions/index'

class Root extends Component {
    constructor() {
        super()

        this.state = {
            mock: true
        }
    }

    render() {
        const {mock} = this.state

        return div({style: {display: 'flex', justifyContent: 'center'}},
            button({onClick: () => this.setState({mock: !mock})}, `${mock ? 'stop' : 'start'} mocking`),

            button({onClick: () => requestUsers(mock)}, "request users"),
            button({onClick: () => mutateUser(mock)}, "mutate user"),
            button({onClick: () => mutateUserAndFetch(mock)}, "mutate user and fetch"),

            DevTool({store})
        )
    }
}

window.onload = () => {
    render(createElement(Root), document.getElementById('root'))
}