import React from 'react'
import { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

const enhance = connect(({People, Animals, Cats, Dogs, Settings}) => ({
    People,
    Cats,
    Dogs,
    Animals,
    Settings
}))

export default
enhance(class Example extends Component {

    state = {}

    componentDidMount() {
        this.props.actions.toggleMock()
    }

    action = name => e => {
        e.preventDefault()
        const {Settings} = this.props

        this.props.actions[name](Settings.mock)
    }

    render() {
        const {Settings} = this.props

        return (
            <div>
                <button onClick={this.action("fetchPeople")}>FETCH PEOPLE</button>
            </div>
        )
    }
})