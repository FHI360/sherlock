import React, { useContext, useEffect, useState } from 'react'
import { useAlert, useDataEngine, useDataQuery } from '@dhis2/app-runtime'
import { createOrUpdateDataStore, modifiedDate, SharedStateContext } from '../utils'
import { config } from '../consts'
import classes from '../App.module.css'
import { IconSave24 } from '@dhis2/ui-icons'
import { Pagination } from '@dhis2/ui'

import {
	Button,
	ButtonStrip,
	DataTable,
	DataTableBody,
	DataTableCell,
	DataTableColumnHeader,
	DataTableRow,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
	TableHead,
} from '@dhis2/ui'
import { Input } from '@dhis2-ui/input'
import Fuse from 'fuse.js';


//api/trackedEntityInstances.json?ou=nLbABkQlwaT&program=FVhEHQDNfxm

//&filter=lw1SqmMlnfh:GT:150:LT:190

export const SearchWorkerComponent = () => {
	const {show} = useAlert(
		({msg}) => msg,
		({type}) => ({[type]: true})
	)
	const engine = useDataEngine();

	const [headers, setHeaders] = useState([])
	const [selectedRow, setSelectedRow] = useState([])

<<<<<<< HEAD
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
    
=======
	const [dataItems, setDataItems] = useState([])
	const [searchName, setSearchName] = useState('')
	const [modalSaveSearch, setShowModalSaveSearch] = useState(false)
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
>>>>>>> 7c52379a6d6e7dddd2d175a8b4970e9d378cf59e


	// console.log(pathname)
	// console.log('selectedSharedOU',selectedSharedOU)
	// console.log('selectedSharedAttr',selectedSharedAttr)
	// console.log('selectedSharedProgram',selectedSharedProgram)
	// console.log('fullOrgUnitSharedSearch',fullOrgUnitSharedSearch)
	// console.log('selectedSharedProgramName',selectedSharedProgramName.displayName)
	// console.log('selectedOUSharedforQuery',selectedOUSharedforQuery)

<<<<<<< HEAD
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
=======
	const joinedString = selectedOUSharedforQuery.join(';');
	// console.log(joinedString)

	const trackedEntityInstances = {
		targetedEntity: {
			resource: 'trackedEntityInstances',
			params: ({orgUnit, prog}) => ({
				ou: joinedString,
				program: selectedSharedProgram,
				fields: "trackedEntityInstance, attributes",
			}),
		},
	}
	const {
		loading: loading,
		error: error,
		data: data,
		refetch: refetch
	} = useDataQuery(trackedEntityInstances, {variables: {orgUnit: selectedSharedOU, prog: selectedSharedProgram}})
>>>>>>> 7c52379a6d6e7dddd2d175a8b4970e9d378cf59e


	useEffect(() => {

<<<<<<< HEAD
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
=======
		if (data) {
			const teis = data?.targetedEntity?.trackedEntityInstances || []

			//Flatten TEI attributes to object attribute
			let _data = teis.map(tei => {
				const attrs = tei.attributes.map(attr => {
					const key = attr.attribute;
					const map = new Map();
					map.set(key, attr.value);
>>>>>>> 7c52379a6d6e7dddd2d175a8b4970e9d378cf59e

					return map;
				});

				const entity = {
					id: tei.trackedEntityInstance,
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

			//Build TEI attributes for use with fuse.js
			const keys = [];
			_data.map(d => Object.keys(d)).flat().forEach(k => {
				if (k !== 'id' && k !== 'selected' && !keys.includes(k)) {
					keys.push(k)
				}
			})
			const options = {
				includeScore: true,
				isCaseSensitive: false,
				keys: keys
			}
			const resultObj = [];
			const fuse = new Fuse(_data, options)
			_data.forEach(d => {
				//Proceed to match only items that are not included in any match yet (selected)
				if (!_data.filter(_d => _d.selected).map(_d => _d.id).includes(d.id)) {
					//Join all available TEI attributes to form search string
					const search = keys.map(k => d[k]).join(' ');
					let matches = fuse.search(search)

					//Filter out self from matches
					matches = matches.filter(r => r.item.id !== d.id)
					const result = {
						//Get back original object
						...teis.find(t => t.trackedEntityInstance === d.id),

						//Add the matched results
						matches: matches.map(m=> {
							//Get back original object
							const match = teis.find(t => t.trackedEntityInstance === m.item.id);

							//Mark self as selected
							const tmp = _data.find(_d=> _d.id === m.item.id)
							_data = _data.filter(d_=> d_.id  !== m.item.id)
							tmp.selected = true;
							_data.push(tmp);

							return {
								...match,
								score: m.score
							}
						})
					}

					//Mark self as selected
					_data = _data.filter(d_=> d_.id  !== d.id)
					d.selected = true;
					_data.push(d);

					resultObj.push(result);
				}
			})

			setDataItems(resultObj)
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
	}, [data])


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
			ProgramName: selectedSharedProgramName,
			key: searchName,
			selectedOU: selectedSharedOU,
			attributesSelected: selectedSharedAttr,
			fullOrgUnitSearch: fullOrgUnitSharedSearch,
			modifiedDate: modifiedDate(),
		};

		createOrUpdateDataStore(engine,
			projectData,
			config.dataStoreSearchHistory,
			searchName, 'create')
			.then(result => {
				const objCreated = result?.httpStatusCode || ''
				if (objCreated !== 201) {
					show({msg: 'Search Name is not Unique :' + searchName, type: 'warning'})
				} else {
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

	// console.log(dataItems.length)

	return (
		<div className={classes.searchResultPage}>

			<div className={classes.searchResultPageControls}>
				<Button
					primary
					onClick={() => {
						setShowModalSaveSearch(true)
					}}
					disabled={!(dataItems.length > 0)}
					loading={loading}
					icon={<IconSave24/>}
				>
					Save
				</Button>
			</div>
			<div>

<<<<<<< HEAD
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
=======
				<DataTable scrollHeight={scrollHeight}>
					{dataItems && dataItems.length > 0 && <TableHead large={true}>
						<DataTableRow>
							<DataTableColumnHeader fixed top="0"/>
							{selectedSharedAttr.map(header => (
								<DataTableColumnHeader key={header.id} fixed top="0">
									{header.displayName.replace(selectedSharedProgramName.displayName + ' ', '')}
								</DataTableColumnHeader>
							)) || []}
>>>>>>> 7c52379a6d6e7dddd2d175a8b4970e9d378cf59e


						</DataTableRow>
					</TableHead>}
					<DataTableBody>

<<<<<<< HEAD
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
=======
						{dataItems && dataItems.length > 0 ? (dataItems.map(instance => (
								<DataTableRow key={instance.trackedEntityInstance}
								              expandableContent={<div
									              style={{backgroundColor: 'lightblue', margin: 8, padding: 4}}>
									              More info about this row!
								              </div>}
								              expanded={selectedRow.some(item => item === instance.trackedEntityInstance)}
								              onExpandToggle={() => {
									              onExpandToggle(instance.trackedEntityInstance)
								              }}

								>
>>>>>>> 7c52379a6d6e7dddd2d175a8b4970e9d378cf59e


									{selectedSharedAttr.length > 0 && selectedSharedAttr.map(header => {
										const attribute = instance.attributes.find(attr => attr.displayName === header.displayName.replace(selectedSharedProgramName.displayName + ' ', ''));

										return (
											<DataTableCell key={header.id}>
												{attribute ? attribute.value : ''}
											</DataTableCell>
										);
									})}


								</DataTableRow>
							))

						) : (
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
						onChange={({value}) => setSearchName(value)}

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

