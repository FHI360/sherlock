import { useAlert , useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
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
  import { SingleSelectOption, SingleSelect, SingleSelectField  } from '@dhis2-ui/select'
import { IconSave24, IconChevronDown24, IconChevronRight24, IconInfo16, IconArrowUp16} from '@dhis2/ui-icons'; 
import { Chip } from '@dhis2-ui/chip'
import React, {useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from '../../App.module.css'
import { config, MainTitle, searchBoundarySelected, searchBoundaryfull, panelAction, ProjectAttributedescription } from '../../consts';
import { generateRandomId, modifiedDate, createOrUpdateDataStore, provisionOUs , SharedStateContext } from '../../utils';
import OrganisationUnitComponent from '../OrganisationUnitComponent'
import ProgramComponent from '../ProgramComponent';
import ProjectAttributeComponent from '../ProjectAttributeComponent';
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
        matchingSharedThreshold,
        matchingSharedThresholdWeight,
        persistSharedData
      } = sharedState
    
    // console.log('+++++ Main.js ++++++') 
    // console.log('selectedSharedOU',selectedSharedOU)
    // console.log('selectedSharedAttr',selectedSharedAttr)
    // console.log('selectedSharedProgram',selectedSharedProgram)
    // console.log('fullOrgUnitSharedSearch',fullOrgUnitSharedSearch)
    // console.log('selectedSharedProgramName',selectedSharedProgramName?.displayName || [])
    // console.log('matchingSharedThreshold',matchingSharedThreshold)
    // console.log('matchingSharedThresholdWeight', matchingSharedThresholdWeight)
    // console.log('persistSharedData', persistSharedData)

    const navigate = useNavigate();
    const [selectedOU,setSelectedOU] = useState(selectedSharedOU);
    const [selectedAttr,setSelectedAttr] = useState(selectedSharedAttr);
    // Initialize state for selected values
    const [selectedProgram,setSelectedProgram] = useState(selectedSharedProgram);
    const [fullOrgUnitSearch, setFullOrgUnitSearch] = useState(fullOrgUnitSharedSearch);
    const [selectedProgramName,setSelectedProgramName] = useState(selectedSharedProgramName?.displayName || []);    
    const [matchingThreshold, extSetMatchThresh] = useState(matchingSharedThreshold);
    const [matchingThresholdWeight, extSetMatchThreshholdWeight] = useState(matchingSharedThresholdWeight);


    const [showProgramAttributes, setProgramAttribute] = useState(false);
    const [showProgramAttributesExpand, setProgramAttributeExpand] = useState(true);
    const [showProgramAttributesSave, setProgramAttributeSave] = useState(false);
    const [dataStoreProfileExist, setDataStoreProfile] = useState(false);
    const [selectedOUsave, setSelectedOUSave] = useState(false);
    const [selectedOUforQuery, setSelectedOUforQuery] = useState(false);
    const [scrollHeight, setScrollHeight] = useState('350px');
    
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
		const adjustScrollHeight = () => {
			const height = window.innerHeight;
			if (height < 800) {
				setScrollHeight('350px');
			} else {
				setScrollHeight('700px');
			}
		};

		// Adjust scrollHeight initially
		adjustScrollHeight();

		// Add event listener to adjust on resize
		window.addEventListener('resize', adjustScrollHeight);

		// Clean up event listener on component unmount
		return () => {
			window.removeEventListener('resize', adjustScrollHeight);
		};
	}, []);

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
        if (matchingSharedThreshold !== null){
            extSetMatchThresh(matchingSharedThreshold)
            
        }
        if (matchingSharedThresholdWeight !== null){
            extSetMatchThreshholdWeight(matchingSharedThresholdWeight)
            
        }



    },[])

    useEffect(()=> {
        sharedState.setMatchingSharedThreshold(matchingThreshold)
        sharedState.setMatchingSharedThresholdWeight(matchingThresholdWeight)
        const checkProgrammName = selectedProgramName?.displayName || []
        if (checkProgrammName.length > 0){
            handleSaveorUpdateRecord(dataStoreProfileExist ? 'update' : 'create', selectedAttr);
        }
    },[matchingThreshold, matchingThresholdWeight, selectedAttr, selectedOU])
    
    useEffect(()=>{
        handleSaveorUpdateRecord(dataStoreProfileExist ? 'update' : 'create', selectedAttr);
    }, [fullOrgUnitSearch, selectedAttr, selectedOU])
    /***
     * Org Units Selection Function. Responsible populating OrgUnitsSelected with selected OrgUnits
     * 
     */
    const handleOUChange = event => {
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
            console.log('selectedAttr: ',selectedAttr)
            console.log('selectedAttr Lenghts: ',selectedAttr.length )
            if (selectedAttr && selectedAttr.length <= 1){
                setSelectedAttr(prevSelected => [...prevSelected, target]);
            }else{
                show({ msg: i18n.t('Maximum of 2 attributes can be selected for search'), type: 'warning' }) 
                setProgramAttributeSave(false)
            }            
        }
    }

    /***
     * Update Attribute record 
     * 
     */
    const handleSaveorUpdateRecord = async (action, data) => {

        setSelectedOUSave(false)

        const programName = selectedProgramName?.displayName || []
        if (programName.length > 0){
            const projectData = {
                projectName: `${selectedProgramName.displayName.replace(/\s+/g, '')}`,
                programid: selectedProgram,
                key: selectedProgram,
                selectedOU:selectedOU,
                attributesSelected:data,
                fullOrgUnitSearch:fullOrgUnitSearch,
                matchingThreshold:matchingThreshold,
                matchingThresholdWeight:matchingThresholdWeight,
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
        sharedState.setMatchingSharedThresholdWeight(matchingThresholdWeight)
        navigate('/results');
        // history.push('/edit')
    }

    function constant(){

        setProgramAttributeSave(false)
        // setProgramAttribute(false);
        setProgramAttributeExpand(true);
        // setSelectedAttr([])
    }


    const SingleSelectWithState = ({ index, attr }) => {
        console.log("index: ",index, attr)
        const [selected, setSelected] = useState("0");
    
        const handleSelectChange = ({ selected }) => {
            setSelected(selected);
        };
    
        return (
            <SingleSelect
                selected={selected}
                onChange={handleSelectChange}
            >
                <SingleSelectOption value="0" label="0" />
                <SingleSelectOption value="1" label="1" />
            </SingleSelect>
        );
    };

    const moveUp = (index) => {

        if (index > 0) {
            const newDataElements = [...selectedAttr];
            const rowItem = newDataElements[index];
            const rowItemReplaced = newDataElements[index-1];
            newDataElements[index - 1] = rowItem;
            newDataElements[index] = rowItemReplaced;
            setSelectedAttr(newDataElements)
            setProgramAttributeSave(true)           

        }
        
    };

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
                                        {/* {selectedProgram.length > 0 && dataStoreProfileExist && selectedOUsave && <div className={classes.updateSaveProgramAttributeBtn}>
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
                                        </div>} */}
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
                                                            matchingThresholdWeight={matchingThresholdWeight}
                                                            extSetMatchThreshholdWeight={extSetMatchThreshholdWeight}
                                                            scrollHeight={scrollHeight}

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
                                                    &#40;{i18n.t('Max of 2')}&#41;
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
                                                    extSetMatchThreshholdWeight={extSetMatchThreshholdWeight}
                                                    setFullOrgUnitSearch={setFullOrgUnitSearch}
                                                    
                                                />
                                        </div>

                                        <div>


                                        {!showProgramAttributes && <Table className={classes.dataTableProjectAttributes}>

                                                <TableHead>
                                                    <TableRowHead>
                                                        <TableCellHead>{i18n.t('Attribute Name')}</TableCellHead>
                                                        <TableCellHead>{i18n.t('Index')}</TableCellHead>
                                                    </TableRowHead>


                                                </TableHead>

                                                <TableBody>
                                                    {selectedAttr.map((attr, index) => (
                                                        <TableRow key={attr.id} className={classes.customTableRow}>
                                                            <TableCell className={classes.customTableCell}>{attr.displayName}</TableCell>
                                                            <TableCell className={classes.customTableCell}>
                                                            {index}
                                                            {index > 0 && <span onClick={() => moveUp(index)}><IconArrowUp16 /></span>}
                                                                    {/* <SingleSelectWithState index={index} attr={attr}/> */}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                        </Table>}
                                        {/* {selectedProgram.length > 0 && showProgramAttributesSave && <div className={classes.updateSaveProgramAttributeBtn}>
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
                                        </div>} */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                                
                    </div>

                </div>
    )
}