/* Packages */
import { HiHome } from "react-icons/hi2";
import { FaComputer } from "react-icons/fa6";
import { PiNotepad } from "react-icons/pi";

/* Components */
import NavigatorButtom from './NavigatorButtom'

/* Css */
import './SideMenu.css'
import { useState } from "react";

/* Variables/Consts */
const links = [
    {id: 'mainpage', icon: <HiHome className="Icons" />, name: 'Página Inicial', link: '/'},
    {id: 'labs', icon: <FaComputer className="Icons" />, name: 'Laboratorios', link: '/laboratorios'},
    {id: 'reserves', icon: <PiNotepad className="Icons" />, name: 'Reservas', link: '/reservas'}
]

export default function SideMenu() {
    const [activeLink, setActiveLink] = useState(links[0].id);

    return (
        <div className='SideMenu'>
            <div className='flex h'>
                <img src="../../public/logos/Logo-White.png" alt="Logo LabHub" className='logo'/>
            </div>
            <hr />

            <nav className='flex c NavButtons'>
                {links.map((link) => (
                    <NavigatorButtom key={link.id} icon={link.icon} name={link.name} link={link.link} id={link.id} isActive={activeLink} setActive={setActiveLink} />
                ))}
            </nav>
        </div>
    )
}