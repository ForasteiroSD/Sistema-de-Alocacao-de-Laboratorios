/* Packages */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/* Css */
import './NavigatorButtom.css'

export default function NavigatorButtom({icon, name, link, id, isActive, setActive}) {
    return (
    <div>
        {isActive == id && (
            <motion.div layoutId="SelectedMenuButton" transition={{type: 'spring', duration: .5}} className="SelectedMenuButton" />
            // <motion.div layoutId="SelectedMenuButton" className="SelectedMenuButton" />
        )}

        <div className="flex NavigatorButtom" style={isActive == id ? {'color': '#22b1b1'} : null}>
            {icon}

            <Link to={link} className="Link" style={isActive == id ? {'color': '#22b1b1'} : null} onClick={() => setActive(id)}>
                {name}
            </Link>
        </div>
    </div>
  )
}