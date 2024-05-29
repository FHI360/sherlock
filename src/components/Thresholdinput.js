import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useAlert} from '@dhis2/app-runtime'
import classes from '../App.module.css'
import { Button, InputField } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'


const ThresholdInput = ({ matchingThreshold, 
                          extSetMatchThresh, 
                          dataStoreProfileExist, 
                          selectedProgramName, 
                          selectedAttr, 
                          showProgramAttributesSave }) => {
  const { show } = useAlert(
        ({ msg }) => msg,
        ({ type }) => ({ [type]: true })
      )
  const [matchThreshold, setMatchThreshold] = useState(matchingThreshold)
  const [saveThreshold, setSaveThreshold] = useState(false)
  const [checkProgrammName, setCheckProgrammName] = useState(0)

  useEffect(()=>{
    setCheckProgrammName(selectedProgramName?.displayName || [])
    
  },[selectedProgramName])

  useEffect(()=>{
    if (validateThreshold()){     
        if (dataStoreProfileExist){ 
          extSetMatchThresh(matchThreshold)
          show({ msg: 'Matching Threshold Updated to  ' +matchThreshold, type: 'success' })          
        }
      }else{
        show({ msg: 'Matching Threshold must be between 0 to 1. Cannot be  ' +matchThreshold, type: 'warning' })
      }
    }
  ,[saveThreshold])

  useEffect(()=>{
    setMatchThreshold(matchingThreshold)
  },[matchingThreshold])
  
  const validateThreshold = () => {
    if (matchThreshold >= 0 && matchThreshold <=1){
      return true
    }else{
      return false
    }        
  }
  // console.log(checkProgrammName.length)
  // console.log(selectedAttr.length)
  // console.log(showProgramAttributesSave)
  return (

    <div className={classes.thresholdSection}>
      {/* <label htmlFor="matchThreshold" className="threshLabel">
        Matching threshold
      </label> */}
      <div className={classes.matchThreshold}>
        <InputField
          name="matchThreshold"
          value={matchThreshold}
          onChange={(e) => {
                            setMatchThreshold(e.value) 
                            }}
          disabled={(checkProgrammName.length === 0 || selectedAttr.length === 0) || showProgramAttributesSave === true}
          inputWidth="50px"
        />
        <Button disabled={(checkProgrammName.length === 0 || selectedAttr.length === 0) || showProgramAttributesSave === true} 
        style={{ 
                            backgroundColor: '#00897B', 
                            color: 'white', 
                            border: 'none', 
                            padding: '10px 20px', 
                            borderRadius: '5px' }} 
        onClick={() => {                                         
                                          setSaveThreshold((prev)=>!prev)
                            }}>
          Update Threshold
        </Button>
      </div>
      <p className={classes.threshDescription}>{i18n.t('A value between 0 and 1 to determine auto matching, lower values require a closer match')}
        
      </p>
    </div>
  )
}

ThresholdInput.propTypes = {
    matchingThreshold: PropTypes.string,
    extSetMatchThresh: PropTypes.func.isRequired,
}

export default ThresholdInput