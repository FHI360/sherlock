import React from 'react'
import PropTypes from 'prop-types'
import { SharedStateContext, useSharedState } from './utils'

const SetupStateProvider = ({ children }) => {
  const sharedState = useSharedState()

  return (
    <SharedStateContext.Provider value={sharedState}>
      {children}
    </SharedStateContext.Provider>
  )
}

SetupStateProvider.propTypes = {
  children: PropTypes.node,
}

export default SetupStateProvider