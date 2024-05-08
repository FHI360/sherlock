
import { useDataQuery } from '@dhis2/app-runtime'
import { useEffect } from 'react';
import { SingleSelect, SingleSelectOption  } from '@dhis2-ui/select'
import { Checkbox } from '@dhis2/ui'
import classes from '../App.module.css'

const query = {
    programTrackedEntityAttributes: {
        resource: "programs",
        id: ({ id }) => id,
        params: {
            fields:['id', 'displayName', 'programTrackedEntityAttributes'],
            paging: 'false',
        },
    }
}

const ProjectAttributeComponent = ({handleAttrChange, selectedAttr, selectedProgramID}) => {
    const { loading, error, data, refetch } = useDataQuery(query, {variables: {id: selectedProgramID}})
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
            {data.programTrackedEntityAttributes.programTrackedEntityAttributes.map(({ id, displayName }) => (
                <div key={id}>
                    <input
                        type="checkbox"
                        id={id}
                        name={displayName}
                        value={displayName}
                        checked={selectedAttr === displayName}
                        onChange={() => handleAttrChange({ id:displayName })}

                        
                    />
                    <label style={{marginLeft:'10px'}} htmlFor={id}>{displayName}</label>
                </div>
            ))}

        </div>
    )}

export default ProjectAttributeComponent