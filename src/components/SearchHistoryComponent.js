import React, { useContext, useEffect, useState } from 'react'
import { useDataQuery, useDataEngine } from '@dhis2/app-runtime'
import { SharedStateContext, provisionOUs, deleteObjects } from '../utils'
import classes from '../App.module.css'
import { useNavigate } from 'react-router-dom';
import { config, SearchHistory} from '../consts'

import { IconLaunch16, IconDelete16} from '@dhis2/ui-icons'
import { Chip } from '@dhis2-ui/chip'



import {
    DataTable,
    DataTableFoot,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    TableHead, TableBody 
  } from '@dhis2/ui'




//api/trackedEntityInstances.json?ou=nLbABkQlwaT&program=FVhEHQDNfxm

//&filter=lw1SqmMlnfh:GT:150:LT:190

export const SearchHistoryComponent = () => {

    const [dataItems, setDataItems] = useState([])
    const sharedState = useContext(SharedStateContext)
    const navigate = useNavigate();
    const engine = useDataEngine();

    const searchHistoryQueryMore = {
        dataStore: {
            resource: `dataStore/${config.dataStoreSearchHistory}?${SearchHistory}`,
        }
    };

    const { loading:LoadingSavedRecord, error:ErrorLoadingSavedRecords, data:ExistingRecords, refetch:refetchExistingRecords } = useDataQuery(searchHistoryQueryMore);



    useEffect(() => {

        if(ExistingRecords){
            const searchHistoryList = ExistingRecords?.dataStore?.entries || [];
            // const searchHistoryList = ExistingRecords.dataStore?.entries.filter(entry => entry.programid === selectedSharedProgram) || [];

            setDataItems(searchHistoryList)

        }
    },[ExistingRecords])
  

    const launchSearch = async (projectName) => {
        const selectedSearch = dataItems.filter(item => item.projectName === projectName)
        // console.log(selectedSearch[0])
        sharedState.setSelectedSharedOU(selectedSearch[0].selectedOU)
        sharedState.setSelectedSharedAttr(selectedSearch[0].attributesSelected)
        sharedState.setSelectedSharedProgram(selectedSearch[0].programid)
        sharedState.setFullOrgUnitSharedSearch(selectedSearch[0].fullOrgUnitSearch)
        sharedState.setSelectedSharedProgramName(selectedSearch[0].ProgramName)
        sharedState.setSelectedSharedOUforQuery(provisionOUs(selectedSearch[0].selectedOU))

        navigate('/results');

    }
    const deleteSearch = async (projectName) => {
        deleteObjects(engine, config.dataStoreSearchHistory, projectName, 'Search History Object')
        refetchExistingRecords()
        
    }



    return(
        <div className={classes.searchResultPage} >
            {/* style={{marginTop:'100px'}} */}

            <div className={classes.searchResultPageControls}></div>

  
                <DataTable >
                    <TableHead>
                    <DataTableRow>

                            <DataTableColumnHeader fixed top="0">
                            Project Name

                            </DataTableColumnHeader>
                            <DataTableColumnHeader fixed top="0">
                            Attributes Selected 
                            </DataTableColumnHeader>
                            <DataTableColumnHeader fixed top="0">
                            Selected OU
                            </DataTableColumnHeader>
                            <DataTableColumnHeader fixed top="0">
                            modifiedDate
                            </DataTableColumnHeader>
                         


                    </DataTableRow>
                    </TableHead>
                        <DataTableBody>
                            {dataItems && dataItems.length> 0 ? (dataItems.map(instance => (
                                <DataTableRow key={instance.projectName.replace(/\s+/g, '')}

                                       
                                        >
                                                    <DataTableCell>
                                                    {instance.projectName}
                                                    </DataTableCell>
                                                    <DataTableCell>
                                                        show attributes
                                                    {/* {instance.attributesSelected} */}
                                                    </DataTableCell>
                                                    <DataTableCell>
                                                        show Organization Units
                                                    {/* {instance.selectedOU} */}
                                                    </DataTableCell>
                                                    <DataTableCell>
                                                    <spam>{instance.modifiedDate}</spam>
                                                        {/* <div style={{display: 'flex', gap:'10px'}}>

                                                            <spam>{instance.modifiedDate}</spam>


                                                        </div> */}
                                                          <spam style={{marginLeft: '50px'}}>                                             
                                                    <Chip
                                                            className={classes.customImageContainer}
                                                            onClick={() => { launchSearch(instance.projectName)
                                                                
                                                            }}
                                                            selected
                                                            
                                                            >

                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <div>  
                                                                <span className={classes.iconAddNewProject} style={{ marginTop: '2px' }}>
                                                                <IconLaunch16 />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span style={{ color: 'white', marginLeft: '5px' }}>Launch Search</span>
                                                            </div>
                                                            </div>
                                                            
                                                    </Chip>
                                                    </spam>  
                                                    <spam style={{marginLeft: '2px'}}>                                             
                                                    <Chip
                                                            className={classes.customImageContainer}
                                                            onClick={() => { deleteSearch(instance.projectName)
                                                                
                                                            }}
                                                            
                                                            
                                                            >

                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <div>  
                                                                <span className={classes.iconAddNewProject} style={{ marginTop: '2px' }}>
                                                                <IconDelete16 color='red' />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span style={{ color: 'red', marginLeft: '5px' }}>Delete</span>
                                                            </div>
                                                            </div>
                                                            
                                                    </Chip>
                                                    </spam>  
                                                        
                                                    </DataTableCell>     
                                            

                                        </DataTableRow>
                                    ))
                                    
                                    ) :(
                                        <DataTableRow>
                                        <DataTableCell colSpan="4">No data to display</DataTableCell>
                                        </DataTableRow>

                                    )
                            }
                        

                        </DataTableBody>



                </DataTable>
                
        </div>
    )
}

