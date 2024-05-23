import { Menu, MenuItem} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import {Link,  useNavigate, useMatch,  } from 'react-router-dom'
import classes from '../../App.module.css'

function NavigationItem({ to, children, ...props }) {
    // function to navigate to different route
    const navigate = useNavigate()



    // "null" when not active, "object" when active
    const routeMatch = useMatch(to)

    // path is matched if routeMatch is not null ${isActive ? "active" : ""}  customLinkActive
    const isActive = Boolean(routeMatch)
    const onClick = () => navigate(to)
    // console.log({children})
    // console.log({...props})
  
    return (
      <li className={(isActive ? ` ${classes.customLinkActive}` : '')} onClick={onClick}>
        <Link to={to} {...props}>
          {children}
        </Link>
      </li>
    )
  }

export const Navigation = () => (
    <div>
        <nav className={classes.nav}>

        <ul>
            <NavigationItem to="/">Configure Search</NavigationItem>
            <NavigationItem to="/results">Results</NavigationItem>
            <NavigationItem to="/search_history">Saved Searches</NavigationItem>
        </ul>
        </nav>
    </div>
)