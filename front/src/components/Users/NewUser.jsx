/* Packages */
import Axios from 'axios';
import { sha256 } from "js-sha256";
import { z } from "zod";
import { cpf as CPF } from 'cpf-cnpj-validator';
import { motion, AnimatePresence } from "framer-motion";
import { useState } from 'react';

/* Components */
import Input from '../Input';
import Alert from '../Alert';

/* Css */
import '../Modal.css';

/* Variables/Consts */
const accoutTypes = [
    { value: 'Usuário', name: 'Usuário' },
    { value: 'Responsável', name: 'Responsável' },
    { value: 'Administrador', name: 'Administrador' }
]
import { backUrl, nameMask, cpfMask, phoneMask, getCurrentDate } from "../../GlobalVariables";

export default function NewUser({ CloseModal }) {
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

    const CreateNewUser = async (senha, email, cpf, telefone) => {
        const nome = document.querySelector('#name').value.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        const d_nas = document.querySelector('#birthday').value;
        const tipo = document.querySelector('#accoutType').value;

        try {
            const response = (await Axios.post(backUrl + 'user/create', {
                nome: nome,
                cpf: cpf,
                d_nas: d_nas,
                telefone: telefone,
                email: email,
                senha: senha,
                tipo: tipo
            })).data;

            setAlert('Success', 'Usuário criado');
        } catch (e) {
            const erro = e.response.data;

            if (erro === 'CPF ja cadastrado') setAlert('Error', 'CPF ja cadastrado');
            else if (erro === 'Email ja cadastrado') setAlert('Error', 'Email ja cadastrado');
            else setAlert('Error', 'Desculpe, não foi possível cadastrar o usuário. Tente novamente mais tarde');
        }
    }

    const validate = (e) => {
        e.preventDefault();

        const senha = document.querySelector('#password').value;
        const confirmarSenha = document.querySelector('#confirmPassword').value;
        const email = document.querySelector('#email').value;
        const cpf = document.querySelector('#cpf').value;
        const telefone = document.querySelector('#phone').value;

        if (CPF.isValid(cpf)) {
            if (telefone.length === 15) {
                try {
                    z.string().email().parse(email);
                    if (senha.length < 8) setAlert('Warning', 'A senha deve ter no mínimo 8 caracteres')
                    else if (senha != confirmarSenha) setAlert('Warning', 'As senhas informadas são diferentes')
                    else CreateNewUser(sha256.hmac("lytuhiçjdswxafgqvbjanoikl", senha), email, cpf, telefone);
                } catch (error) {
                    setAlert('Warning', 'Email inválido')
                }
            } else setAlert('Warning', 'Número de telefone inválido. (É necessário adicionar o DDD)')
        } else setAlert('Warning', 'CPF inválido');
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
            <form onSubmit={validate} className='flex h v ModalWrapper' >
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c'>
                    <h1>Novo Usuário</h1>
                    <Input type={'text'} placeholder={'Nome completo'} formatter={nameMask} id={'name'} required={true} />
                    <Input type={'text'} placeholder={'CPF'} formatter={cpfMask} id={'cpf'} required={true} />
                    <Input type={'date'} placeholder={'Data de Nascimento'} maxDate={getCurrentDate(18)} id={'birthday'} required={true} />
                    <Input type={'text'} placeholder={'Telefone'} formatter={phoneMask} id={'phone'} required={true} />
                    <Input type={'text'} placeholder={'Email'} id={'email'} required={true} />
                    <Input type={'password'} placeholder={'Senha'} id={'password'} autoComplete={'off'} required={true} />
                    <Input type={'password'} placeholder={'Confirmar Senha'} autoComplete={'off'} id={'confirmPassword'} required={true} />
                    <Input type={'dropdown'} values={accoutTypes} placeholder={'Tipo de Usuário'} id={'accoutType'} required={true} />
                    <Input type={'submit'} placeholder={'Cadastrar'} />
                    <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                </motion.div>
            </form>
        </>
    )
}   