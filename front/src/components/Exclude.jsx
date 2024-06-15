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

/* type = User || Reserve || MyReserve || Lab */
export default function Exclude({ type, CloseModal, Id }) {
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

    async function getUserData() {

        const response = (await api.post('user/data', {
            id: Id
        })).data;

        if (response.nome.length > 28) response.nome = response.nome.slice(0, 27) + '...'

        setuserData({ nome: response.nome, cpf: response.cpf });
    }

    useEffect(() => {
        if (type === 'User' && adm) getUserData();
    }, []);

    async function deleteUser(e) {
        e.preventDefault();

        try {
            (await api.delete('user', {
                params: {
                    id: Id
                }
            })).data;

            if (Id != user.id) setAlert('Success', 'Usuário excluido');
            else {
                logout();
                navigate('/login');
            }
        } catch (error) {
            const erro = error.response.data;

            setAlert('Error', erro);
        }
    }

    async function deleteReserve(e) {
        e.preventDefault();

        const motivo = document.querySelector('#motivo').value;

        try {

            const response = (await api.delete('/reserva', {
                params: {
                    reserva_id: Id,
                    motivo: motivo
                }
            })).data;

            setAlert('Success', response);

        } catch (error) {

            const erro = error.response.data;

            setAlert('Error', erro);
        }
    }

    async function deleteMyReserve(e) {
        e.preventDefault();

        try {

            const response = (await api.delete('/minhareserva', {
                params: {
                    reserva_id: Id
                }
            })).data;

            setAlert('Success', response);

        } catch (error) {

            const erro = error.response.data;

            setAlert('Error', erro);
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
                <form onSubmit={deleteUser} className='flex h v ModalWrapper' >
                    <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c'>
                        {adm ? (
                            <>
                                <h1>Excluir Usuário</h1>
                                {userData.nome ? (
                                    <p style={{ fontSize: '1.06rem', textAlign: 'center', overflowX: 'hidden', textOverflow: 'ellipsis' }}>{userData.nome} - {userData.cpf}</p>
                                ) : (
                                    <p style={{ fontSize: '1.06rem', textAlign: 'center' }}>Carregando dados do usuário...</p>
                                )}
                                <p style={{ fontSize: '1.06rem', textAlign: 'center' }}>Tem certeza que deseja excluir esse usuário?</p>
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

            ) : type == 'Reserve' ? (
                <form onSubmit={deleteReserve} className='flex h v ModalWrapper' >
                    <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} id='EditUserForm' className='Modal flex c v'>
                        <h1>Excluir Reserva</h1>
                        <div className="flex c" style={{ marginBottom: '10px', gap: '10px' }}>
                            <Input type={'text'} placeholder={'Motivo do Cancelamento'} id={'motivo'} required={true} />
                        </div>
                        <p style={{ fontSize: '1.06rem', textAlign: 'center' }}>Tem certeza que deseja excluir essa reserva?</p>
                        <Input type={'submit'} placeholder={'Excluir'} exclude={true} />
                        <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                    </motion.div>
                </form>

            ) : type == 'MyReserve' ? (
                <form onSubmit={deleteMyReserve} className='flex h v ModalWrapper' >
                    <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} id='EditUserForm' className='Modal flex c v'>
                        <h1>Excluir Reserva</h1>
                        <p style={{ fontSize: '1.06rem', textAlign: 'center' }}>Tem certeza que deseja excluir essa reserva?</p>
                        <Input type={'submit'} placeholder={'Excluir'} exclude={true} />
                        <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                    </motion.div>
                </form>
            ) : type == 'Lab' ? (
                <></>

            ) : null}
        </>
    )
}