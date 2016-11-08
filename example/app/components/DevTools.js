import React from 'react'
import { createDevTools } from 'redux-devtools'
import DockMonitor from 'redux-devtools-dock-monitor'
import Inspector from 'redux-devtools-inspector'

const DevTools = createDevTools(
    <DockMonitor
        changePositionKey="ctrl-h"
        toggleVisibilityKey="ctrl-w"
        defaultIsVisible={true}
        defaultPosition="bottom"
        defaultSize={0.7}>

        <Inspector />
    </DockMonitor>
)

export { DevTools as default, DevTools }