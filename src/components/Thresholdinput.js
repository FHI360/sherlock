import { useAlert} from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, InputField } from '@dhis2/ui'
import ReactSlider from 'react-slider'; // https://zillow.github.io/react-slider/
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import classes from '../App.module.css'


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
  const [matchThresholdWeight, setMatchThresholdWeight] = useState(32)
  const [saveThreshold, setSaveThreshold] = useState(false)
  const [checkProgrammName, setCheckProgrammName] = useState(0)
  const [value, setValue] = useState(50);

  useEffect(()=>{
    setCheckProgrammName(selectedProgramName?.displayName || [])
    
  },[selectedProgramName])

  useEffect(()=>{
    if (validateThreshold()){   
        if (dataStoreProfileExist){ 
          extSetMatchThresh(matchThreshold)
          extSetMatchThreshholdWeight(matchThresholdWeight)
          show({ msg: i18n.t('Matching Threshold settings Updated'), type: 'success' })          
        }
      }else{
        show({ msg: i18n.t('Matching Threshold must be between 0 to 100. Cannot be  ') +matchThreshold, type: 'warning' })
      }
    }
  ,[saveThreshold])

  useEffect(()=>{
    setMatchThreshold(matchingThreshold)
    setMatchThresholdWeight(matchingThresholdWeight)
  },[matchingThreshold, matchingThresholdWeight])
  
  const validateThreshold = () => {
    if ((matchThreshold >= 0 && matchThreshold <=100) || (matchThresholdWeight >= 0 || matchThresholdWeight<=100)){
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
                <div className={classes.thresholdPanelDescription2}>
                <div className="slider-container">
                          <ReactSlider
                            className={classes.horizontalSlider}
                            thumbClassName={classes.sliderThumb}
                            trackClassName={classes.sliderTrack}
                            defaultValue={6}
                            min={0}
                            max={100}
                            value={matchThreshold}
                            onChange={(newValue) => setMatchThreshold(newValue)}
                            onAfterChange={() => {                                         
                              setSaveThreshold((prev)=>!prev)
                            }}
                            // disabled={(checkProgrammName.length === 0 || selectedAttr.length === 0) || showProgramAttributesSave === true}
                          />
                    <div>{i18n.t('Threshold:')} {matchThreshold}</div>
                  </div>
                </div>
        {/* <div className={classes.thresholdPanelDescription2}> */}
                  {/* <div className="slider-container"> */}
                            {/* <ReactSlider
                              className={classes.horizontalSlider}
                              thumbClassName={classes.sliderThumb}
                              trackClassName={classes.sliderTrack}
                              defaultValue={32}
                              min={0}
                              max={100}
                              value={matchThresholdWeight}
                              onChange={(newValue) => setMatchThresholdWeight(newValue)}
                              onAfterChange={() => {                                         
                                setSaveThreshold((prev)=>!prev)
                              }}
                              // disabled={(checkProgrammName.length === 0 || selectedAttr.length === 0) || showProgramAttributesSave === true}
                            /> */}
                        {/* <div>{i18n.t('Weight:')} {matchThresholdWeight}</div> */}


                                {/* <Button disabled={(checkProgrammName.length === 0 || selectedAttr.length === 0) || showProgramAttributesSave === true} 
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
                                </Button> */}
                    {/* </div> */}


        {/* </div> */}
        <p className={classes.threshDescription}>{i18n.t('A threshold value between 0 and 100 to determine auto matching, lower values require a closer match')}
              
              </p>
        </>
      }
      
    </div>
  )
}

ThresholdInput.propTypes = {
    extSetMatchThresh: PropTypes.func.isRequired,
    matchingThreshold: PropTypes.string,
}

export default ThresholdInput