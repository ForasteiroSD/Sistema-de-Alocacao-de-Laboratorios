/* Packages */
import { Link } from "react-router-dom";

/* Css */
import './NavigatorButtom.css'

export default function NavigatorButtom({icon, name, link, start}) {
    return (
    <div className="Wrapper">
        {start ? <input type="radio" id={link} name='Url' defaultChecked /> : <input type="radio" id={link} name='Url' />}
        <div className='flex NavigatorButtom'>
            {icon}
            <Link to={link} className="Link">
            {/* <a href={link}> */}
                <label htmlFor={link} name='Url'>
                    {name}
                </label>
            {/* </a> */}
            </Link>
        </div>
    </div>
  )
}