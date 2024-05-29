import React, { useContext, useEffect, useState } from 'react'
import { useDataQuery, useDataEngine, useAlert, useConfig } from '@dhis2/app-runtime'
import { SharedStateContext, createOrUpdateDataStore, generateRandomId, modifiedDate   } from '../utils'
import { config, SearchHistory} from '../consts'
import classes from '../App.module.css'
import { IconSave24 } from '@dhis2/ui-icons'
import i18n from '@dhis2/d2-i18n'
import { IconLaunch16, IconDelete16, IconLink16, IconThumbDown16} from '@dhis2/ui-icons'
import { Chip } from '@dhis2-ui/chip'

import {
    DataTable,
    DataTableFoot,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    TableHead, TableBody,  Button,
    Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip, Pagination, Tag
  } from '@dhis2/ui'
  import { Input } from '@dhis2-ui/input'
  import Fuse from 'fuse.js';



//api/trackedEntityInstances.json?ou=nLbABkQlwaT&program=FVhEHQDNfxm

//&filter=lw1SqmMlnfh:GT:150:LT:190
const _data = [];
const _teis = [];

export const SearchWorkerComponent = () => {
    const { show } = useAlert(
        ({ msg }) => msg,
        ({ type }) => ({ [type]: true })
      )
    const engine = useDataEngine();
    const { baseUrl, apiVersion } = useConfig()

    const [headers, setHeaders] = useState([])
    const [selectedRow, setSelectedRow] = useState([])

	const [dataItems, setDataItems] = useState([])
	const [pageData, setPageData] = useState([])
	const [filteredData, setFilteredData] = useState(false)


	const [searchName, setSearchName] = useState('')
	const [modalSaveSearch, setShowModalSaveSearch] = useState(false)
	const [scrollHeight, setScrollHeight] = useState('350px');

	const [page, setPage] = useState(1)
	// const [pageCount, setPageCount] = useState(1)
	const [pageSize, setPageSize] = useState(50)
	const [pageTotal, setPageTotal] = useState(0)


    const sharedState = useContext(SharedStateContext)
    const {
        selectedSharedOU,
        selectedSharedAttr,
        selectedSharedProgram,
        fullOrgUnitSharedSearch,
        selectedSharedProgramName,
        selectedOUSharedforQuery,
        matchingSharedThreshold
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
		targetedEntity: {
			resource: 'tracker/trackedEntities',
			params: ({pageSize, page}) => ({
				orgUnit: joinedString,
				program: selectedSharedProgram,
				fields: "trackedEntity, attributes, orgUnit",
				// skipPaging:true,
				pageSize: pageSize,
				page: page
			}),
		},
	}
	const {
		loading: loading,
		error: error,
		data: data,
		refetch: refetch
	} = useDataQuery(trackedEntityInstances, {variables: {page, pageSize}})

	useEffect(() => {

		if (data) {
			if (data?.targetedEntity?.instances?.length) {
				setPage(() => page + 1)
				refetch({page: page, pageSize: pageSize});


				const teis = data?.targetedEntity?.instances || []
				_teis.push(...teis);

				//Flatten TEI attributes to object attribute
				const entities = teis.map(tei => {
					const attrs = tei.attributes.map(attr => {
						const key = attr.attribute;
						const map = new Map();
						let value = attr.value;
						if (value === 'Male') {
							value = 'xxxxxx'
						}
						if (value === 'Female') {
							value = 'ffffff';
						}
						map.set(key, value);

						return map;
					});

					const entity = {
						id: tei.trackedEntity,
						orgUnit: tei.orgUnit,
						//Add selected to remove already matched TEI
						selected: false
					}
					attrs.forEach((attr) => {
						attr.forEach((v, k) => {
							entity[k] = v;
						});
					});

					return entity;
				})

				entities.forEach(entity => {
					if (!_data.find(d => d.id === entity.id)) {
						_data.push(entity);
					}
				})
			} else {
				processData(_data, _teis);
			}
		}

	}, [page, data])


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

	const processData = (data, teis) => {
		console.log('Processing', data)
		//Build TEI attributes for use with fuse.js
		const keys = [];
		data.map(d => Object.keys(d)).flat().forEach(k => {
			if (k !== 'id' && k !== 'selected' && k !== 'orgUnit' && !keys.includes(k)) {
				keys.push(k)
			}
		})

		keys.push({
			name: 'orgUnit',
			weight: 0.3
		})

		const options = {
			includeScore: true,
			isCaseSensitive: false,
			keys: keys,
			useExtendedSearch: true,
			minMatchCharLength: 3,
			fieldNormWeight: 2,
			findAllMatches: true,
			threshold: matchingSharedThreshold
		}
		const resultObj = [];
		const fuse = new Fuse(data, options)
		const matchedIds = [];

		data.forEach(d => {
			//Proceed to match only items that are not included in any match yet (selected)
			if (!data.filter(_d => _d.selected).map(_d => _d.id).includes(d.id)) {
				//Join all available TEI attributes to form search string
				const search = keys.map(k => d[k]).join(' ');
				const adaptedSearchTerm = search.split(' ').map(word => `${word}`).join(' | ')
				console.log('Adapted search', adaptedSearchTerm)
				let matches = fuse.search(adaptedSearchTerm).filter(m => m.score < 1e-20)
				console.log('Matches', matches)
				//Filter out self from matches
				matches = matches.filter(r => r.item.id !== d.id)
				const result = {
					//Get back original object
					...teis.find(t => t.trackedEntity === d.id),

					//Add the matched results
					matches: matches.map(m => {
						matchedIds.push(m.item.id);
						//Get back original object
						const match = teis.find(t => t.trackedEntity === m.item.id);

						//Mark self as selected
						const tmp = data.find(_d => _d.id === m.item.id)
						data = data.filter(d_ => d_.id !== m.item.id)
						tmp.selected = true;
						data.push(tmp);

						return {
							...match,
							score: m.score
						}
					})
				}

				//Mark self as selected
				data = data.filter(d_ => d_.id !== d.id)
				d.selected = true;
				data.push(d);

				resultObj.push(result);
			}
		})
		const filteredResults = resultObj.filter(resultObj => resultObj.matches && resultObj.matches.length > 0);

		setDataItems(filteredResults)
	}

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
        // console.log('matchingThreshold: ', matchingSharedThreshold)

        const projectData = {
            projectName: searchName,
            programid: selectedSharedProgram,
            ProgramName:selectedSharedProgramName,
            key: searchName,
            selectedOU:selectedSharedOU,
            attributesSelected:selectedSharedAttr,
            fullOrgUnitSearch:fullOrgUnitSharedSearch,
            matchingThreshold:matchingSharedThreshold,
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
                    show({ msg: 'Search configuration saved: ' +searchName, type: 'success' })
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

    const logOnPageChange = (page_) => {

        // console.log('logOnPageChange', page_)
        setPage(page_)
        updatePageData(page_, pageSize)
        setFilteredData(true)

    }

    const logOnPageSizeChange = (pageS_ize) => {
        // console.log('logOnPageSizeChange', pageS_ize)
        
        setPageSize(pageS_ize)
        updatePageData(1, pageS_ize)
        // console.log(pageSize)
        setFilteredData(true)

    }

    const updatePageData = (pageInternal, pageSizeInternal) => {
        const startIdx = (pageInternal - 1) * pageSizeInternal
        pageInternal !== page && setPage(pageInternal)
        pageSizeInternal !== pageSize && setPageSize(pageSizeInternal)
        setPageData(dataItems.slice(startIdx, startIdx + pageSizeInternal))
    }

    const ActionTEI = (tei, action)=>{
        if (action === 'Open'){
            console.log('Action: ', action)
            console.log(baseUrl)
            window.open(baseUrl +'/dhis-web-tracker-capture/index.html#/dashboard?tei=vOxUH373fy5&program=IpHINAT79UW&ou=DiszpKrYNg8', '_blank');

        }
        if (action === 'Delete'){
            console.log('Action: ', action)
        }
        if (action === 'Ignore'){
            console.log('Action: ', action)
        }
        if (action === 'Merge'){
            console.log('Action: ', action)
        }
        console.log('tei: ', tei)
    }

    const filteredProjects = filteredData ? pageData : dataItems;


    return(
        <div className={classes.searchResultPage}       >

             <div className={classes.searchResultPageControls}>
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
                page={page}
                pageCount={Math.ceil(dataItems.length / pageSize)}
                pageSize={pageSize}
                total={filteredProjects.length}
                

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

                            {filteredProjects && 
                            filteredProjects.length> 0 ? 
                            (filteredProjects.map(instance => (
                                <DataTableRow key={instance.trackedEntityInstance} 
                                                expandableContent={
                                                    <div style={{backgroundColor: 'lightblue', margin: 8, padding: 4}}>
                                                        
                                                        {/* <Pagination
                                                            // onPageChange={logOnPageChange}
                                                            // onPageSizeChange={logOnPageSizeChange}
                                                            page={10}
                                                            pageCount={21}
                                                            pageSize={50}
                                                            total={1035}
                                                        /> */}
                                                        <DataTable scrollHeight={scrollHeight} className={`${classes.dataTableMargin}`}>
                                                        <TableHead large={true}>
                                                        <DataTableRow>

                                                                        {selectedSharedAttr.map(header => (
                                                                            <DataTableColumnHeader key={header.id} fixed top="0">
                                                                                    {i18n.t(header.displayName.replace(selectedSharedProgramName.displayName + ' ', ''))}
                                                                            </DataTableColumnHeader>
                                                                        )) || []}

                                                                        <DataTableColumnHeader  fixed top="0"> {i18n.t('Score:')} <span style={{marginLeft: '2px', fontStyle:'italic'}}> {i18n.t('lower score represents stronger match')}</span></DataTableColumnHeader>

                                                            </DataTableRow>

                                                        </TableHead>
                                                            <DataTableBody>
                                                            
                                                                    {instance.matches.length > 0 && instance.matches.map(match => ( 
                                                                            <DataTableRow key={match.trackedEntityInstance}>

                                                                            {selectedSharedAttr.map(attr => {
                                                                                    const attribute = match.attributes.find(a => a.displayName === attr.displayName.replace(selectedSharedProgramName.displayName + ' ', ''));
                                                                                    return (
                                                                                        <DataTableCell key={attr.displayName}>
                                                                                            {attribute ? attribute.value : ''}
                                                                                        </DataTableCell>
                                                                                    );
                                                                            })}
                                                                                <DataTableCell>
                                                                                <span>{match.score}</span>
                                                                                <span
                                                                                    className={classes.customImageContainer}
                                                                                    onClick={() => { ActionTEI(match, 'Open')  }}
                                                                                    style={{marginLeft: '15px'}}>
                                                                                    <Tag
                                                                                        icon={<IconLaunch16 />}
                                                                                    >
                                                                                        {i18n.t('Open')}
                                                                                    </Tag>
                                                                                </span>
                                                                                <span
                                                                                    className={classes.customImageContainer}
                                                                                    onClick={() => { ActionTEI(match, 'Delete')  }}
                                                                                    style={{marginLeft: '5px', color: 'red'}}>
                                                                                    <Tag
                                                                                        icon={<IconDelete16 color='red' />}
                                                                                    >
                                                                                        {i18n.t('Delete')}
                                                                                    </Tag>
                                                                                </span>
                                                                                <span
                                                                                    className={classes.customImageContainer}
                                                                                    onClick={() => { ActionTEI(match, 'Merge')  }}
                                                                                    style={{marginLeft: '5px', color: 'red'}}>
                                                                                    <Tag
                                                                                        icon={<IconLink16 color='green' />}
                                                                                    >
                                                                                        {i18n.t('Merge')}
                                                                                    </Tag>
                                                                                </span>
                                                                                <span
                                                                                    className={classes.customImageContainer}
                                                                                    onClick={() => { ActionTEI(match, 'Ignore')  }}
                                                                                    style={{marginLeft: '5px', color: 'red'}}>
                                                                                    <Tag
                                                                                        icon={<IconThumbDown16 />}
                                                                                    >
                                                                                        {i18n.t('Ignore')}
                                                                                    </Tag>
                                                                                </span>




                                                                                </DataTableCell>

                                                                            </DataTableRow>
                                                                    
                                                                    ))}
                                                            



{/* 
                                                                {instance.matches.length > 1 ? (instance.matches.map((matchedItem) => (
                                                                                matchedItem.attributes.map((matches) => (  <DataTableCell>{matches.value}</DataTableCell> ))
                                                                            )                                                                
                                                                        )
                                                                    ) : (

                                                                        <DataTableCell colSpan={selectedSharedAttr.length+1} style={{ textAlign: 'center' }}>No matches found </DataTableCell>
                                                                    )
                                                                } */}
                                                                
                                                           
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
                                    
                                    ) : (
                                        <DataTableRow>
                                            <DataTableCell colSpan={selectedSharedAttr.length+1} style={{ textAlign: 'center' }}>No data to display</DataTableCell>
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

