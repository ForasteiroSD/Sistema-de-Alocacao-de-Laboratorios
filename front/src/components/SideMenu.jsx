/* Packages */
import { HiHome } from "react-icons/hi2";
import { FaComputer } from "react-icons/fa6";
import { PiNotepad } from "react-icons/pi";
import { FaUser } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import { useEffect, useContext, useState } from "react";

/* Components */
import NavigatorButton from './NavigatorButtom';

/* Context */
import { UserContext } from '../context/UserContext';

/* Css */
import './SideMenu.css';

/* Variables/Consts */
const linksAdm = [
    { id: 'mainpage', icon: <HiHome className="Icons" />, name: 'Página Inicial', link: '/' },
    { id: 'labs', icon: <FaComputer className="Icons" />, name: 'Laboratórios', link: '/laboratorios' },
    { id: 'reserves', icon: <PiNotepad className="Icons" />, name: 'Reservas', link: '/reservas' },
    { id: 'users', icon: <FaUser className="Icons" style={{ transform: 'scale(0.9)' }} />, name: 'Usuários', link: '/users' }
];

const linksRes = [
    { id: 'mainpage', icon: <HiHome className="Icons" />, name: 'Página Inicial', link: '/' },
    { id: 'labs', icon: <FaComputer className="Icons" />, name: 'Laboratórios', link: '/laboratorios' },
    { id: 'mylabs', icon: <FaComputer className="Icons" />, name: 'Meus Laboratórios', link: '/meuslaboratorios' },
    { id: 'reserves', icon: <PiNotepad className="Icons" />, name: 'Minhas Reservas', link: '/minhasreservas' }
];

const userLinks = [
    { id: 'mainpage', icon: <HiHome className="Icons" />, name: 'Página Inicial', link: '/' },
    { id: 'labs', icon: <FaComputer className="Icons" />, name: 'Laboratórios', link: '/laboratorios' },
    { id: 'reserves', icon: <PiNotepad className="Icons" />, name: 'Minhas Reservas', link: '/minhasreservas' }
];

export default function SideMenu() {
    const { user, logout } = useContext(UserContext);
    const [activeLink, setActiveLink] = useState();
    const location = useLocation();
    const navigate = useNavigate();
    const [links, setLinks] = useState([]);
    
    // Select correct menu option when opening the site
    useEffect(() => {
        if(location.pathname === '/configs') setActiveLink('configs');
        links.forEach(link => {
            if (location.pathname === link.link) setActiveLink(link.id);
        });
    }, [location, links]);
    
    useEffect(() => {
        if(user.tipo === 'Administrador') setLinks(linksAdm);
        else if(user.tipo === 'Responsável') setLinks(linksRes);
        else setLinks(userLinks);
    }, [user]);

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
