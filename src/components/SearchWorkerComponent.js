import React, { useContext, useEffect, useState } from 'react'
import { useDataQuery, useDataEngine, useAlert, useConfig } from '@dhis2/app-runtime'
import { SharedStateContext, createOrUpdateDataStore, generateRandomId, modifiedDate, delete_tei, customImage ,createMetadata, updateTrackedEntityIgnore  } from '../utils'
import { config, SearchHistory, IgnoreAttrMetadata, IgnoreAttrMetadataProvisioning} from '../consts'
import classes from '../App.module.css'
import { IconSave24, IconDownload24 } from '@dhis2/ui-icons'
import i18n from '@dhis2/d2-i18n'
import { IconLaunch16, IconDelete16, IconLink16, IconThumbDown16} from '@dhis2/ui-icons'
import ActionConfirmation from './ActionConfirmation'
import MergeComponent from './MergeComponent'
import TrackEntityData from './TrackEntityData'

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
let _data = [];
let _teis = [];

const trackedEntityInstances = {
    targetedEntity: {
        resource: 'tracker/trackedEntities',
        params: ({pageSize, page, OUs, selectedSharedProgram}) => ({
            orgUnit: OUs,
            program: selectedSharedProgram,
            fields: "trackedEntity, attributes, orgUnit",
            totalPages: true,
            pageSize: pageSize,
            page: page
        }),
    },
}



const programs = {
    programs: {
        resource: 'programs',
        id: ({ selectedSharedProgram }) => selectedSharedProgram,
        params: {
            // fields:['id', 'name', 'shortName', 'programType', 'programTrackedEntityAttributes'],
            fields:'*',
        },
    },
}

