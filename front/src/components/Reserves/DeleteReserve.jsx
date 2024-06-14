/* Packages */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useContext } from 'react';
import { sha256 } from "js-sha256";

/* Components */
import Input from '../Input';
import Alert from '../Alert';

/* Context */
import { UserContext } from "../../context/UserContext";

/* Lib */
import api from '../../lib/Axios'

/* Css */
import '../Modal.css';

export default function DeleteReserve({ CloseModal, ReserveId }) {
    const { user } = useContext(UserContext);
    const [alertType, setAlertType] = useState('');
    const [message, setMessage] = useState('');
    const [alertState, setAlertState] = useState(false);

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

    const removeReserve = async (e) => {
        e.preventDefault();

        const senha = document.querySelector('#password').value;
        const motivo = document.querySelector('#motivo').value;

        if(senha.length < 8) {
            setAlert('Warning', 'A senha deve ter no mínimo 8 caracteres');
            return;
        }

        try {

            const response = (await api.delete('/reserva', {
                params: {
                    reserva_id: ReserveId,
                    user_id: user.id,
                    senha: sha256.hmac(import.meta.env.VITE_REACT_APP_SECRET_KEY, senha),
                    motivo: motivo
                }
            })).data;

            setAlert('Success', response);

        } catch (error) {
            const erro = error.response.data;

            if(erro === 'database off') setAlert('Error', 'Desculpe, não foi possível remover a reserva. Tente novamente mais tarde');
            else setAlert('Error', erro);
        }
    }

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
                <AnimatePresence>
                    {alertState && <Alert messageType={alertType} message={message} />}
                </AnimatePresence>
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />
            <form className='flex h v ModalWrapper'>
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} id='EditUserForm' className='Modal flex c v'>
                    <h1>Cancelar Reserva</h1>
                    <div className="flex c" style={{marginBottom: '10px', gap: '10px'}}>
                        <Input type={'password'} placeholder={'Sua Senha'} id={'password'} autoComplete={'off'} required={true} />
                        <Input type={'text'} placeholder={'Motivo do Cancelamento'} id={'motivo'} required={true} />
                    </div>
                    <Input type={'submit'} placeholder={'Excluir'} exclude={true} callback={removeReserve}/>
                    <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                </motion.div>
            </form>
        </>
    )
}
