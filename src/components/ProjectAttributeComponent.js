
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Checkbox } from '@dhis2/ui'
import { IconChevronDown24, IconChevronRight24 } from '@dhis2/ui-icons'; 
import { Chip } from '@dhis2-ui/chip'
import { SingleSelect, SingleSelectOption  } from '@dhis2-ui/select'
import { useEffect, useState } from 'react';
import classes from '../App.module.css'
import { config, ProjectsFiltersMore, match_threshold, match_threshold_weight} from '../consts'
import { customImage } from '../utils';


const query = {
    programTrackedEntityAttributes: {
        resource: "programs",
        id: ({ id }) => id,
        params: {
            fields:['id', 'displayName', 'programTrackedEntityAttributes', 'trackedEntityType'],
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
    extSetMatchThreshholdWeight,
    setFullOrgUnitSearch,
    
    
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
            {console.log(attrs)}
                {
                const attrsFiltered = attrs.map(attr => ({
                    id: attr.trackedEntityAttribute.id,
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
                const storedMatchingThreshold = newProjects[0]?.matchingThreshold || match_threshold
                const storedMatchingThresholdWeight = newProjects[0]?.matchingThresholdWeight || match_threshold_weight
                const storedfullOrgUnitSearch  = newProjects[0]?.fullOrgUnitSearch || false
                setSelectedAttr(initialSelectedAttr);
                setSelectedOU(storedOU);
                setFullOrgUnitSearch(storedfullOrgUnitSearch)
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
                    <span style={{ textAlign: 'center' }}> {i18n.t('Select program')}</span>
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