import { compose, createStore, applyMiddleware } from 'redux'
import DevTools from '../app/components/DevTools'
import reducers from '../reducers/index'
import thunk from 'redux-thunk'

const store = createStore(
    reducers,
    compose(
        applyMiddleware(thunk),
        DevTools.instrument()
    )
)

export { store as default, store }