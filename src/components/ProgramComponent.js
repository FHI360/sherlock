import { useDataQuery } from '@dhis2/app-runtime'
import React from 'react'
import {useContext } from 'react';  
import { SharedStateContext } from '../utils'
import classes from '../App.module.css'
import { SingleSelect, SingleSelectOption, SingleSelectField  } from '@dhis2-ui/select'

/*  Query Parameters**/
const query = {
    programsMetadata: {
        resource: 'programs',
        params: {
            pageSize: 5,
            fields: ['id', 'displayName'],
        },
    }
}

const ProgramComponent = ({ selectedProgram, setSelectedProgram, setSelectedProgramName, setDataStoreProfile }) => {
    const sharedState = useContext(SharedStateContext)

    const { loading: loading, error: error, data: data } = useDataQuery(query);

    if (error) {
        return <span>ERROR: {error.message}</span>
    }

    if (loading) {
        return <span>Loading...</span>
    }

    const handleProgramChange = event => {
        sharedState.setSelectedSharedOU([])
        sharedState.setSelectedSharedAttr([])
        sharedState.setSelectedSharedProgram([])
        sharedState.setMatchingSharedThreshold(0.6)
        sharedState.setMatchingSharedThresholdWeight(1e-20)
        sharedState.setFullOrgUnitSharedSearch(false)
        setDataStoreProfile(false)
        setSelectedProgram(event.selected);
        {data.programsMetadata.programs.filter(programs => programs.id.includes(event.selected)).map(
          ({ id, displayName }) => (                    
              setSelectedProgramName({displayName})
                                   )
          )}
    };

return(
        <div>
            
            <SingleSelect className="select"
                filterable
                noMatchText="No match found"
                placeholder="Select program"
                selected={selectedProgram}
                value={selectedProgram}
                onChange={handleProgramChange}
                >
                {data.programsMetadata.programs.map(
                        ({ id, displayName }) => (
                        <SingleSelectOption label={displayName} value={id}/>
                                                )
                    )}

            </SingleSelect>
        </div>
    )
}
export default ProgramComponent 