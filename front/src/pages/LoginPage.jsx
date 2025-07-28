import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import { AnimatePresence } from 'framer-motion'; // Certifique-se de importar o AnimatePresence corretamente

/* Components */
import Input from '../components/Input';

/* Lib */
import api from '../lib/Axios';

/* Context */
import { UserContext } from '../context/UserContext';
import { AlertContext } from '../context/AlertContext';

/* Css */
import './LoginPage.css';

const LoginPage = () => {
    const { setAlert } = useContext(AlertContext);
    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    const handleToggle = () => {
        const recipient = 'labhubalocacaodelaboratorios@gmail.com';
        const subject = 'Criar nova conta';
        const body = 'Olá, desejo criar uma nova conta para meu uso pessoal.';

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;
    };

    const validate = (e) => {
        e.preventDefault();

        const email = document.querySelector('#email').value;
        const senha = document.querySelector('#password').value;

        try {
            z.string().email().parse(email);
            if (senha.length < 8) setAlert('Warning', 'A senha deve ter no mínimo 8 caracteres');
            else Login(senha, email);
        } catch (error) {
            setAlert('Warning', 'Email inválido');
        }
    };

    const Login = async (senha, email) => {
        try {
            const response = (await api.post('user/login', {
                email: email,
                senha: senha
            })).data;

            login({ id: response.id, nome: response.nome, tipo: response.tipo });
            navigate('/');
        } catch (e) {
            const erro = e.response.data;
            setAlert('Error', erro);
        }
    };

  return (
        <>
            <div className="login-register-container">
                <div className="left-half ">
                    <div className='imgLogo'></div>
                </div>
                <div className="right-half">
                    <div className='content'>
                        <h2 className='acme'>Seja bem vindo ao <span>Labhub</span></h2>
                        <form onSubmit={validate}>
                            <div className="form-group">
                                <Input type={'text'} placeholder={'Email'} id={'email'} required={true} />
                            </div>
                            <div className="form-group">
                                <Input type={'password'} placeholder={'Senha'} id={'password'} autoComplete={'off'} required={true} />
                            </div>
                            <Input type={'submit'} placeholder={'Entrar'} />
                        </form>
                        <p className="toggle-link acme">
                            Não tem uma conta? <span onClick={handleToggle}>Contate um administrador</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
