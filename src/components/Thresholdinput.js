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
                          showProgramAttributesSave,
                          matchingThresholdWeight, 
                          extSetMatchThreshholdWeight,
                          scrollHeight }) => {
  const { show } = useAlert(
        ({ msg }) => msg,
        ({ type }) => ({ [type]: true })
      )
  const [matchThreshold, setMatchThreshold] = useState(matchingThreshold)
  const [matchThresholdWeight, setMatchThresholdWeight] = useState(1e-20)
  const [saveThreshold, setSaveThreshold] = useState(false)
  const [checkProgrammName, setCheckProgrammName] = useState(0)

  useEffect(()=>{
    setCheckProgrammName(selectedProgramName?.displayName || [])
    
  },[selectedProgramName])

  useEffect(()=>{
    if (validateThreshold()){     
        if (dataStoreProfileExist){ 
          extSetMatchThresh(matchThreshold)
          extSetMatchThreshholdWeight(matchThresholdWeight)
          show({ msg: 'Matching Threshold settings Updated', type: 'success' })          
        }
      }else{
        show({ msg: 'Matching Threshold must be between 0 to 1. Cannot be  ' +matchThreshold, type: 'warning' })
      }
    }
  ,[saveThreshold])

  useEffect(()=>{
    setMatchThreshold(matchingThreshold)
    setMatchThresholdWeight(matchingThresholdWeight)
  },[matchingThreshold, matchingThresholdWeight])
  
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
      {checkProgrammName.length > 0 && 
      <>

                <span style={{fontSize:'14px', fontWeight:'bold'}}>{i18n.t('Threshold Parameters:')}</span> <br></br>

                  

        <div className={classes.thresholdPanelDescription}>

            <div className={classes.matchThreshold}>
              <InputField
                name="matchThreshold"
                value={matchThreshold}
                onChange={(e) => {
                                  setMatchThreshold(e.value) 
                                  }}
                disabled={(checkProgrammName.length === 0 || selectedAttr.length === 0) || showProgramAttributesSave === true}
                inputWidth="15px"
                helpText="Threshold"
              />
              <InputField
                name="matchweight"
                value={matchThresholdWeight}
                onChange={(e) => {
                      setMatchThresholdWeight(e.value) 
                                  }}
                disabled={(checkProgrammName.length === 0 || selectedAttr.length === 0) || showProgramAttributesSave === true}
                inputWidth="15px"
                helpText="Weight"
              />
              <Button disabled={(checkProgrammName.length === 0 || selectedAttr.length === 0) || showProgramAttributesSave === true} 
              style={{ 
                                  // alignContent: 'top',
                                  backgroundColor: '#00897B', 
                                  color: 'white', 
                                  border: 'none', 
                                  // padding: '10px 20px', 
                                  borderRadius: '5px',
                                  marginLeft:'5px',
                                marginBottom:'18px' }} 
              onClick={() => {                                         
                                                setSaveThreshold((prev)=>!prev)
                                  }}>
                                    {scrollHeight === '700px' ? i18n.t('Update Threshold Settings') : i18n.t('Update')}
              </Button>
            </div>


        </div>
        <p className={classes.threshDescription}>{i18n.t('A threshold value between 0 and 1 to determine auto matching, lower values require a closer match')}
              
              </p>
        </>
      }
      
    </div>
  )
}

ThresholdInput.propTypes = {
    matchingThreshold: PropTypes.string,
    extSetMatchThresh: PropTypes.func.isRequired,
}

export default ThresholdInput