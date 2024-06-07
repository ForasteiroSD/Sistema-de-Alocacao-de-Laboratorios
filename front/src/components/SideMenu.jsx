/* Packages */
import { HiHome } from "react-icons/hi2";
import { FaComputer } from "react-icons/fa6";
import { PiNotepad } from "react-icons/pi";
import { FaUser } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { useEffect, useContext, useState } from "react";

/* Components */
import NavigatorButton from './NavigatorButtom';

/* Context */
import { UserContext } from '../context/UserContext';

/* Css */
import './SideMenu.css';

/* Variables/Consts */
const links = [
    { id: 'mainpage', icon: <HiHome className="Icons" />, name: 'Página Inicial', link: '/' },
    { id: 'labs', icon: <FaComputer className="Icons" />, name: 'Laboratórios', link: '/laboratorios' },
    { id: 'reserves', icon: <PiNotepad className="Icons" />, name: 'Reservas', link: '/reservas' },
    { id: 'users', icon: <FaUser className="Icons" style={{ transform: 'scale(0.9)' }} />, name: 'Usuários', link: '/users' }
];

export default function SideMenu() {
    const { user, logout } = useContext(UserContext);
    const [activeLink, setActiveLink] = useState(links[0].id);
    const navigate = useNavigate();

    // Select correct menu option when opening the site
    useEffect(() => {
        links.forEach(link => {
            if (window.location.href.includes(link.link)) setActiveLink(link.id);
        });
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className='flex sb c SideMenu'>
            <div>
                <div className='flex h'>
                    <img src="/logos/Logo-White.png" alt="Logo LabHub" className='logo' />
                </div>
                <hr className="logoHr" />

                <nav className='flex c NavButtons'>
                    {links.map((link) => (
                        <NavigatorButton key={link.id} icon={link.icon} name={link.name} link={link.link} id={link.id} isActive={activeLink} setActive={setActiveLink} />
                    ))}
                </nav>
            </div>

            <div className="BottomMenu">
                {activeLink === 'configs' && (
                    <motion.div layoutId="SelectedMenuButton" transition={{ type: 'spring', duration: .5 }} className="SelectedMenuButton" />
                )}
                <div className="flex User">
                    <FaUserCircle className="UserImage" style={activeLink === 'configs' ? { 'color': 'var(--buttonBlue)' } : null} />
                    <div className="flex h c">
                        <p style={activeLink === 'configs' ? { 'color': 'var(--buttonBlue)' } : null}>{user?.nome || 'User'}</p>
                        <Link to={'/configs'} className="link" style={activeLink === 'configs' ? { 'color': 'var(--buttonBlue)' } : null} onClick={() => setActiveLink('configs')}>Configurações</Link>
                    </div>
                </div>

                <hr style={activeLink === 'configs' ? { 'transform': 'scaleX(0)' } : null} />

                <div className="flex h logout">
                    <Link onClick={handleLogout} className="link">Sair</Link>
                </div>
            </div>
        </div>
    );
}
