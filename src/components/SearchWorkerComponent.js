import React, { useContext, useEffect, useState } from 'react'
import { useDataQuery, useDataEngine, useAlert} from '@dhis2/app-runtime'
import { SharedStateContext, createOrUpdateDataStore, generateRandomId, modifiedDate   } from '../utils'
import { config, SearchHistory} from '../consts'
import classes from '../App.module.css'
import { IconSave24 } from '@dhis2/ui-icons'
import { Pagination } from '@dhis2/ui'

import {
    DataTable,
    DataTableFoot,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    TableHead, TableBody,  Button,
    Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip,
  } from '@dhis2/ui'
  import { Input } from '@dhis2-ui/input'




//api/trackedEntityInstances.json?ou=nLbABkQlwaT&program=FVhEHQDNfxm

//&filter=lw1SqmMlnfh:GT:150:LT:190

export const SearchWorkerComponent = () => {
    const { show } = useAlert(
        ({ msg }) => msg,
        ({ type }) => ({ [type]: true })
      )
    const engine = useDataEngine();

    const [headers, setHeaders] = useState([])
    const [selectedRow, setSelectedRow] = useState([])

    const [dataItems, setDataItems] = useState([])
    const [searchName, setSearchName] = useState('')
    const [modalSaveSearch, setShowModalSaveSearch] = useState(false)

    const [page, setPage] = useState(1)
    const [pageCount, setPageCount] = useState(1)
    const [pageSize, setPageSize] = useState(200)
    const [pageTotal, setPageTotal] = useState(0)




    const [scrollHeight, setScrollHeight] = useState('350px');
    
    const sharedState = useContext(SharedStateContext)
    const {
        selectedSharedOU,
        selectedSharedAttr,
        selectedSharedProgram,
        fullOrgUnitSharedSearch,
        selectedSharedProgramName,
        selectedOUSharedforQuery
      } = sharedState
    


    // console.log(pathname)
    // console.log('selectedSharedOU',selectedSharedOU)
    // console.log('selectedSharedAttr',selectedSharedAttr)
    // console.log('selectedSharedProgram',selectedSharedProgram)
    // console.log('fullOrgUnitSharedSearch',fullOrgUnitSharedSearch)
    // console.log('selectedSharedProgramName',selectedSharedProgramName.displayName)
    // console.log('selectedOUSharedforQuery',selectedOUSharedforQuery)
     
    const joinedString = selectedOUSharedforQuery.join(';');
    // console.log(joinedString)

    const trackedEntityInstances = {
        targetedEntity:{
            resource: 'trackedEntityInstances',
            params: ({ orgUnit, prog}) =>({
                ou: joinedString,
                program: selectedSharedProgram,
                fields: "trackedEntityInstance, attributes",
                // skipPaging:true,
                pageSize:'499',
                page:1
            }),
        },
    }
    const { loading: loading, error: error, data: data, refetch: refetch } = useDataQuery(trackedEntityInstances, {variables: {orgUnit: selectedSharedOU, prog: selectedSharedProgram}})



    useEffect(() => {
        console.log(data)

        if(data){
            const teis = data?.targetedEntity?.trackedEntityInstances || []
            console.log(teis)
            console.log(teis.length)
            setDataItems(teis)
            // if (teis.length > 0){
            //     const selectedHeaders = selectedSharedAttr.map(attr => ({
            //         id: attr.id,
            //         displayName: attr.displayName
            //         }));

            //     setHeaders(selectedHeaders)
            //     // const headers = [...new Set(data.targetedEntity.trackedEntityInstances.flatMap(instance => instance.attributes.map(attr => attr.displayName)))];
            //     console.log('########### headers 1 ###########')
            //     console.log(selectedHeaders)

            // }
        }
    },[data])
    




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

    const onExpandToggle = async (row_tei) => {
        
        // Check if row_tei is already in selectedRow
        const isAlreadySelected = selectedRow.some(item => item === row_tei);

        if (isAlreadySelected) {
            // Remove row_tei from selectedRow
            setSelectedRow(selectedRow.filter(item => item !== row_tei));
          } else {
            // Add row_tei to selectedRow
            setSelectedRow([...selectedRow, row_tei]);
          }   

    }

    const saveSearchHistory = async () => {
        // const key = generateRandomId();

        const projectData = {
            projectName: searchName,
            programid: selectedSharedProgram,
            ProgramName:selectedSharedProgramName,
            key: searchName,
            selectedOU:selectedSharedOU,
            attributesSelected:selectedSharedAttr,
            fullOrgUnitSearch:fullOrgUnitSharedSearch,            
            modifiedDate:modifiedDate(),  
        };

       createOrUpdateDataStore(engine, 
            projectData, 
            config.dataStoreSearchHistory, 
            searchName, 'create')
            .then(result => {
                const objCreated = result?.httpStatusCode || ''
                if (objCreated !== 201 ){
                    show({ msg: 'Search Name is not Unique :' +searchName, type: 'warning' })
                }
                else{
                    handleCloseModal();
                }
            })
            .catch(error => {
                console.log(error)
            }
        );

      
    }

    const handleCloseModal = () => {
        setSearchName('')
        setShowModalSaveSearch(false);
    };

    const logOnPageChange = () => {

        console.log('logOnPageChange')
    }

    const logOnPageSizeChange = () => {
        console.log('logOnPageSizeChange')

    }


    return(
        <div className={classes.searchResultPage}       > 

             <div className={`${classes.searchResultPageControls}`}>
             <Button
                primary
                onClick={() => {
                    setShowModalSaveSearch(true)
                }} 
                disabled={!(dataItems.length > 0)}
                loading={loading}
                icon={<IconSave24 />}
                >
                Save
                </Button>
             </div>
            <div>
     
            <Pagination
                onPageChange={logOnPageChange}
                onPageSizeChange={logOnPageSizeChange}
                // page={page}
                // pageCount={pageCount}
                // pageSize={pageSize}
                // total={pageTotal}
                page={10}
                pageCount={21}
                pageSize={50}
                total={1035}

            />
                <DataTable scrollHeight={scrollHeight} className={`${classes.dataTableMargin}`}>
                    {dataItems && dataItems.length> 0 && <TableHead large={true}>
                    <DataTableRow>
                            <DataTableColumnHeader  fixed top="0" />
                                {selectedSharedAttr.map(header => (
                                    <DataTableColumnHeader key={header.id} fixed top="0">
                                            {header.displayName.replace(selectedSharedProgramName.displayName + ' ', '')}
                                    </DataTableColumnHeader>
                                )) || []}


                    </DataTableRow>
                    </TableHead>}
                        <DataTableBody>

                            {dataItems && dataItems.length> 0 ? (dataItems.map(instance => (
                                <DataTableRow key={instance.trackedEntityInstance} 
                                                expandableContent={<div 
                                                    style={{backgroundColor: 'lightblue', margin: 8, padding: 4}}>
                                                        
                                                        
                                                        <Pagination
                                                            // onPageChange={logOnPageChange}
                                                            // onPageSizeChange={logOnPageSizeChange}
                                                            page={10}
                                                            pageCount={21}
                                                            pageSize={50}
                                                            total={1035}
                                                        />
                                                        <DataTable scrollHeight={scrollHeight} className={`${classes.dataTableMargin}`}>
                                                        <TableHead large={true}>
                                                        <DataTableRow>
                                                                    
                                                                        {selectedSharedAttr.map(header => (
                                                                            <DataTableColumnHeader key={header.id} fixed top="0">
                                                                                    {header.displayName.replace(selectedSharedProgramName.displayName + ' ', '')}
                                                                            </DataTableColumnHeader>
                                                                        )) || []}
                                                                        <DataTableColumnHeader  fixed top="0">Score</DataTableColumnHeader>

                                                            </DataTableRow>

                                                        </TableHead>
                                                        <DataTableBody>
                                                            <DataTableRow>

                                                                
                                                            </DataTableRow>
                                                        </DataTableBody>
                                                        </DataTable>
                                                        
                                                        
                                                        </div>}
                                                expanded={selectedRow.some(item => item === instance.trackedEntityInstance)}
                                                onExpandToggle={() => {
                                                    onExpandToggle(instance.trackedEntityInstance)
                                                }}
                                        
                                        >



                                            {selectedSharedAttr.length > 0 && selectedSharedAttr.map(header => {
                                                const attribute = instance.attributes.find(attr => attr.displayName === header.displayName.replace(selectedSharedProgramName.displayName + ' ', ''));

                                                return (
                                                    <DataTableCell key={header.id} >
                                                        {attribute ? attribute.value : ''}
                                                    </DataTableCell>
                                                );
                                            })}
                                                   

                                        </DataTableRow>
                                    ))
                                    
                                    ) :(
                                        <DataTableRow>
                                        <DataTableCell colSpan="2">No data to display</DataTableCell>
                                        </DataTableRow>

                                    )
                            }
                        

                        </DataTableBody>

{/* 
                    <DataTableFoot>
                        <DataTableRow>
                            <DataTableCell colSpan="4">
                                Footer content
                            </DataTableCell>
                        </DataTableRow>
                    </DataTableFoot> */}
                </DataTable>
        </div>
        <div className={classes.searchResultPageControls}>

             </div>
        {modalSaveSearch && (<Modal><ModalTitle>Save History</ModalTitle>
        
        <ModalContent>


        <Input
                              name="SearchName"
                              placeholder="Create Search"
                              value={searchName}
                              onChange={({ value }) => setSearchName(value)}
                              
                          />
        </ModalContent>
        <ModalActions>
                <ButtonStrip end>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button 
                      primary 
                      onClick={saveSearchHistory}
                      disabled={(searchName.length <= 0) && (dataItems.length <= 0)}
                      >
                        Save Search
                    </Button>
                </ButtonStrip>
        </ModalActions>
        
        </Modal>)}
        </div>
    )
}

