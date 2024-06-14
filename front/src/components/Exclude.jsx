/* Packages */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext } from 'react';

/* Components */
import Input from './Input';
import Alert from './Alert';

/* Lib */
import api from '../lib/Axios'

/* Context */
import { UserContext } from '../context/UserContext';

/* Css */
import './Exclude.css'

/* type = User || Reserve || Lab */
export default function Exclude({type, CloseModal, UserId}) {
    const { user, logout } = useContext(UserContext);
    const [alertType, setAlertType] = useState('');
    const [message, setMessage] = useState('');
    const [alertState, setAlertState] = useState(false);
    const [userData, setuserData] = useState({});
    const adm = user.tipo == 'Administrador';

    const setAlert = (type, message) => {
        setAlertType(type);
        setMessage(message);
        setAlertState(true);

        setTimeout(() => {
            setAlertType('');
            setMessage('');
            setAlertState(false);
        }, 5000);
    }

    async function getUsersData() {
        const response = (await api.post('user/data', {
            id: UserId
        })).data;
        
        if(response.nome.length > 28) response.nome = response.nome.slice(0,27) + '...'
        
        setuserData({nome: response.nome, cpf: response.cpf});
    }

    useEffect(() => {
        adm && getUsersData();
    }, []);

    async function deleteUser(pass) {
        let params;

        if(adm) params = {
                id: UserId,
                adm: true
            };
        else params = {
            id: UserId,
            senha: pass
        };

        try {
            (await api.delete('user', params)).data;
    
            if(adm) setAlert('Success', 'Usuário excluido');
            else {

            }
        } catch (e) {
            const erro = e.response.data;
            
            if(erro === 'Senha invalida') setAlert('Error', 'Senha invalida');
            else if (erro === 'Email ja cadastrado') setAlert('Error', 'Email ja cadastrado');
            else setAlert('Error', 'Desculpe, não foi possível alterar o usuário. Tente novamente mais tarde');
        }
    }

    const validate = (e) => {
        e.preventDefault();
        if(adm) deleteUser();
        else {

        }
    }

    return (
        <>
            <AnimatePresence>
                {alertState && <Alert messageType={alertType} message={message} />}
            </AnimatePresence>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />
            
            {type == 'User' ? (
                <form onSubmit={validate} className='flex h v ModalWrapper' >
                    <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c'>
                        {adm ? (
                            <>
                                <h1>Excluir Usuário</h1>
                                {userData.nome ? (
                                    <p style={{fontSize: '1.06rem', textAlign: 'center', overflowX: 'hidden', textOverflow: 'ellipsis'}}>{userData.nome} - {userData.cpf}</p>
                                ) : (
                                    <p style={{fontSize: '1.06rem', textAlign: 'center'}}>Carregando dados do usuário...</p>
                                )}
                                <p style={{fontSize: '1.06rem', textAlign: 'center'}}>Tem certeza que deseja excluir esse usuário?</p>
                            </>
                        ) : (
                            <>
                                <h1>Excluir Conta</h1>
                                <Input type={'password'} placeholder={'Senha'} id={'password'} autoComplete={'off'} required={true} />
                            </>
                        )}

                        <Input type={'submit'} exclude={true} placeholder={'Excluir'} />
                        <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                    </motion.div>
                </form>

            ): type == 'Reserve' ? (
                <></>

            ) : type == 'Lab' ? (
                <></>

            ) : null}
        </>
    )
}