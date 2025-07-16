/* Packages */
import { motion } from "framer-motion";
import { useState, useEffect, useContext } from 'react';

/* Components */
import Input from './Input';

/* Lib */
import api from '../lib/Axios';

/* Context */
import { UserContext } from '../context/UserContext';
import { AlertContext } from '../context/AlertContext';

/* type = User || Reserve || MyReserve || Lab */
export default function Exclude({ type, CloseModal, Id, updateView }) {
    const { user, logout } = useContext(UserContext);
    const { setAlert } = useContext(AlertContext);
    const [userData, setUserData] = useState({});
    const selfAccount = Id === user.id;

    async function getUserData() {
        const response = (await api.post('user/data', { id: Id })).data;
        if (response.nome.length > 28) response.nome = response.nome.slice(0, 27) + '...';
        setUserData({ nome: response.nome, cpf: response.cpf });
    }

    useEffect(() => {
        if (type === 'User' && !selfAccount) getUserData();
    }, []);

    async function deleteUser(e) {
        e.preventDefault();

        let senha;
        if (selfAccount) {
            senha = document.querySelector('#password').value;

            if (senha.length < 8) {
                setAlert('Warning', 'A senha deve ter no mínimo 8 caracteres');
                return;
            }

        }

        try {
            await api.delete('user', { params: { id: Id, senha: senha, minhaConta: 1 } });
            setAlert('Success', 'Usuário excluído');
            if (selfAccount) {
                logout();
                navigate('/login');
            }
            updateView && updateView();
        } catch (error) {
            const erro = error.response.data;
            setAlert('Error', erro);
        }
    }

    async function deleteReserve(e) {
        e.preventDefault();

        let motivo, link;
        if (type === 'Reserve') {
            motivo = document.querySelector('#motivo').value;
            link = '/reserva';
        } else {
            link = '/minhareserva';
        }

        try {
            const response = (await api.delete(link, {
                params: {
                    id: Id,
                    ... (motivo && {
                        motivo: motivo
                    })
                }
            })).data;
            setAlert('Success', response);
            updateView && updateView();
        } catch (error) {
            const erro = error.response.data;
            setAlert('Error', erro);
        }
    }

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />

            {type === 'User' ? (
                <form onSubmit={deleteUser} className='flex h v ModalWrapper'>
                    <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c'>
                        {!selfAccount ? (
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
                                <p style={{ fontSize: '1.06rem', textAlign: 'center' }}>Tem certeza que deseja excluir sua conta?</p>
                                <Input type={'password'} placeholder={'Senha'} id={'password'} required={true} />
                            </>
                        )}
                        <Input type={'submit'} exclude={true} placeholder={'Excluir'} />
                        <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                    </motion.div>
                </form>
            ) : type === 'Reserve' || type === 'MyReserve' ? (
                <form onSubmit={deleteReserve} className='flex h v ModalWrapper'>
                    <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} id='EditUserForm' className='Modal flex c v'>
                        <h1>Cancelar Reserva</h1>
                        {type === 'Reserve' ? (
                            <Input type={'text'} label={'Tem certeza que deseja cancelar essa reserva?'} placeholder={'Motivo do Cancelamento'} id={'motivo'} required={true} />
                        ) : (
                            <p style={{ textAlign: 'left', fontSize: '17px' }}>Tem certeza que deseja cancelar essa reserva?</p>
                        )}
                        <Input type={'submit'} placeholder={'Excluir'} exclude={true} />
                        <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                    </motion.div>
                </form>
            ) : type === 'Lab' ? (
                <form onSubmit={deleteLab} className='flex h v ModalWrapper'>
                    <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c v'>
                        <h1>Excluir Laboratório</h1>
                        <p style={{ fontSize: '1.06rem', textAlign: 'center' }}>Tem certeza que deseja excluir esse laboratório?</p>
                        <Input type={'submit'} exclude={true} placeholder={'Excluir'} />
                        <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                    </motion.div>
                </form>
            ) : null}
        </>
    );
}
