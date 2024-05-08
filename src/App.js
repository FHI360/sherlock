import { useDataQuery } from '@dhis2/app-runtime'
import {useState } from 'react';
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import classes from './App.module.css'
import OrganisationUnitComponent from './components/OrganisationUnitComponent'
import { Divider } from '@dhis2-ui/divider'
import { footerText, MainTitle, project_description, panelAction } from './consts';
import ProgramComponent from './components/ProgramComponent';
import ProjectAttributeComponent from './components/ProjectAttributeComponent';


const query = {
    me: {
        resource: 'me',
    },
}

const MyApp = () => {
    
    const [selectedOU,setSelectedOU] = useState([]);
    const [selectedOUComponent,setSelectedOUComponent] = useState([]);
    const [selectedProgram,setSelectedProgram] = useState([]);
    const [selectedProgramName,setSelectedProgramName] = useState([]);
    const [selectedAttr,setSelectedAttr] = useState([]);
    
    const handleOUChange = event => {
        setSelectedOU(event.selected)
        if (event.selected.length > 0){
            let attr = event.selected.toString().split("/");
            setSelectedOUComponent(attr[attr.length-1])
            console.log(attr[attr.length-1])

    
        }
    };

    const handleAttrChange = (target) => {

        console.log(target)
    }
    // const handleAttrChange = event => {
        
    //     // setSelectedAttr(event.selected);
    //     const { value, checked } = event.target;

    //     if (checked) {
    //         // If the checkbox is checked, add the attribute to the selected attributes array
    //         setSelectedAttr([...selectedAttr, value]);
    //     } else {
    //         // If the checkbox is unchecked, remove the attribute from the selected attributes array
    //         setSelectedAttr(selectedAttr.filter(attr => attr !== value));
    //     }
    //     console.log(selectedAttr);

        
    // };

    return(
                <div>            
                    <div className={classes.container}>
                        {/* <div className={classes.topnav}>
                            <a href="#home">Home</a>
                            <a href="#about">About</a>
                            <a href="#contact">Contact</a>
                        </div> */}


                        <div className={classes.middle} >
                            <div className={classes.sidenav}>
                                {/* <div className={classes.marginTop}></div> */}
                                <OrganisationUnitComponent 
                                    handleOUChange={handleOUChange} 
                                    selectedOU={selectedOU}
                                />
                            </div>
                            <div style={{ width:'100%'}}>                                
                                <div className={classes.headerTitle}>
                                    <h2>{MainTitle}</h2>
                                    
                                    <span>
                                        {panelAction}
                                    </span>
                                </div>
                                <div className={classes.main}>                
                                    <div className={classes.panelmiddle}>
                                        {/* <h2>{MainTitle}</h2> */}
                                        <span style={{fontWeight:'bold' }}>Select program</span>
                                        <div style={{marginTop: '10px' }}>
                                            <ProgramComponent 
                                                selectedProgram={selectedProgram} 
                                                selectedOU={selectedOU}
                                                setSelectedProgram={setSelectedProgram}
                                                setSelectedProgramName={setSelectedProgramName}
                                            />
                                        </div>
                                    </div>
                                    <div className={classes.panelRight}>
                                    <span style={{fontWeight:'bold' }}>Project Attribute</span>
                                    <div style={{marginTop: '10px' }}>
                                            <ProjectAttributeComponent 
                                                handleAttrChange={handleAttrChange} 
                                                selectedAttr={selectedAttr} 
                                                selectedProgramID={selectedProgram}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                                
                    </div>
                    <footer>
                        <p style={{ fontSize: '0.7rem', margin: '0 auto' }}>{footerText}</p>
                    </footer>
                </div>
    // <div className={classes.container}>
    //             <h1 style={{ margin: '0' }}>{MainTitle}</h1>


    //             <span style={{ margin: '0', fontSize: '0.7rem' }}>
    //                 {project_description}
    //             </span>
    //     <DataQuery query={query}>
    //         {({ error, loading, data }) => {
    //             if (error) {
    //                 return <span>ERROR</span>
    //             }
    //             if (loading) {
    //                 return <span>...</span>
    //             }
    //             return (
    //                 <>
    //                     <h1>
    //                         {i18n.t('Hello {{name}}', { name: data.me.name })}
    //                     </h1>
    //                     <h3>{i18n.t('Sherlock')}</h3>
    //                 </>
    //             )
    //         }}
    //     </DataQuery>
    // </div>
)
}
export default MyApp
