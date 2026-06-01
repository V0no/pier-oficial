import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import loginBackground from '../static/login_fundo.png';
import { authenticateUser } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !senha) {
      setError('Preencha seu e-mail e senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const authenticated = await authenticateUser(email.trim(), senha);
      if (authenticated) {
        navigate('/drones-selection');
        return;
      }

      setError('E-mail ou senha incorretos.');
    } catch (_requestError) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${loginBackground})` }}>
      <div className="login-page__overlay" />

      <main className="login-card" aria-label="Tela de login">
        <h1 className="login-card__title">PIER Surveillance</h1>
        <p className="login-card__subtitle">{'Fa\u00e7a o login para acessar a dashboard'}</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-field__label">Email*</span>
            <input
              className="login-field__input"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </label>

          <label className="login-field">
            <span className="login-field__label">Senha*</span>
            <input
              className="login-field__input"
              type="password"
              name="password"
              autoComplete="current-password"
              value={senha}
              onChange={event => setSenha(event.target.value)}
            />
          </label>

          <button className="login-form__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
          {error && <p className="login-form__error">{error}</p>}
        </form>

        <a className="login-card__recover" href="#">
          Esqueceu a senha?
        </a>
      </main>
    </div>
  );
};

export default Login;
