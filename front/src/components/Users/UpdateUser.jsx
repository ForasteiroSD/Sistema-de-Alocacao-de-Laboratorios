/* Packages */
import { sha256 } from "js-sha256";
import { z } from "zod";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from 'react';

/* Components */
import Input from '../Input';

/* Lib */
import api from '../../lib/Axios'

/* Context */
import { AlertContext } from '../../context/AlertContext';

/* Css */
import '../Modal.css';

/* Variables/Consts */
const accoutTypes = [
    { value: 'Usuário', name: 'Usuário' },
    { value: 'Responsável', name: 'Responsável' },
    { value: 'Administrador', name: 'Administrador' }
]
import { nameMask, phoneMask } from "../../GlobalVariables";

export default function UpdateUser({ CloseModal, UserId, updateView, myAccount = false }) {
    const { setAlert } = useContext(AlertContext);
    const [isAdm, setIsAdm] = useState(false);

    async function getUsersData() {
        const response = (await api.post('user/data', {
            id: UserId
        })).data;

        if (response.tipo === 'Administrador') setIsAdm(true);

        document.querySelector('#name').value = response.nome;
        document.querySelector('#cpf').value = response.cpf;
        document.querySelector('#birthday').value = response.data_nasc.substr(0, 10);
        document.querySelector('#birthday').click();
        document.querySelector('#birthday').blur();
        document.querySelector('#phone').value = response.telefone;
        document.querySelector('#email').value = response.email;
        setTimeout(() => {
            document.querySelector('#accoutType').value = response.tipo;
            document.querySelector('#accoutType').style.color = '#000000'
        }, 100);

    }

    useEffect(() => {
        getUsersData();
    }, []);

    const UpdateUser = async (email, telefone, senha, novaSenha) => {
        const nome = document.querySelector('#name').value.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        const tipo = document.querySelector('#accoutType').value;

        let params;

        if (myAccount) {

            params = {
                id: UserId,
                nome: nome,
                telefone: telefone,
                email: email,
                senha: senha,
                novasenha: novaSenha,
                tipo: tipo,
                adm: false,
                mudarSenha: false,
                changeType: false
            };
            if (isAdm) params.changeType = true;
            if (novaSenha) params.mudarSenha = true;

        } else {

            params = {
                id: UserId,
                nome: nome,
                telefone: telefone,
                email: email,
                senha: senha,
                novasenha: novaSenha,
                tipo: tipo,
                adm: true,
                mudarSenha: false,
                changeType: true
            };
            if (novaSenha) params.mudarSenha = true;
        }

        if (document.querySelector("#cpf").value === "Master" && tipo !== "Administrador") {
            setAlert('Error', 'Você não pode alterar o tipo desta conta');
            return;
        }

        try {
            (await api.patch('user', params)).data;

            setAlert('Success', 'Usuário alterado');
            updateView && updateView();
        } catch (e) {
            const erro = e.response.data;
            setAlert('Error', erro);
        }
    }

    const validate = (e) => {
        e.preventDefault();

        const email = document.querySelector('#email').value;
        const telefone = document.querySelector('#phone').value;
        const novaSenha = document.querySelector('#newPassword').value;
        const confirmarSenha = document.querySelector('#confirmPassword').value;

        if (telefone.length === 15) {
            try {
                z.string().email().parse(email);

                if (myAccount) {
                    const senha = document.querySelector('#password').value;

                    if (senha.length < 8) {
                        setAlert('Error', 'Senha incorreta');
                        return;
                    }
                    else if(novaSenha != '') {
                        if (novaSenha.length < 8) {
                            setAlert('Warning', 'As senhas devem ter no mínimo 8 caracteres');
                            return;
                        }
    
                        if (novaSenha != confirmarSenha) {
                            setAlert('Warning', 'As senhas informadas são diferentes');
                            return;
                        }

                        UpdateUser(email, telefone, sha256.hmac(import.meta.env.VITE_REACT_APP_SECRET_KEY, senha), sha256.hmac(import.meta.env.VITE_REACT_APP_SECRET_KEY, novaSenha));
                    }
                    else UpdateUser(email, telefone, sha256.hmac(import.meta.env.VITE_REACT_APP_SECRET_KEY, senha));

                } else {

                    if (novaSenha > 0) {

                        if (novaSenha.length < 8) {
                            setAlert('Warning', 'A nova senha deve ter no mínimo 8 caracteres');
                            return;
                        }

                        if (novaSenha != confirmarSenha) {
                            setAlert('Warning', 'As senhas informadas são diferentes');
                            return;
                        }

                        UpdateUser(email, telefone, null, sha256.hmac(import.meta.env.VITE_REACT_APP_SECRET_KEY, novaSenha));

                    } else {
                        UpdateUser(email, telefone, null, null);
                    }
                }

            } catch (error) {
                setAlert('Warning', 'Email inválido')
            }
        } else setAlert('Warning', 'Número de telefone inválido. (É necessário adicionar o DDD)')
    }

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />
            <form onSubmit={validate} className='flex h v ModalWrapper' >
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} id='EditUserForm' className='Modal flex c'>
                    <h1>Alterar Usuário</h1>
                    <div className='scrollableModal flex c'>
                        <Input type={'text'} placeholder={'Nome completo'} formatter={nameMask} id={'name'} required={true} />
                        <Input type={'text'} placeholder={'CPF'} id={'cpf'} readOnly={'readonly'} required={true} />
                        <Input type={'date'} placeholder={'Data de Nascimento'} id={'birthday'} readOnly={'readonly'} required={true} />
                        <Input type={'text'} placeholder={'Telefone'} formatter={phoneMask} id={'phone'} required={true} />
                        <Input type={'text'} placeholder={'Email'} id={'email'} required={true} />
                        {myAccount ? (
                            <>
                                <Input type={'password'} placeholder={'Senha'} id={'password'} required={true} />
                                <Input type={'password'} placeholder={'Nova senha'} id={'newPassword'} />
                                <Input type={'password'} placeholder={'Confirmar nova senha'} id={'confirmPassword'} />
                                {isAdm ? (
                                    <Input type={'dropdown'} values={accoutTypes} placeholder={'Tipo de Usuário'} id={'accoutType'} required={true} />
                                ) : (
                                    <Input type={'text'} placeholder={'Tipo de Usuário'} id={'accoutType'} required={true} readOnly={true} />
                                )}
                            </>
                        ) : (
                            <>
                                <Input type={'password'} placeholder={'Nova senha'} id={'newPassword'} />
                                <Input type={'password'} placeholder={'Confirmar nova senha'} id={'confirmPassword'} />
                                <Input type={'dropdown'} values={accoutTypes} placeholder={'Tipo de Usuário'} id={'accoutType'} required={true} />
                            </>
                        )}
                    </div>
                    <Input type={'submit'} placeholder={'Salvar'} />
                    <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                </motion.div>
            </form>
        </>
    )
}
