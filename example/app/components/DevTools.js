import React from 'react'
import { createDevTools } from 'redux-devtools'
import DockMonitor from 'redux-devtools-dock-monitor'
import LogMonitor from 'redux-devtools-log-monitor'

const DevTools = createDevTools(
    <DockMonitor
        changePositionKey="ctrl-h"
        toggleVisibilityKey="ctrl-w"
        defaultIsVisible={true}
        defaultPosition="bottom"
        defaultSize={0.7}>

        <LogMonitor />
    </DockMonitor>
)

export { DevTools as default, DevTools }