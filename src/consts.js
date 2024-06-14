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

export const IgnoreAttrMetadata = {
    "trackedEntityAttributes":[
      {
        "name": "Ignored duplicate",
        "shortName": "Ignored duplicate",
        "description": "sherlock duplicate ignore store",
        "valueType": "LONG_TEXT",
        "displayFormName": "Ignored duplicate",
        "id": "sher1dupli1",
        "aggregationType": "NONE",
        "unique": false,
        "access": {
          "manage": true,
          "externalize": false,
          "write": true,
          "read": true,
          "update": true,
          "delete": true
        }
      }
    ]
}

export const IgnoreAttrMetadataProvisioning = {
                        "name": "Child Programme Ignored duplicate",
                        "program": {
                            "id": "IpHINAT79UW"
                        },
                        "sortOrder": 1,
                        "access": {
                            "manage": true,
                            "externalize": false,
                            "write": true,
                            "read": true,
                            "update": true,
                            "delete": true
                        },
                        "mandatory": false,
                        "allowFutureDate": false,
                        "renderOptionsAsRadio": false,
                        "searchable": true,
                        "valueType": "LONG_TEXT",
                        "displayShortName": "Child Programme Ignored duplicate",
                        "displayName": "Child Programme Ignored duplicate",
                        "id": "sher1dupli2",
                        "trackedEntityAttribute": {
                            "id": "sher1dupli1"
                        }
}

export const MainTitle = 'Sherlock'
export const ProjectAttributedescription = 'Project Attribute'
export const searchBoundarySelected = 'Search Selected Organization Unit Tree'
export const searchBoundaryfull = 'Search Full Organization Unit Tree'
const version = 'Version v1.0.0 | Beta 03-05-2024'
export const footerText = `Copyright © FHI360 | EpiC | Business Solutions | 2024 | ${version}`
export const project_description = 'This application resolves duplicate issues' 
export const panelAction = 'Finding duplicate tracked entities'