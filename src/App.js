import React from 'react'
import { HashRouter, Navigate, Route, Routes, BrowserRouter } from 'react-router-dom'
import classes from './App.module.css'
import { Main, SearchWorkerComponent,SearchHistoryComponent } from './components/main/Index'
import { Navigation } from './components/navigation/Index'
import { footerText} from './consts';
import SetupStateProvider from './SetupStateProvider'


const MyApp = () => (
    <SetupStateProvider>
        <HashRouter>
            <div>
            <Navigation/>
            <div className={classes.container}>
                    <Routes>
                        <Route
                            exact
                            path="/"
                            element={<Main />}
                        />
                    <Route search_history
                            exact
                            path="/results"
                            element={<SearchWorkerComponent />}
                        />
                                            <Route
                            exact
                            path="/search_history"
                            element={<SearchHistoryComponent />}
                        />
                        {/* defaulting if unmatched */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
            </div>

                <footer>
                    <p style={{ fontSize: '0.7rem', margin: '0 auto' }}>{footerText}</p>
                </footer>
            </div>
        </HashRouter>
    </SetupStateProvider>
)

export default MyApp
