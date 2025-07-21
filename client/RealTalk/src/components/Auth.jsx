import { useState } from 'react';
import socket from '../socket';
import Logo from './Logo';
import '../styles/realtalk.css';

function Auth({ onAuthenticated }) {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setMessage("❌ Le pseudo ne peut pas être vide.");
      return;
    }

    socket.emit('/nick', trimmed, (response) => {
      setMessage(response);
      if (response.startsWith('✅')) {
        onAuthenticated(trimmed); // Appelle App pour dire que l'utilisateur est connecté
      }
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ marginBottom: '2rem' }}>
          <Logo size={100} />
        </div>
        <h1 className="auth-title">RealTalk</h1>
        <p className="auth-subtitle">Connectez-vous pour commencer à discuter</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Entrez votre pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            autoComplete="username"
          />
          <button type="submit" className="auth-button">
            Se connecter
          </button>
        </form>
        
        {message && (
          <div className={`auth-message ${message.startsWith('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Auth;