export const SearchWorkerComponent = () => {
    const { show } = useAlert(
        ({ msg }) => msg,
        ({ type }) => ({ [type]: true })
      )
    const engine = useDataEngine();
    const { baseUrl, apiVersion } = useConfig()

    const [headers, setHeaders] = useState([])
    const [filteredProjects, setFilteredProjects] = useState([])
    
    const [selectedRow, setSelectedRow] = useState([])
    const [selectedRowDeleted, setSelectedRowDeleted] = useState([])
    const [selectedMergingItems, setSelectedMergingItems] = useState([])

	const [dataItems, setDataItems] = useState([])
	const [pageData, setPageData] = useState([])
	const [filteredData, setFilteredData] = useState(false)


	const [searchName, setSearchName] = useState('')
	const [modalSaveSearch, setShowModalSaveSearch] = useState(false)
	const [scrollHeight, setScrollHeight] = useState('350px');

	const [page, setPage] = useState(1)
    const [rendered_page, setRendered_page] = useState(1)
	// const [pageCount, setPageCount] = useState(1)
	const [pageSize, setPageSize] = useState(50)
    const [rendered_pageSize, setRendered_PageSize] = useState(50)
    const [pageTotal, setPageTotal] = useState(0)
	const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [mergeAction, setMergeAction] = useState(false)
    const [IgnoreAction, setIgnoreAction] = useState(false)
    const [teiUpdate, setTeiUpdate] = useState([])
    const [trackedEntityType, setTrackedEntityType] = useState('')
    const [selected_tei, setSelected_tei] = useState('')
    const [deleted_tei, setDeletion] = useState('')
    const [reloadTable, setReloadTable] = useState(false)
    const [reloadTableData, setReloadTableData] = useState(false)
	const [fetching, setFetching] = useState('')


    const sharedState = useContext(SharedStateContext)
    const {
        selectedSharedOU,
        selectedSharedAttr,
        selectedSharedProgram,
        fullOrgUnitSharedSearch,
        selectedSharedProgramName,
        selectedOUSharedforQuery,
        matchingSharedThreshold,
        matchingSharedThresholdWeight,
        persistSharedData
      } = sharedState
    
    //   console.log('+++++ SearchWorker.js ++++++') 
    //   console.log('selectedSharedOU',selectedSharedOU)
    //   console.log('selectedSharedAttr',selectedSharedAttr)
    //   console.log('selectedSharedProgram',selectedSharedProgram)
    //   console.log('fullOrgUnitSharedSearch',fullOrgUnitSharedSearch)
    //   console.log('selectedSharedProgramName',selectedSharedProgramName?.displayName || [])
    //   console.log('matchingSharedThreshold',matchingSharedThreshold)
    //   console.log('matchingSharedThresholdWeight', matchingSharedThresholdWeight)
    //   console.log('persistSharedData', persistSharedData)

    const [persistData, setpersistData] = useState([])
    // console.log(pathname)
    // console.log('selectedSharedOU',selectedSharedOU)
    // console.log('selectedSharedAttr',selectedSharedAttr)
    // console.log('selectedSharedProgram',selectedSharedProgram)
    // console.log('fullOrgUnitSharedSearch',fullOrgUnitSharedSearch)
    // console.log('selectedSharedProgramName',selectedSharedProgramName.displayName)
    // console.log('selectedOUSharedforQuery',selectedOUSharedforQuery)
     
    const OUs = selectedOUSharedforQuery.join(';');


	const {
		loading: loading,
		error: error,
		data: data,
		refetch: refetch
	} = useDataQuery(trackedEntityInstances, {variables: {page, pageSize, OUs, selectedSharedProgram}})

    const {
		loading: loadingProgram,
		error: errorProgram,
		data: dataProgram,
		refetch: refetchProgram
	} = useDataQuery(programs, {variables: {selectedSharedProgram}})



    useEffect(()=>{

        if (dataProgram){
            const IgnoreAttributeCreated =  dataProgram
            console.log(dataProgram)
        }
    },[dataProgram])
    useEffect(()=>{


        refetch({page: 1, pageSize: 50, OUs: OUs, selectedSharedProgram: selectedSharedProgram});

    
    },[reloadTable])

   
	useEffect(() => {
        // console.log('data1', data)
        // console.log('page: ', page)
        // console.log('pageSize: ', pageSize)
		if (data) {
			let fetching = '';
			const total = data.targetedEntity.total;
			const totalFetched = page * pageSize;
			if (totalFetched <= total) {
				fetching = `Fetching ${totalFetched} of ${total}...`;
			} else {
				fetching = `Fetching ${total} of ${total}...`;
			}
			setFetching(fetching);
			if (data?.targetedEntity?.instances?.length) {

				setPage(() => page + 1)
				refetch({page: page, pageSize: pageSize, OUs: OUs, selectedSharedProgram: selectedSharedProgram});


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
				setFetching('');
				processData(_data, _teis);
                _data = []
                _teis = []
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



    useEffect(()=> {
        sharedState.setPersistSharedData(persistData)
        // console.log('persistData: ', persistData)

    },[persistData])

    
	const processData = (data, teis) => {
		// console.log('Processing', data)
		//Build TEI attributes for use with fuse.js
        // console.log('data3', data)

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
        // console.log(options)
        const resultObj = []

		const fuse = new Fuse(data, options)
		const matchedIds = [];
		data.forEach(d => {
			//Proceed to match only items that are not included in any match yet (selected)
			if (!data.filter(_d => _d.selected).map(_d => _d.id).includes(d.id)) {
				//Join all available TEI attributes to form search string
				const search = keys.map(k => d[k]).join(' ');
				const adaptedSearchTerm = search.split(' ').map(word => `${word}`).join(' | ')
				// console.log('Adapted search', adaptedSearchTerm)
				let matches = fuse.search(adaptedSearchTerm)
					//Filter out ignore data
					.filter(m => d.sher1dupli1 ? d.sher1dupli1.indexOf(m.item.id) < 0 : true)
					.filter(m => m.score < matchingSharedThresholdWeight)
				// console.log('Matches', matches)
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
        setpersistData(filteredResults)
       
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
            matchingThresholdWeight:matchingSharedThresholdWeight,
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
        setRendered_page(page_)
        updatePageData(page_, rendered_pageSize)
        setFilteredData(true)

    }

    const logOnPageSizeChange = (pageS_ize) => {
        // console.log('logOnPageSizeChange', pageS_ize)
        
        setRendered_PageSize(pageS_ize)
        updatePageData(1, pageS_ize)
        // console.log(pageSize)
        setFilteredData(true)

    }

    const updatePageData = (pageInternal, pageSizeInternal) => {
        const startIdx = (pageInternal - 1) * pageSizeInternal
        pageInternal !== rendered_page && setRendered_page(pageInternal)
        pageSizeInternal !== rendered_pageSize && setRendered_PageSize(pageSizeInternal)
        setPageData(dataItems.slice(startIdx, startIdx + pageSizeInternal))
    }

    const ActionTEI = (tei, action, orgUnit='', tei_parent='', instance, match)=>{
        setSelected_tei(tei)
        if (action === 'Open'){
            // console.log('Action: ', action)
            // console.log(baseUrl)
            window.open(baseUrl +`/dhis-web-tracker-capture/index.html#/dashboard?tei=${tei}&program=${selectedSharedProgram}&ou=${orgUnit}`, '_blank');

        }
        if (action === 'Delete'){
            setDeleteConfirmation(true)
            // delete_tei(engine, tei.trackedEntity)
        }
        if (action === 'Ignore'){
            // console.log('Action: ', action)
            handleCreateTrackedAttribute({'tei_child': match, 'tei_parent':instance})
        }
        if (action === 'Merge'){
            console.log('Action: ', action)
            // console.log('tei_child:', tei)
            // console.log('tei_parent:', tei_parent)
            setSelectedMergingItems({'tei_child': tei, 'tei_parent':tei_parent})
            setMergeAction(true)
            
        }
        // console.log('tei: ', tei)
    }

    const handleClosedDeleteConfirmationModal = ()=>{

        setDeleteConfirmation(false)

    }

    const handleCreateTrackedAttribute = (teiUpdate)=>{
        let mode = ''
        createMetadata(engine, IgnoreAttrMetadata, mode = 'create')
        createMetadata(engine, IgnoreAttrMetadata, mode = 'create').then(result => {
            // console.log('result: ', result)
            const objCreated = result?.httpStatusCode || ''
            if (objCreated !== 201 ){
                const program = selectedSharedProgramName?.displayName || []
                const exist = dataProgram.programs.programTrackedEntityAttributes.filter(d => d.name === program +" Ignored duplicate") || []
                let pushData = dataProgram || []
                if (exist.length === 0){
                    IgnoreAttrMetadataProvisioning.name = program +" Ignored duplicate";
                    IgnoreAttrMetadataProvisioning.program.id = selectedSharedProgram;
                    IgnoreAttrMetadataProvisioning.sortOrder = dataProgram.programs.programTrackedEntityAttributes.length + 1 || 1;
                    IgnoreAttrMetadataProvisioning.displayShortName = program +" Ignored duplicate";
                    IgnoreAttrMetadataProvisioning.displayName = program +" Ignored duplicate";

                    // let pushData = dataProgram || []
                    // Append new object to programTrackedEntityAttributes array

                    pushData.programs.programTrackedEntityAttributes.push(IgnoreAttrMetadataProvisioning);
                    let provisionPushData = {"programs":[pushData.programs]}
                    // console.log(provisionPushData)
                    createMetadata(engine, provisionPushData, mode = 'update')
                    .then(result => {
                        console.log('programTrackedEntityAttributes result: ',result)
                    })
                    .catch(error => {
                        console.log('programTrackedEntityAttributes error: ',error)
                        }
                    )
                }
                console.log(teiUpdate)
                const tei_values = Object.values(teiUpdate);
                const trackedEntityType = pushData?.programs?.trackedEntityType?.id || ''
                setTeiUpdate(teiUpdate)
                setTrackedEntityType(trackedEntityType)
                setIgnoreAction(true)

                // teiUpdate.forEach((tei_value) => {
                //     updateTrackedEntityIgnore(engine, tei_value)
                // })


                // const programTrackedEntityAttributes = {
                //     "programs":[{
                //             "id": "IpHINAT79UW",
                //             "programTrackedEntityAttributes":[
                //                 {
                //                     "name": program +" Ignored duplicate",
                //                     "program": {
                //                         "id": "IpHINAT79UW"
                //                     },
                //                     // "displayInList": true,
                //                     "sortOrder": 1,
                //                     "mandatory": false,
                //                     "allowFutureDate": false,
                //                     "renderOptionsAsRadio": false,
                //                     "searchable": true,
                //                     "valueType": "LONG_TEXT",
                //                     "displayShortName": program +" Ignored duplicate",
                //                     "displayName": program +" Ignored duplicate",
                //                     "id": "sher1dupli2",
                //                     "trackedEntityAttribute": {
                //                         "id": "sher1dupli1"
                //                     }
                //                 }
                //             ]
                //     }]
                // }


            }
        })
        .catch(error => {
            console.log(error)
            }
        )



    }




    useEffect(()=>{
        setFilteredProjects(filteredData ? pageData : dataItems)

    },[pageData,dataItems])



    // console.log('persistSharedData: ', persistSharedData)
    // console.log('filteredData: ', filteredData)
    // console.log('filteredProjects: ', filteredProjects)
    // console.log('pageData: ', pageData)
    // console.log('dataItems: ', dataItems)
    // console.log('deleted_tei: ',selectedRowDeleted)
    useEffect(()=>{
            if (deleted_tei.response === 'Successfull'){
                setSelectedRowDeleted([...selectedRowDeleted, deleted_tei.tei]);
            }
            // console.log('Line added')
    },[deleted_tei])



    return(
        <div className={classes.searchResultPage}       >

	        <div className={classes.searchResultPageControls}>
		        <span>{fetching}</span>
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
		        {/* <Button
                primary
                onClick={() => {
                    setReloadTable((prev)=>!prev)
                }} 
                // disabled={!(dataItems.length > 0)}
                loading={loading}
                icon={customImage('refresh', 'large')}
                >
                Refresh
                </Button> */}
	        </div>


	        <div>

            <Pagination
                onPageChange={logOnPageChange}
                onPageSizeChange={logOnPageSizeChange}
                page={rendered_page}
                pageCount={Math.ceil(dataItems.length / rendered_pageSize)}
                pageSize={rendered_pageSize}
                total={filteredProjects.length}
                

            />
                <DataTable scrollHeight={scrollHeight} className={`${classes.dataTableMargin}`}>
                    {dataItems && dataItems.length> 0 && <TableHead large={true}>
                    <DataTableRow>
                            <DataTableColumnHeader  fixed top="0" />
                            <DataTableColumnHeader  fixed top="0"> OrgUnit </DataTableColumnHeader>
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
                                <DataTableRow key={instance.trackedEntity} 
                                                expandableContent={
                                                    
                                                    <div style={{backgroundColor: 'lightblue', margin: 8, padding: 4}}>
                                             
                                                            <span
                                                                className={classes.customImageContainer}
                                                                onClick={() => { ActionTEI(instance.trackedEntity, 'Open', instance.orgUnit)  }}
                                                                style={{marginLeft: '15px', cursor: selectedRowDeleted.some(item => item === instance.trackedEntity) ? 'not-allowed' : 'pointer'}}>
                                                                <Tag
                                                                    icon={<IconLaunch16 />}
                                                                >
                                                                    {i18n.t('Open')}
                                                                </Tag>
                                                            </span>
                                                            <span
                                                                className={classes.customImageContainer}
                                                                onClick={() => { ActionTEI(instance.trackedEntity, 'Delete', instance.orgUnit)  }}
                                                                style={{marginLeft: '5px', color: 'red', cursor: selectedRowDeleted.some(item => item === instance.trackedEntity) ? 'not-allowed' : 'pointer'}}>
                                                                <Tag
                                                                    icon={<IconDelete16 color='red' />}
                                                                >
                                                                    {i18n.t('Delete')}
                                                                </Tag>
                                                            </span>
                                                      
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
                                                        <DataTableColumnHeader  fixed top="0"> OrgUnit </DataTableColumnHeader>

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
                                                                            <DataTableRow id={match.trackedEntity} key={match.trackedEntity} className={(selectedRowDeleted.some(item => item === match.trackedEntity) ? ` ${classes.deletedItem}` : '')}>
                                                                            <DataTableCell>{match.orgUnit}</DataTableCell>
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
                                                                                    onClick={() => {         
                                                                                        if (!selectedRowDeleted.some(item => item === match.trackedEntity)) {
                                                                                        ActionTEI(match.trackedEntity, 'Open', match.orgUnit);
                                                                                        }  
                                                                                    }}
                                                                                    style={{marginLeft: '15px', cursor: selectedRowDeleted.some(item => item === match.trackedEntity) ? 'not-allowed' : 'pointer'}}
                                                                                    disabled={selectedRowDeleted.some(item => item === match.trackedEntity)}>
                                                                                    <Tag
                                                                                        icon={<IconLaunch16 />}
                                                                                    >
                                                                                        {i18n.t('Open')}
                                                                                    </Tag>
                                                                                </span>
                                                                                <span
                                                                                    className={classes.customImageContainer}
                                                                                    onClick={() => { 
                                                                                        if (!selectedRowDeleted.some(item => item === match.trackedEntity)) {
                                                                                            ActionTEI(match.trackedEntity, 'Delete', match.orgUnit);
                                                                                            }  
                                                                                        
                                                                                         }}
                                                                                        disabled={selectedRowDeleted.some(item => item === match.trackedEntity)}
                                                                                        style={{marginLeft: '5px', color: 'red', cursor: selectedRowDeleted.some(item => item === match.trackedEntity) ? 'not-allowed' : 'pointer'}}
                                                                                    >
                                                                                    <Tag
                                                                                        icon={<IconDelete16 color='red' />}
                                                                                    >
                                                                                        {i18n.t('Delete')}
                                                                                    </Tag>
                                                                                </span>
                                                                                <span
                                                                                    className={classes.customImageContainer}
                                                                                    onClick={() => { if (!selectedRowDeleted.some(item => item === match.trackedEntity)) {
                                                                                        ActionTEI(match.trackedEntity, 'Merge', match.orgUnit, instance.trackedEntity);
                                                                                        }  }}
                                                                                            style={{marginLeft: '5px', color: 'red', cursor: selectedRowDeleted.some(item => item === match.trackedEntity) ? 'not-allowed' : 'pointer'}}
                                                                                            disabled={selectedRowDeleted.some(item => item === match.trackedEntity)}>
                                                                                    <Tag
                                                                                        icon={<IconLink16 color='green' />}
                                                                                    >
                                                                                        {i18n.t('Merge')}
                                                                                    </Tag>
                                                                                </span>
                                                                                <span
                                                                                    className={classes.customImageContainer}
                                                                                    onClick={() => { 
                                                                                        if (!selectedRowDeleted.some(item => item === match.trackedEntity)) {
                                                                                        ActionTEI(match.trackedEntity, 'Ignore', match.orgUnit, instance.trackedEntity, instance, match);
                                                                                        }  }}
                                                                                            style={{marginLeft: '5px', color: 'red', cursor: selectedRowDeleted.some(item => item === match.trackedEntity) ? 'not-allowed' : 'pointer'}}
                                                                                            disabled={selectedRowDeleted.some(item => item === match.trackedEntity)}>
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
                                                expanded={selectedRow.some(item => item === instance.trackedEntity)}
                                                onExpandToggle={() => {
                                                    onExpandToggle(instance.trackedEntity)
                                                }}
                                        
                                        >

                                                <DataTableCell>{instance.orgUnit}</DataTableCell>

                                            {selectedSharedAttr.length > 0 && selectedSharedAttr.map((header,index) => {
                                                const attribute = instance.attributes.find(attr => attr.displayName === header.displayName.replace(selectedSharedProgramName.displayName + ' ', ''));

                                                return (
                                                    
                                                    <DataTableCell id={instance.trackedEntity} key={header.id} className={(selectedRowDeleted.some(item => item === instance.trackedEntity) ? ` ${classes.deletedItem}` : '')}>
                                                        {attribute ? attribute.value : ''}
                                                        {/* {index === 0 && (
                                                        <>
                                                            <span
                                                                className={classes.customImageContainer}
                                                                // onClick={() => { ActionTEI(match, 'Open')  }}
                                                                style={{marginLeft: '15px'}}>
                                                                <Tag
                                                                    icon={<IconLaunch16 />}
                                                                >
                                                                    {i18n.t('Open')}
                                                                </Tag>
                                                            </span>
                                                            <span
                                                                className={classes.customImageContainer}
                                                                // onClick={() => { ActionTEI(match, 'Delete')  }}
                                                                style={{marginLeft: '5px', color: 'red'}}>
                                                                <Tag
                                                                    icon={<IconDelete16 color='red' />}
                                                                >
                                                                    {i18n.t('Delete')}
                                                                </Tag>
                                                            </span>
                                                        </>)} */}
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
        {deleteConfirmation && <ActionConfirmation 
                Action='Delete'     
                title={'Delete Tracked Entity'} 
                message={'Proceed to deletion task. Record would be removed permanently.'}
                handleClosedConfirmationModal={handleClosedDeleteConfirmationModal} 
                ActionFunction={delete_tei}
                engine={engine}
                selected_tei={selected_tei}
                setDeletion={setDeletion}
                
                />}

        {mergeAction && <MergeComponent setMergeAction={setMergeAction} selectedMergingItems={selectedMergingItems}/>}
        {IgnoreAction && <TrackEntityData teiUpdate={teiUpdate} trackedEntityType={trackedEntityType} setIgnoreAction={setIgnoreAction}/>}
        </div>
    )
}

