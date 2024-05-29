import { useAlert } from '@dhis2/app-runtime'
import {useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import classes from '../../App.module.css'
import OrganisationUnitComponent from '../OrganisationUnitComponent'
import { config, MainTitle, searchBoundarySelected, searchBoundaryfull, panelAction, ProjectAttributedescription } from '../../consts';
import { generateRandomId, modifiedDate, createOrUpdateDataStore, provisionOUs } from '../../utils';
import { useDataEngine } from '@dhis2/app-runtime';
import { Chip } from '@dhis2-ui/chip'

import { IconSave24, IconChevronDown24, IconChevronRight24, IconInfo16 } from '@dhis2/ui-icons'; 
import ProgramComponent from '../ProgramComponent';
import ProjectAttributeComponent from '../ProjectAttributeComponent';
import Thresholdinput from '../Thresholdinput';
import {
    Table,
    TableHead,
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
    Switch,
    Button
  } from '@dhis2/ui';

import { SharedStateContext } from '../../utils'
import ThresholdInput from '../Thresholdinput';
const query = {
    me: {
        resource: 'me',
    },
}


export const Main = () => {
    const { show } = useAlert(
        ({ msg }) => msg,
        ({ type }) => ({ [type]: true })
      )
    
    const engine = useDataEngine();
    const sharedState = useContext(SharedStateContext)

    const {
        selectedSharedOU,
        selectedSharedAttr,
        selectedSharedProgram,
        fullOrgUnitSharedSearch,
        selectedSharedProgramName,
        matchingSharedThreshold
      } = sharedState

    // console.log('selectedSharedOU',selectedSharedOU)
    // console.log('selectedSharedAttr',selectedSharedAttr)
    // console.log('selectedSharedProgram',selectedSharedProgram)
    // console.log('fullOrgUnitSharedSearch',fullOrgUnitSharedSearch)
    // console.log('selectedSharedProgramName',selectedSharedProgramName?.displayName || [])
    // console.log('matchingSharedThreshold',matchingSharedThreshold)

    const navigate = useNavigate();

    const [selectedOU,setSelectedOU] = useState(selectedSharedOU);
    const [selectedAttr,setSelectedAttr] = useState(selectedSharedAttr);
    const [selectedProgram,setSelectedProgram] = useState(selectedSharedProgram);
    const [fullOrgUnitSearch, setFullOrgUnitSearch] = useState(false);
    const [selectedProgramName,setSelectedProgramName] = useState(selectedSharedProgramName?.displayName || []);
    const [matchingThreshold, extSetMatchThresh] = useState(matchingSharedThreshold);
    const [showProgramAttributes, setProgramAttribute] = useState(false);
    const [showProgramAttributesExpand, setProgramAttributeExpand] = useState(true);
    const [showProgramAttributesSave, setProgramAttributeSave] = useState(false);
    const [dataStoreProfileExist, setDataStoreProfile] = useState(false);
    const [selectedOUsave, setSelectedOUSave] = useState(false);
    const [selectedOUforQuery, setSelectedOUforQuery] = useState(false);
    
    // if (error) {

    //     return <span>ERROR: {error?.message}</span>;
    // }
    
    // if (loading) {
    //     return <span>Loading...</span>;
    // }
    useEffect(() => {

        setSelectedOUforQuery(provisionOUs(selectedOU))
        
    }, [selectedOU]); 

    useEffect(() => {

        if (selectedSharedOU.length > 0){
            setSelectedOU(selectedSharedOU)

        }
        if (selectedSharedAttr.length > 0){
            setSelectedAttr(selectedSharedAttr)
            
        }
        if (selectedSharedProgram.length > 0){
            setSelectedProgram(selectedSharedProgram)
            setSelectedProgramName(selectedSharedProgramName)
  
            
        }
        if (fullOrgUnitSharedSearch){
            setFullOrgUnitSearch(fullOrgUnitSharedSearch)
            
        }
        if (matchingThreshold !== null){
            extSetMatchThresh(matchingSharedThreshold)
            
        }

    },[])

    useEffect(()=> {
        sharedState.setMatchingSharedThreshold(matchingThreshold)
        const checkProgrammName = selectedProgramName?.displayName || []
        if (checkProgrammName.length > 0){
            handleSaveorUpdateRecord(dataStoreProfileExist ? 'update' : 'create', selectedAttr);
        }
    },[matchingThreshold])
    
    /***
     * Org Units Selection Function. Responsible populating OrgUnitsSelected with selected OrgUnits
     * 
     */
    const handleOUChange = event => {
        console.log(event.selected)
        setSelectedOU(event.selected)
        setSelectedOUSave(true)
        sharedState.setSelectedSharedProgram(selectedProgram)
    };

    /***
     * Attribute Change Function. Responsible for checkbox functions for attribute
     * 
     */
    const handleAttrChange = (target) => {
        setProgramAttributeSave(true)

        if (selectedAttr.some(attr => attr.id === target.id)) {
            setSelectedAttr(prevSelected => prevSelected.filter(attr => attr.id !== target.id));
        } else {
            setSelectedAttr(prevSelected => [...prevSelected, target]);
        }

    }

    /***
     * Update Attribute record 
     * 
     */
    const handleSaveorUpdateRecord = async (action, data) => {
        const autoGeneratedID = generateRandomId();
        setSelectedOUSave(false)
        const programName = selectedProgramName?.displayName || []
        if (programName.length > 0){
            const projectData = {
                projectName: `${selectedProgramName.displayName.replace(/\s+/g, '')}-${autoGeneratedID}`,
                programid: selectedProgram,
                key: selectedProgram,
                selectedOU:selectedOU,
                attributesSelected:data,
                fullOrgUnitSearch:fullOrgUnitSearch,
                matchingThreshold:matchingThreshold,
                modifiedDate:modifiedDate(),  
            };    
            try {                
                createOrUpdateDataStore(engine, projectData, config.dataStoreName, selectedProgram, action);
                setDataStoreProfile(true)
                constant();         
            } catch (error) {                
                console.error('Error saving to project:', error);
            }
        }
    }

    const handleFindDuplicates = async () => {
        sharedState.setSelectedSharedOU(selectedOU)
        sharedState.setSelectedSharedAttr(selectedAttr)
        sharedState.setSelectedSharedProgram(selectedProgram)
        sharedState.setFullOrgUnitSharedSearch(fullOrgUnitSearch)
        sharedState.setSelectedSharedProgramName(selectedProgramName)
        sharedState.setSelectedSharedOUforQuery(selectedOUforQuery)
        sharedState.setMatchingSharedThreshold(matchingThreshold)
        navigate('/results');
        // history.push('/edit')
    }

    function constant(){

        setProgramAttributeSave(false)
        setProgramAttribute(false);
        setProgramAttributeExpand(true);
        // setSelectedAttr([])
    }


    return(
                <div>            
                    <div className={classes.container}>
                        {/* <div className={classes.topnav}>
                            <a href="#home">Home</a>
                            <a href="#about">About</a>
                            <a href="#contact">Contact</a>
                        </div> */}


                        <div className={classes.middle} >
                            <div className={classes.sidenav}>
                                <OrganisationUnitComponent 
                                    handleOUChange={handleOUChange} 
                                    selectedOU={selectedOU}
                                    selectedProgramName={selectedProgramName?.displayName || []}
                                />
                                        {selectedProgram.length > 0 && dataStoreProfileExist && selectedOUsave && <div className={classes.updateSaveProgramAttributeBtn}>
                                            <Chip
                                                className={classes.customImageContainer}
                                                icon={ <IconSave24 alt="SaveAttributes"/>}
                                                onClick={() => {
                                                    handleSaveorUpdateRecord(dataStoreProfileExist ? 'update' : 'create', selectedAttr);
                                                }}
                                                overflow 
                                                selected
                                                style={{ marginLeft: '10px' }}
                                            >  
                                                { 
                                                    selectedOUsave && dataStoreProfileExist ? (
                                                    'Update OU Search List'
                                                        ) : (
                                                    'Save OU Search List'
                                                    )
                                                }
                                            </Chip>
                                        </div>}
                            </div>
                            <div style={{ width:'100%'}}>                                
                                <div className={classes.headerTitle}>
                                    <h2>{MainTitle}</h2>
                                    
                                    <span>
                                        {panelAction}
                                    </span>
                                </div>
                                <div className={classes.main}>                
                                    <div className={classes.panelmiddle}>
                                        <span style={{fontWeight:'bold' }}> {i18n.t('Select program')}</span>
                                        <div style={{marginTop: '10px' }}>
                                            <ProgramComponent 
                                                selectedProgram={selectedProgram}                                             
                                                setSelectedProgram={setSelectedProgram}
                                                setSelectedProgramName={setSelectedProgramName}
                                                setDataStoreProfile={setDataStoreProfile}
                                            />
                                        </div>
                                        
                                        <div style={{marginTop: '20px' }}>
                                            <ThresholdInput matchingThreshold={matchingThreshold} 
                                                            extSetMatchThresh={extSetMatchThresh}
                                                            dataStoreProfileExist={dataStoreProfileExist}
                                                            selectedProgramName={selectedProgramName}
                                                            showProgramAttributesSave={showProgramAttributesSave}
                                                            selectedAttr={selectedAttr}

                                                            />
                                            </div>
                                        

                                        {selectedProgram.length > 0 && 
                                        <div className={classes.RuleDescription}>
                                            <span><IconInfo16/></span>
                                            <span style={{marginLeft:'5px'}}>
                                                <span style={{fontSize:'14px', fontWeight:'bold'}}>{i18n.t('Rule Description:')}</span> <br></br>
                                                <span style={{fontSize:'11px'}}>
                                                        {i18n.t('Sherlock will search for matches or near matches of the program attributes')}
                                                </span>
                                                 
                                            </span>

                                        </div>
                                        }
                                        {selectedProgram.length > 0 && 
                                        <div style={{ display: 'flex', marginTop: '5px' }}>
                                            <div>
                                                <Button 
                                                    basic 
                                                    onClick={handleFindDuplicates} 
                                                    disabled={!(selectedOU.length > 0 && selectedAttr.length > 0 && selectedProgram.length > 0 && showProgramAttributesSave === false)}
                                                    >                                                        
                                                        {i18n.t('Find Duplicates')}
                                                </Button>
                                            </div>
                                            <div style={{alignContent: 'center', marginLeft:'10px'}}>
                                                <Switch 
                                                    checked={fullOrgUnitSearch === false} 
                                                    label={fullOrgUnitSearch ?  searchBoundaryfull  : searchBoundarySelected}
                                                    onChange={() => {
                                                        setFullOrgUnitSearch((prev) => !prev);
                                                    }}
                                                />
                                            </div>
                                        

                                        </div>
                                        }

                                    </div>
                                    <div className={classes.panelRight}>
                                        <span style={{fontWeight:'bold' }}>
                                                {ProjectAttributedescription}  &nbsp;
                                                <span style={{fontWeight:'normal', fontSize: '12px'}}>
                                                    &#40;{i18n.t('Max of 5')}&#41;
                                                </span>
                                                <span style={{fontWeight:'normal', fontSize: '12px', marginLeft:'50px'}}>
                                                {(selectedProgram.length > 0) && <Chip
                                                    className={classes.customImageContainer}
                                                    icon={ showProgramAttributes ? (
                                                        <IconChevronDown24 alt="Expand" />
                                                    ) : (
                                                        <IconChevronRight24 alt="Collapse" />
                                                    )}
                                                    onClick={() => {
                                                        setProgramAttribute((prev) => !prev);
                                                        setProgramAttributeExpand((prev) => !prev);
                                                    }}
                                                    selected={showProgramAttributesExpand}                                                   
                                                >
                                                    {i18n.t('Add or Remove Attributes in Duplicate Checker')}
                                                    
                                                </Chip>}
                                                </span>
                                        </span>
                                        <div style={{marginTop: '10px' }}>
                                                <ProjectAttributeComponent 
                                                    handleAttrChange={handleAttrChange} 
                                                    selectedAttr={selectedAttr} 
                                                    setSelectedAttr={setSelectedAttr}
                                                    selectedProgramID={selectedProgram}
                                                    extSetMatchThresh={extSetMatchThresh}
                                                    showProgramAttributes={showProgramAttributes}
                                                    setDataStoreProfile={setDataStoreProfile}
                                                    setSelectedOU={setSelectedOU}
                                                />
                                        </div>

                                        <div>


                                        {!showProgramAttributes && <Table className={classes.dataTableProjectAttributes}>

                                                <TableHead>
                                                    <TableRowHead>
                                                        <TableCellHead>{i18n.t('Attribute Name')}</TableCellHead>
                                                        <TableCellHead>{i18n.t('Priority')}</TableCellHead>
                                                    </TableRowHead>


                                                </TableHead>

                                                <TableBody>
                                                    {selectedAttr.map(attr => (

                                                                <TableRow key={attr.id} className={classes.customTableRow}>
                                                                    <TableCell className={classes.customTableCell}>{attr.displayName}</TableCell>
                                                                    <TableCell className={`${classes.customTableCell}`}>Refouse
                                                                    </TableCell>
                                                                </TableRow>
                                                            

                                                    ))}

                                                </TableBody>
                                        </Table>}
                                        {selectedProgram.length > 0 && showProgramAttributesSave && <div className={classes.updateSaveProgramAttributeBtn}>
                                            <Chip
                                                className={classes.customImageContainer}
                                                icon={ <IconSave24 alt="SaveAttributes"/>}
                                                onClick={() => {
                                                    handleSaveorUpdateRecord(dataStoreProfileExist ? 'update' : 'create', selectedAttr);
                                                }}
                                                overflow 
                                                selected
                                                style={{ marginLeft: '10px' }}
                                            >                                     

                                                { 
                                                    showProgramAttributesSave && dataStoreProfileExist ? (
                                                    'Update'
                                                        ) : (
                                                    'Save'
                                                    )
                                                }


                                            </Chip>
                                        </div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                                
                    </div>

                </div>
    )
}