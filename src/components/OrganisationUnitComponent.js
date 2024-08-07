import { useDataQuery } from '@dhis2/app-runtime'
import { OrganisationUnitTree } from '@dhis2-ui/organisation-unit-tree'
import React, {useState } from 'react'
import classes from '../App.module.css'
import { customImage } from '../utils';


const query = {
    results:{
        resource: 'organisationUnits',
        params: {
            fields: "id,name,level,displayShortName",
            filter: 'level:eq:1'

        }
    }
}


const OrganisationUnitComponent = ({ handleOUChange, selectedOU, selectedProgramName }) => {
    const [isSearchVisible, setSearchVisible] = useState(false);
    const { loading, error, data } = useDataQuery(query)
    const toggleSearch = () => {
        setSearchVisible(!isSearchVisible);

    };

    if (error) {
        return <span>ERROR: {error.message}</span>
    }

    if (loading) {
        return <span>Loading...</span>
    }

    if (data) {
    //    console.log(data)
    }
    // console.log('selectedProgramName OU: ',selectedProgramName.length)
    // console.log('selectedProgramName',selectedProgramName)

    return (
        <div>
            <div style={{ display:'flex', marginBottom: '3px'}}>
                        <div onClick={toggleSearch}>
                        {customImage('search', 'small')}
                        </div>

                        {isSearchVisible && (
                            <span className="searchspan">
                            <input type="text" id="searchField" />
            
                            </span>
                        )}
            </div>
            <div className={`${classes.OrgUnitContainer} ${selectedProgramName.length === 0 ? classes.disabled : ''}`}>
                <OrganisationUnitTree
                    name={data['results']['organisationUnits'][0]['name']}
                    onChange={handleOUChange}
                    // initiallyExpanded={storedOU}
                    roots={[data['results']['organisationUnits'][0]['id']]}
                    selected={selectedOU}
                    // singleSelection
                    className={classes.checked} // Add a class to the OrganisationUnitTree component

                    disableSelection={selectedProgramName.length === 0 || selectedProgramName === undefined} 
                />

            </div>
        </div>
    )


}

export default OrganisationUnitComponent