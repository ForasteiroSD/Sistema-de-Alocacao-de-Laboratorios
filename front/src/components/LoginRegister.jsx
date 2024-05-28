import React, { useState, useEffect } from 'react';
import './LoginRegister.css';
import { useNavigate } from 'react-router-dom';

const LoginRegister = ({ isLogin }) => {
  const [isLoginState, setIsLoginState] = useState(isLogin);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    cpf: '',
    birthDate: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      cpf: '',
      birthDate: '',
      phone: ''
    });
  }, [isLoginState]);

  const handleToggle = () => {
    const phoneNumber = '5551999999999'; // Replace with the admin's phone number
    const message = 'Olá, gostaria de criar uma conta.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let validationErrors = {};
    if (!formData.email) validationErrors.email = 'Email é obrigatório.';
    if (!formData.password) validationErrors.password = 'Senha é obrigatória.';
    if (!isLoginState) {
      if (!formData.fullName) validationErrors.fullName = 'Nome completo é obrigatório.';
      if (!formData.cpf) validationErrors.cpf = 'CPF é obrigatório.';
      if (!formData.birthDate) validationErrors.birthDate = 'Data de nascimento é obrigatória.';
      if (!formData.phone) validationErrors.phone = 'Telefone é obrigatório.';
      if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = 'Senhas não conferem.';
    }
    return validationErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Navigate to the home page upon successful form submission
      navigate('/');
    }
  };

  return (
    <div className="login-register-container">
      <div className="left-half">
        <img src="/logos/Big-Logo-White.png" alt="logo" />
      </div>
      <div className="right-half">
        <h2>Bem vindo ao Labhub. {isLoginState ? 'Faça Login:' : 'Realize seu cadastro:'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLoginState && (
            <div>
              <div className="form-group">
                <label>Nome Completo:</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <span className="error">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label>CPF:</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                />
                {errors.cpf && <span className="error">{errors.cpf}</span>}
              </div>
              <div className="form-group">
                <label>Data de Nascimento:</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
                {errors.birthDate && <span className="error">{errors.birthDate}</span>}
              </div>
              <div className="form-group">
                <label>Telefone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          {!isLoginState && (
            <div className="form-group">
              <label>Confirme sua senha:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
          )}
          <button type="submit">{isLoginState ? 'Login' : 'Register'}</button>
        </form>
        <p onClick={handleToggle} className="toggle-link">
          Ainda não tem uma conta? Contate um Administrador.
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;
