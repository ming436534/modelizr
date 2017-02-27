import React from 'react'
import { render } from 'react-dom'
import { bindActionCreators } from 'redux'
window.React = React

import store from '../store'
import * as unboundActions from '../actions'
const actions = bindActionCreators(unboundActions, store.dispatch)

import DevTools from './components/DevTools'
import Example from './components/Example'
import { Provider } from 'react-redux'

const App = () => (
	<Provider store={store}>
		<div>
			<Example actions={actions} />

			<DevTools />
		</div>
	</Provider>
)

window.onload = () => {
	render(<App />, document.getElementById('root'))
}