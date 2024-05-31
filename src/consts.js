export const config = {
    dataStoreName: 'sherlock-project-definition',
    dataStoreSearchHistory: 'sherlock-search-history'
}

export const ProjectsFiltersMore = 'fields=key,projectName,programid,attributesSelected,selectedOU,fullOrgUnitSearch,matchingThreshold,matchingThresholdWeight';
export const SearchHistory = 'fields=key,programid,projectName,attributesSelected,fullOrgUnitSearch,modifiedDate,selectedOU,ProgramName,matchingThreshold,matchingThresholdWeight'
export const dataStoreQueryMore = {
    dataStore: {
        resource: `dataStore/${config.dataStoreName}?${ProjectsFiltersMore}&paging=false`,
    },
}
export const dataStoreSearchHistoryQueryMore = {
    dataStore: {
        resource: `dataStore/${config.dataStoreSearchHistory}?${SearchHistory}&paging=false`,
    },
}


export const MainTitle = 'Sherlock'
export const ProjectAttributedescription = 'Project Attribute'
export const searchBoundarySelected = 'Search Selected Organization Unit Tree'
export const searchBoundaryfull = 'Search Full Organization Unit Tree'
const version = 'Version v1.0.0 | Beta 03-05-2024'
export const footerText = `Copyright © FHI360 | EpiC | Business Solutions | 2024 | ${version}`
export const project_description = 'This application resolves duplicate issues' 
export const panelAction = 'Finding duplicate tracked entities'