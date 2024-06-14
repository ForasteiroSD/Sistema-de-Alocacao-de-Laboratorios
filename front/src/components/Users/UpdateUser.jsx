/* Packages */
import Axios from 'axios';
import { sha256 } from "js-sha256";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from 'react';

/* Components */
import Input from '../Input';
import Alert from '../Alert';

/* Lib */
import api from '../../lib/Axios'

/* Css */
import '../Modal.css';

/* Variables/Consts */
const accoutTypes = [
    {value: 'Usuário', name: 'Usuário'},
    {value: 'Responsável', name: 'Responsável'},
    {value: 'Administrador', name: 'Administrador'}
]
import { nameMask, phoneMask } from "../../GlobalVariables";

export default function UpdateUser({CloseModal, UserId}) {
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

    async function getUsersData() {
        const response = (await api.post('user/data', {
            id: UserId
        })).data;
        
        document.querySelector('#name').value = response.nome;
        document.querySelector('#cpf').value = response.cpf;
        document.querySelector('#birthday').value = response.data_nasc.substr(0, 10);
        document.querySelector('#birthday').click();
        document.querySelector('#birthday').blur();
        document.querySelector('#phone').value = response.telefone;
        document.querySelector('#email').value = response.email;
        document.querySelector('#accoutType').value = response.tipo;
        document.querySelector('#accoutType').style.color = '#000000'
        }

    useEffect(() => {
        getUsersData();
    }, []);

    const UpdateUser = async (email, telefone, senha) => {
        const nome = document.querySelector('#name').value.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        const tipo = document.querySelector('#accoutType').value;

        let params = {
            id: UserId,
            nome: nome,
            telefone: telefone,
            email: email,
            novasenha: senha,
            tipo: tipo,
            adm: true,
            mudarSenha: false
        };
        if(senha) params.mudarSenha = true;

        try {
            (await api.patch('user', params)).data;
    
            setAlert('Success', 'Usuário alterado');
        } catch (e) {
            const erro = e.response.data;
            
            if(erro === 'Senha invalida') setAlert('Error', 'Senha invalida');
            else if (erro === 'Email ja cadastrado') setAlert('Error', 'Email ja cadastrado');
            else setAlert('Error', 'Desculpe, não foi possível alterar o usuário. Tente novamente mais tarde');
        }
    }

    const validate = (e) => {
        e.preventDefault();

        const email = document.querySelector('#email').value;
        const telefone = document.querySelector('#phone').value;
        const senha = document.querySelector('#password').value;
        const confirmarSenha = document.querySelector('#confirmPassword').value;

        if(telefone.length === 15) {
            try {
                z.string().email().parse(email);
                if(senha > 0) {
                    if (senha.length < 8) setAlert('Warning', 'A senha deve ter no mínimo 8 caracteres')
                    else if (senha != confirmarSenha) setAlert('Warning', 'As senhas informadas são diferentes')
                    else UpdateUser(email, telefone, sha256.hmac(import.meta.env.VITE_REACT_APP_SECRET_KEY, senha))
                } else UpdateUser(email, telefone, null);
            } catch (error) {
                setAlert('Warning', 'Email inválido')
            } 
        } else setAlert('Warning', 'Número de telefone inválido. (É necessário adicionar o DDD)')
    }

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
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: {duration: 0.2} }} id='EditUserForm' className='Modal flex c'>
                    <h1>Alterar Usuário</h1>
                    <Input type={'text'} placeholder={'Nome completo'} formatter={nameMask} id={'name'} required={true} />
                    <Input type={'text'} placeholder={'CPF'} id={'cpf'} readOnly={'readonly'} required={true} />
                    <Input type={'date'} placeholder={'Data de Nascimento'} id={'birthday'} readOnly={'readonly'} required={true} />
                    <Input type={'text'} placeholder={'Telefone'} formatter={phoneMask} id={'phone'} required={true} />
                    <Input type={'text'} placeholder={'Email'} id={'email'} required={true} />
                    <Input type={'password'} placeholder={'Nova senha'} id={'password'} />
                    <Input type={'password'} placeholder={'Confirmar nova senha'} id={'confirmPassword'} />
                    <Input type={'dropdown'} values={accoutTypes} placeholder={'Tipo de Usuário'} id={'accoutType'} required={true} />
                    <Input type={'submit'} placeholder={'Salvar'} />
                    <p className='CancelButton' onClick={() => {CloseModal(false)}}>Cancelar</p>
                </motion.div>
            </form>
        </>
    )
}
