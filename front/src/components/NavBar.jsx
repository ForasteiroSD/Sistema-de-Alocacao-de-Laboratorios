/* Packages */
import { HiHome } from "react-icons/hi2";
import { FaComputer } from "react-icons/fa6";
import { PiNotepad } from "react-icons/pi";

/* Components */
import NavigatorButtom from './NavigatorButtom'

/* Css */
import './NavBar.css'

export default function NavBar() {
    return (
        <nav className='NavBar'>
            <div className='flex h'>
                <img src="../../public/logos/Logo-White.png" alt="Logo LabHub" className='logo'/>
            </div>
            <hr />

            <section className='flex c NavButtons'>
                <NavigatorButtom icon={<HiHome className="Icons" />} name={'Página Inicial'} link={'/'} start={true}/>
                <NavigatorButtom icon={<FaComputer className="Icons" />} name={'Laboratorios'} link={'/laboratorios'}/>
                <NavigatorButtom icon={<PiNotepad className="Icons" />} name={'Reservas'} link={'/reservas'}/>
            </section>
        </nav>
    )
}