/* Packages */
import { useContext, useEffect, useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { BsCalendarDate, BsTelephone } from "react-icons/bs";
import { VscKey } from "react-icons/vsc";
import { AnimatePresence } from "framer-motion";

/* Components */
import UserData from '../components/Configs/UserData';
import Input from '../components/Input';
import UpdateUser from "../components/Users/UpdateUser";
import Exclude from "../components/Exclude";

/* Context */
import { UserContext } from "../context/UserContext";

/* Lib */
import api from '../lib/Axios';

/* Css */
import './Configs.css'

export default function Configs() {
    const { user } = useContext(UserContext);
    const [userData, setUserData] = useState({nome: 'Nome', cpf: 'Carregando...', email: 'Carregando...', telefone: 'Carregando...', data_nasc: 'Carregando...', tipo: 'Carregando...'});
    const [showUpdateUser, setShowUpdateUser] = useState(false);
    const [showExcludeUser, setShowExcludeUser] = useState(false);
    
    async function GetUserData() {
        const response = (await api.post('user/data', {
            id: user.id
        })).data;
        const AnoMesDia = response.data_nasc.split('-');
        response.data_nasc = AnoMesDia[2].split('T')[0] + '/' + AnoMesDia[1] + '/' + AnoMesDia[0]
        setUserData(response);
    }

    const CallbackUpdateUser = () => {
        setShowUpdateUser(true)
    }

    const CallbackExcludeUser = () => {
        setShowExcludeUser(true)
    }

    useEffect(() => {
        GetUserData()
    }, [user]);

    return (
        <section className="PageContent flex c v">
            <AnimatePresence>
                {showUpdateUser && <UpdateUser CloseModal={setShowUpdateUser} UserId={user.id} updateView={GetUserData} />}
            </AnimatePresence>

            <AnimatePresence>
                {showExcludeUser && <Exclude type={'User'} CloseModal={setShowExcludeUser} Id={user.id} />}
            </AnimatePresence>

            <h1>Seus Dados</h1>

            <div className='Configs flex c'>
                <div className='MainUserDiv flex v'>
                    <FaUserCircle className='userIcon' />
                    <div className='flex c h' style={{gap: '10px'}}>
                        <p className='NameUser'>{userData.nome}</p>
                        <p className='cpfUser'>{"CPF: " + userData.cpf}</p>
                    </div>
                </div>

                <div className='DivUserData'>
                    <UserData icon={<MdOutlineEmail />} title={'Email:'} data={userData.email} />
                    <UserData icon={<BsCalendarDate />} title={'Data de nascimento:'} data={userData.data_nasc} />
                    <UserData icon={<BsTelephone />} title={'Telefone:'} data={userData.telefone} />
                    <UserData icon={<VscKey />} title={'Tipo de conta:'} data={userData.tipo} />
                    <Input type={'submit'} placeholder={'Editar Dados'} callback={CallbackUpdateUser} />
                    <Input type={'submit'} placeholder={'Excluir Conta'} exclude={true} callback={CallbackExcludeUser} />
                </div>
            </div>
        </section>
    )
}