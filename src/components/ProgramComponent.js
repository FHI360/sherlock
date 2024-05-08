import { useDataQuery } from '@dhis2/app-runtime'
import {useState, useEffect } from 'react';
import React from 'react'
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

const ProgramComponent = ({ selectedOU, selectedProgram, setSelectedProgram, setSelectedProgramName }) => {

    const { loading: loading, error: error, data: data } = useDataQuery(query);

    if (error) {
        return <span>ERROR: {error.message}</span>
    }

    if (loading) {
        return <span>Loading...</span>
    }

    const handleProgramChange = event => {

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