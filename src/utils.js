import React, { createContext,  useState, useCallback} from 'react';
import search from './icons/search.png'
import classes from './App.module.css'


export const customImage = (source, size='small') => {

      // Check the source and set iconClass accordingly
      let iconClass = '';
      iconClass = size === 'small' ? classes.smallIcon : size === 'large' ? classes.largeIcon : classes.smallIcon;
      if (source.toLowerCase()  === 'search'){
        return <img src={search} className={iconClass}/>
      }


}

export const createOrUpdateDataStore = async (engine, postObject, store, key, mode='') =>{

  if (!postObject.hasOwnProperty('modifiedDate')) {
      // If it doesn't exist, add it to the object
      postObject.modifiedDate = modifiedDate();
  } else {
      // If it exists, update its value
      postObject.modifiedDate = modifiedDate();
  }
  let modeType=''

  if (mode === 'create'){
        if (!postObject.hasOwnProperty('createdDate')) {
            // If it doesn't exist, add it to the object
            postObject.createdDate = modifiedDate();
        } else {
            // If it exists, update its value
            postObject.createdDate = modifiedDate();
        }
          modeType=true
  }else if (mode === 'update'){
        modeType=false
  }

  try {

    const result = await engine.mutate({
      resource: `dataStore/${store}/${key}`,
      type: modeType ? 'create' : 'update',
      data: postObject,
    });
    console.log('Mutation successful:', result);
    return result;
  } catch (error) {
    console.error('Error creating or updating object:', error);
    // throw error;
    
  }
}

export const generateRandomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const idLength = 11;
  let randomId = '';

  for (let i = 0; i < idLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomId += characters.charAt(randomIndex);
  }

  return randomId;
};

export const modifiedDate = () => {
  const now = new Date();

  return now.toISOString();
};

export const provisionOUs = (selectedOU) => {

  const OrgUnitsSelected = selectedOU.map(path => {
    const items = path.split('/');
    return items[items.length - 1];
  });
  return OrgUnitsSelected;
}

export const deleteObjects = async (engine, store, key, obj) =>{

  try {
    await engine.mutate({
      resource: `dataStore/${store}/${key}`,
      type: 'delete',
    });
    console.log(`${obj} ${key} deleted`);
    return true
  } catch (error) {
    console.error(`Error deleting ${key}`, error);
    return false
  }
}

/** for routing and contexting */
export const SharedStateContext = createContext({
  selectedSharedOU: [],
  setSelectedSharedOU: () => {},
  selectedSharedAttr: [],
  setSelectedSharedAttr: () => {},
  selectedSharedProgram: [],
  setSelectedSharedProgram: () => {},
  fullOrgUnitSharedSearch: false,
  setFullOrgUnitSharedSearch: () => {},
  selectedSharedProgramName: [],
  setSelectedSharedProgramName: () => {},
  selectedOUSharedforQuery: [],
  setSelectedSharedOUforQuery: () => {}

})



export const useSharedState = () => {
  const [selectedSharedOU,setSelectedSharedOU_] = useState([]);
  const [selectedSharedAttr,setSelectedSharedAttr_] = useState([]);
  const [selectedSharedProgram,setSelectedSharedProgram_] = useState([]);
  const [selectedSharedProgramName,setSelectedSharedProgramName_] = useState([]);
  const [selectedOUSharedforQuery, setSelectedSharedOUforQuery_] = useState([]);
  const [fullOrgUnitSharedSearch, setFullOrgUnitSharedSearch_] = useState(false);
  
  // memoizedCallbacks 
  /**
   * preventing unnecessary re-renders of child components when 
   * the callback reference remains unchanged. It optimizes performance by 
   * avoiding the recreation of callbacks on each render
   * 
   */
  const setSelectedSharedOU = useCallback((data) => {
    setSelectedSharedOU_(data)
  }, [])
  const setSelectedSharedAttr = useCallback((data) => {
    setSelectedSharedAttr_(data)
  }, [])
  const setSelectedSharedProgram = useCallback((data) => {
    setSelectedSharedProgram_(data)
  }, [])
  const setSelectedSharedProgramName = useCallback((data) => {
    setSelectedSharedProgramName_(data)
  }, [])
  const setSelectedSharedOUforQuery = useCallback((data) => {
    setSelectedSharedOUforQuery_(data)
  }, [])
  const setFullOrgUnitSharedSearch = useCallback((data) => {
    setFullOrgUnitSharedSearch_(data)
  }, [])

  return {
    selectedSharedOU,
    setSelectedSharedOU,
    selectedSharedAttr,
    setSelectedSharedAttr,
    selectedSharedProgram,
    setSelectedSharedProgram,
    fullOrgUnitSharedSearch,
    setFullOrgUnitSharedSearch,
    selectedSharedProgramName,
    setSelectedSharedProgramName,
    selectedOUSharedforQuery,
    setSelectedSharedOUforQuery
  }
}