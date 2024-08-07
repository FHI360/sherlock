import { useDataEngine, useDataQuery } from '@dhis2/app-runtime';
import React, { useEffect, useState } from 'react'
import classes from '../App.module.css';
import { updateTrackedEntityIgnore  } from '../utils'


const SelectedTrackedEntity1 = {
    trackedEntity: {
        resource: `tracker/trackedEntities`,
        id: ({ id }) => id,
        params: ({
            fields: "*"
        }),
    },
}
const SelectedTrackedEntity2 = {
    trackedEntity: {
        resource: `tracker/trackedEntities`,
        id: ({ id }) => id,
        params: ({
            fields: "*"
        }),
    },
}

const TrackEntityData = ({teiUpdate, setPosting}) => {
	const engine = useDataEngine()
	// to get the values from the json object
	const tei_values = Object.values(teiUpdate);
	const {
		loading: loadingSelectedTrackedEntity1,
		error: errorSelectedTrackedEntity1,
		data: dataSelectedTrackedEntity1, 
		refetch: refetchDataelectedTrackedEntity1
	} = useDataQuery(SelectedTrackedEntity1, {variables: {id: tei_values[0]?.trackedEntity}})
	const {
		loading: loadingSelectedTrackedEntity2,
		error: errorSelectedTrackedEntity2,
		data: dataSelectedTrackedEntity2,
		refetch: refetchDataelectedTrackedEntity2
	} = useDataQuery(SelectedTrackedEntity2, {variables: {id: tei_values[1]?.trackedEntity}})

	
	useEffect(()=>{
		// To popluate the tracked entities with the parent and child uids
		const processData = async () => {
            await callProcess()
            setPosting(false)
        };    
        processData();
        // refetchSelectedTrackedEntity({id: processingTEI})
    },[dataSelectedTrackedEntity1, dataSelectedTrackedEntity2])

	const callProcess = async () =>{
		if (dataSelectedTrackedEntity1){
			processTeiValues(tei_values[0],dataSelectedTrackedEntity1.trackedEntity);
		}
		if (dataSelectedTrackedEntity2){
			processTeiValues(tei_values[1],dataSelectedTrackedEntity2.trackedEntity);
		}
		
	}

	useEffect(() => {
		// to refetch the data with new tei value
		refetchDataelectedTrackedEntity1({id: tei_values[0]?.trackedEntity})
		refetchDataelectedTrackedEntity2({id: tei_values[1]?.trackedEntity})	

    }, [teiUpdate]);

	const processTeiValues = async (tei_value,payload) => {
		// Assuming updateTrackedEntityIgnore is an async function
		const pushData = async () => {
			await updateTrackedEntityIgnore(engine, teiUpdate, tei_value, payload);
			
		};		
		pushData();
	};
	
	return (		
	<></>)
}

export default TrackEntityData