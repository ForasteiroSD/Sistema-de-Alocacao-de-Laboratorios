/* Packages */
import { HiHome } from "react-icons/hi2";
import { FaComputer } from "react-icons/fa6";
import { PiNotepad } from "react-icons/pi";
import { FaUserCircle } from "react-icons/fa";
import { Link } from 'react-router-dom'
import { motion } from "framer-motion";

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
const UserName = 'User tal'

export default function SideMenu() {
    const [activeLink, setActiveLink] = useState(links[0].id);

    return (
        <div className='flex sb c SideMenu'>
            <div>
                <div className='flex h'>
                    <img src="/logos/Logo-White.png" alt="Logo LabHub" className='logo'/>
                </div>
                <hr className="logoHr" />

                <nav className='flex c NavButtons'>
                    {links.map((link) => (
                        <NavigatorButtom key={link.id} icon={link.icon} name={link.name} link={link.link} id={link.id} isActive={activeLink} setActive={setActiveLink} />
                    ))}
            </nav>
            </div>

            <div className="BottomMenu">
                {activeLink == 'configs' && (
                    <motion.div layoutId="SelectedMenuButton" transition={{type: 'spring', duration: .5}} className="SelectedMenuButton" />
                )}
                <div className="flex User">
                    <FaUserCircle className="UserImage" style={activeLink == 'configs' ? {'color': 'var(--buttonBlue)'} : null} />
                    {/* <FaUserCircle className="UserImage" /> */}
                    <div className="flex h c">
                        <p style={activeLink == 'configs' ? {'color': 'var(--buttonBlue)'} : null} >{UserName}</p>
                        <Link to={'/configs'} className="link" style={activeLink == 'configs' ? {'color': 'var(--buttonBlue)'} : null} onClick={() => setActiveLink('configs')}>Configurações</Link>
                    </div>
                </div>

                <hr style={activeLink == 'configs' ? {'transform': 'scaleX(0.01)'} : null} />

                <div className="flex h logout">
                    <Link to={'/login'} className="link">Sair</Link>
                </div>
            </div>
        </div>
    )
}