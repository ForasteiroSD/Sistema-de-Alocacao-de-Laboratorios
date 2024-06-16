/* Packages */
import { Link } from "react-router-dom";

/* Css */
import './NotFound.css'

export default function NotFound() {
    return (
        <div className='flex v c PageContent NotFound'>
            <h1>Página Não Encontrada</h1>
            <div className="Wrapper">
                <div className="ImgsBox">
                    <img src="./404/Pc3D.png" alt="Logo LabHub" id="ImgPc" />
                    <img src="./404/4043D.png" alt="404" id="Img404" />
                </div>
                <div className="flex c TextBox">
                    <p>Parece que a página que você está procurando não existe.</p>
                    <p><Link to='/' className="Link">Página Principal</Link></p>
                </div>
            </div>
        </div>
    );
}