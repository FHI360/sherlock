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