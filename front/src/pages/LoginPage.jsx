/* Packages */
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import { sha256 } from "js-sha256";
import { useState } from 'react';
import { AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";

/* Components */
import Input from '../components/Input';
import Alert from '../components/Alert';

/* Hooks */
import callApi from '../hooks/api'

/* Css */
import './LoginPage.css';

const LoginPage = () => {
  const [alertType, setAlertType] = useState('');
  const [message, setMessage] = useState('');
  const [alertState, setAlertState] = useState(false);
  const navigate = useNavigate();

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

  const handleToggle = () => {
    const phoneNumber = '5551999999999';
    const message = 'Olá, gostaria de criar uma conta.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  const validate = (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const senha = document.querySelector('#password').value;

    try {
      z.string().email().parse(email);
      if (senha.length < 8) setAlert('Warning', 'A senha deve ter no mínimo 8 caracteres')
      else Login(sha256.hmac("lytuhiçjdswxafgqvbjanoikl", senha), email);
    } catch (error) {
      console.log(error)
      setAlert('Warning', 'Email inválido')
    }

  };

  const Login = async (senha, email) => {
    //Fazer login

    const response = await callApi('user/login', 'post', { email: email, senha: senha })

    if (response === 'Usuário não cadastrado') {
      setAlert('Error', 'Email ou senha incorretos')
    } else if (response === 'database off') {
      setAlert('Error', 'Desculpe, não foi possível realizar o login. Tente novamente mais tarde');
    } else {
      Cookies.set("id", response.id, { expires: 30 });
      // navigate('/');
    }

  }

  return (
    <>
      <AnimatePresence>
        {alertState && <Alert messageType={alertType} message={message} />}
      </AnimatePresence>
      <div className="login-register-container">
        <div className="left-half">
          <img src="/logos/Big-Logo-White.png" alt="logo" />
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
            <p onClick={handleToggle} className="toggle-link acme">
              Não tem uma conta? <span>Contate um administrador</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
