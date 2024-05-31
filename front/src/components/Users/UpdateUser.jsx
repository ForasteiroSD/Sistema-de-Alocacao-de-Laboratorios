/* Packages */
import Axios from 'axios';
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from 'react';

/* Components */
import Input from '../Input';
import Alert from '../Alert';

/* Css */
import '../Modal.css';

/* Variables/Consts */
const accoutTypes = [
    {value: 'Usuário', name: 'Usuário'},
    {value: 'Responsável', name: 'Responsável'},
    {value: 'Administrador', name: 'Administrador'}
]
import { backUrl, nameMask, phoneMask } from "../../GlobalVariables";

export default function UpdateUser({UserCpf}) {
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

    // const UpdateUser = async (email, telefone) => {
    //     const nome = document.querySelector('#name').value.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    //     const tipo = document.querySelector('#accoutType').value;

    //     try {
    //         const response = (await Axios.post(backUrl + 'user/create', {
    //             nome: nome,
    //             cpf: cpf,
    //             d_nas: d_nas,
    //             telefone: telefone,
    //             email: email,
    //             senha: senha,
    //             tipo: tipo
    //         })).data;
    
    //         setAlert('Success', 'Usuário criado');
    //     } catch (e) {
    //         const erro = e.response.data;
            
    //         if(erro === 'CPF ja cadastrado') setAlert('Error', 'CPF ja cadastrado');
    //         else if (erro === 'Email ja cadastrado') setAlert('Error', 'Email ja cadastrado');
    //         else setAlert('Error', 'Desculpe, não foi possível cadastrar o usuário. Tente novamente mais tarde');
    //     }
    // }

    // const validate = (e) => {
    //     e.preventDefault();

    //     const email = document.querySelector('#email').value;
    //     const telefone = document.querySelector('#phone').value;

    //     if(telefone.length === 15) {
    //         try {
    //             z.string().email().parse(email);
    //             CreateNewUser(email, telefone);
    //         } catch (error) {
    //             setAlert('Warning', 'Email inválido')
    //         } 
    //     } else setAlert('Warning', 'Número de telefone inválido. (É necessário adicionar o DDD)')
    // }

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: {duration: 0.2} }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
                <AnimatePresence>
                    {alertState && <Alert messageType={alertType} message={message} />}
                </AnimatePresence>
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: {duration: 0.2} }} className='ModalBackGround' />
            <form onSubmit={validate} className='flex h v ModalWrapper' >
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: {duration: 0.2} }} className='Modal flex c'>
                <h1>Alterar Usuário</h1>
                <h3>Alterar Usuário</h3>
                    <Input type={'text'} placeholder={'Nome completo'} formatter={nameMask} id={'name'} required={true} />
                    <Input type={'text'} placeholder={'CPF'} formatter={cpfMask} id={'cpf'} required={true} />
                    <Input type={'date'} placeholder={'Data de Nascimento'} maxDate={getCurrentDate(18)} id={'birthday'} required={true} />
                    <Input type={'text'} placeholder={'Telefone'} formatter={phoneMask} id={'phone'} required={true} />
                    <Input type={'text'} placeholder={'Email'} id={'email'} required={true} />
                    <Input type={'password'} placeholder={'Senha'} id={'password'} required={true} />
                    <Input type={'password'} placeholder={'Confirmar Senha'} id={'confirmPassword'} required={true} />
                    <Input type={'dropdown'} values={accoutTypes} placeholder={'Tipo de Usuário'} id={'accoutType'} required={true} />
                    <Input type={'submit'} placeholder={'Cadastrar'} />
                    <p className='CancelButton' onClick={() => {CloseModal(false)}}>Cancelar</p>
                </motion.div>
            </form>
        </>
    )
}
