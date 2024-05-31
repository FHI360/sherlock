
import { useDataQuery } from '@dhis2/app-runtime'
import { useEffect, useState } from 'react';
import { SingleSelect, SingleSelectOption  } from '@dhis2-ui/select'
import { Checkbox } from '@dhis2/ui'
import classes from '../App.module.css'
import { Chip } from '@dhis2-ui/chip'
import { customImage } from '../utils';
import { config, ProjectsFiltersMore} from '../consts'
import { IconChevronDown24, IconChevronRight24 } from '@dhis2/ui-icons'; 
import i18n from '@dhis2/d2-i18n'

const query = {
    programTrackedEntityAttributes: {
        resource: "programs",
        id: ({ id }) => id,
        params: {
            fields:['id', 'displayName', 'programTrackedEntityAttributes'],
            paging: 'false'
        },
    }
}

const ProjectAttributeComponent = ({
    handleAttrChange, 
    selectedAttr, 
    setSelectedAttr, 
    selectedProgramID, 
    showProgramAttributes, 
    setDataStoreProfile, 
    setSelectedOU,
    extSetMatchThresh,
    extSetMatchThreshholdWeight
    }) => {
    const { loading, error, data, refetch } = useDataQuery(query, {variables: {id: selectedProgramID}})
    
    const dataStoreQueryMore = {
        dataStore: {
            resource: `dataStore/${config.dataStoreName}?${ProjectsFiltersMore}`,
        }
    };

    const { loading:LoadingSavedRecord, error:ErrorLoadingSavedRecords, data:ExistingRecords, refetch:refetchExistingRecords } = useDataQuery(dataStoreQueryMore);
    const [attrList, setAttributeList] = useState([])
    
    useEffect(()=>{

        if(data){

            const attrs = data?.programTrackedEntityAttributes?.programTrackedEntityAttributes || []
            // console.log(attrs)
            if (attrs.lenght > 0)
            console.log(attrs)
                {
                const attrsFiltered = attrs.map(attr => ({
                    id: attr.id,
                    displayName: attr.displayName,
                    searchable:attr.searchable
                }))
                setAttributeList(attrsFiltered)
            }
        
        }

    },[data])

    useEffect(() => {
        setSelectedAttr([])
        refetchExistingRecords()
        try {    

            if (ExistingRecords) {
                const newProjects = ExistingRecords.dataStore?.entries.filter(entry => entry.key === selectedProgramID) || [];
                // check if project profile exist in datastore
                if (newProjects.length > 0){
                    setDataStoreProfile(true)
                }
                const initialSelectedAttr = newProjects[0]?.attributesSelected || []
                const storedOU = newProjects[0]?.selectedOU || []
                const storedMatchingThreshold = newProjects[0]?.matchingThreshold || 0.6
                const storedMatchingThresholdWeight = newProjects[0]?.matchingThresholdWeight || 1e-20
                setSelectedAttr(initialSelectedAttr);
                setSelectedOU(storedOU);
                extSetMatchThresh(storedMatchingThreshold)
                extSetMatchThreshholdWeight(storedMatchingThresholdWeight)
            }
        } catch (error) {

            console.error('Error fetching data:', ErrorLoadingSavedRecords);
        }

    }, [selectedProgramID ]);


    useEffect(() => {
        refetch({ id: selectedProgramID })
        
    }, [selectedProgramID]); 

 

    if (error) {
        return <div className={classes.programAttributeEmptyContainer}>
                    <span style={{ textAlign: 'center' }}>Select a program</span>
                </div>
    }

    if (loading) {
        return <span>Loading...</span>
    }
    return (
        <div>
            {showProgramAttributes && attrList.map(({ id, displayName, searchable }) => (

                searchable===true &&

                <div key={id}>
                    <Checkbox
                            checked={selectedAttr.some(attr => attr.id === id)}
                            label={i18n.t('{{displayName}}', { displayName: displayName })}
                            onChange={() => handleAttrChange({ id:id, displayName:displayName })}
                            name={displayName}
                            value={displayName}
                        />
                    {/* <label style={{marginLeft:'10px'}} htmlFor={id}>{displayName}</label> */}
                </div>
            ))}

        </div>
    )}

export default ProjectAttributeComponent