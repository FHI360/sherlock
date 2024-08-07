import { useDataEngine,  } from '@dhis2/app-runtime';
import React, { useEffect, useState } from 'react'
import { updateTrackedEntityIgnoreAll  } from '../utils'




const TrackEntityDataMultiple = ({teiUpdate, trackedEntityType, selectedMatches, setPosting}) => {
	const engine = useDataEngine()
	console.log('Multiple: ', teiUpdate)
	// to get the values from the json object
	const tei_values = Object.values(teiUpdate);
	console.log('tei_values[1]?.trackedEntity: ', tei_values[1]?.trackedEntity)
	console.log('tei_values: ', tei_values)


	const match_teis =  tei_values[1]?.matches
	const match_teis_no_scores = match_teis.map(entity => {
		const { score, ...rest } = entity; // Destructure entity to exclude score
		return rest; // Return the rest of the properties
	  });



	useEffect(()=>{
		
		// To popluate the tracked entities with the parent and child uids
		if (match_teis_no_scores.length > 0){

			processTeiValues(tei_values[1], match_teis_no_scores);		
		}

    },[match_teis_no_scores])
	


	const processTeiValues = async (tei_value,payload) => {
			const pushData = async () => {
				await updateTrackedEntityIgnoreAll(engine, tei_value, payload, trackedEntityType, selectedMatches);
				setPosting(false)
			};
		
			pushData();
			
			

	};

	return (		
	<></>)
}

export default TrackEntityDataMultiple