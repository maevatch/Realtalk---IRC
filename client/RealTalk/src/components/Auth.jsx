import { useState } from 'react';
import socket from '../socket';

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
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Entre ton pseudo"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Se connecter</button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}

export default Auth;
