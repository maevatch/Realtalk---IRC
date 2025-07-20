import { useEffect, useState } from 'react';
import socket from '../socket';

function ChannelChat({ channel, author, nickname }) {

    console.log('ChannelChat props:', { channel, nickname, author });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [channelUsers, setChannelUsers] = useState([]);


  useEffect(() => {
    setMessages([]); // réinitialise les messages à chaque changement de canal

    // Écoute des messages du serveur
    const handleMessage = (msg) => setMessages((prev) => [...prev, msg]);
    // Écoute des messages du serveur
    const handleForceQuit = (chan) => { 
      if (chan === channel) {
        setServerMessage("⛔ Ce canal a été supprimé.");
      }
    };
    // Écoute des messages du serveur
    socket.on('server_message', handleMessage);
    socket.on('message', handleMessage);
    socket.on('/force_quit', handleForceQuit);   // Écoute des événements de suppression de canaux

    // Rejoindre automatiquement le canal si on le sélectionne
    socket.emit('/join', channel, (response) => {
        setServerMessage(response);
    });

    return () => { -// Nettoyage des écouteurs d'événements
        socket.off('server_message', handleMessage);
        socket.off('message', handleMessage);
    };
    }, [channel]); 
  // Envoi de message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('message', { channel, message: input });
    setInput('');
  };
  // Quitter le canal
  const quitChannel = () => {
    socket.emit('/quit', channel, (response) => {
      setServerMessage(response);
    });
  };
  // Supprimer le canal
  const deleteChannel = () => {
  const confirmDelete = window.confirm(`⚠️ Supprimer définitivement le canal #${channel} ?`);
  if (!confirmDelete) return;

  socket.emit('/delete', channel, (response) => {
    setServerMessage(response);
  });
};


  const ShowUsers = () => {
    socket.emit('/users', channel, (users) => {
      setChannelUsers(users);
      setShowUsers(true);
    });
  }

  return (
    <div>
      <h2>Canal : #{channel}</h2>

      {/* Boutons de gestion */}
      <div style={{ marginBottom: '1rem' }}>       
        <button onClick={quitChannel} title='Quitter'>👋 </button> {/* Pour quitter le canal */}      
        {author === nickname && (
        <button onClick={deleteChannel} title='Supprimer' style={{ color: 'red' }}>🗑️</button> )} {/* Pour supprimer le canal */}
        <button onClick={ShowUsers} title="Voir les utilisateurs">👥</button>   {/* Pour voir users dans channel */} 
      </div>

      <div id="chat" style={{ height: 200, overflowY: 'scroll', border: '1px solid gray', marginBottom: '1rem' }}>
        {messages.map((msg, i) => <p key={i}>{msg}</p>)}
      </div>

      <form onSubmit={sendMessage}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
      </form>

      {serverMessage && <p>{serverMessage}</p>}

      {showUsers && (
  <div style={{
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    width: '250px',
    background: '#f9f9f9',
    border: '1px solid #ccc',
    padding: '1rem',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <strong>Utilisateurs</strong>
      <button onClick={() => setShowUsers(false)} style={{ background: 'transparent', border: 'none', fontWeight: 'bold' }}>✖</button>
    </div>
    <ul>
      {channelUsers.map((u, i) => (
        <li key={i}>{u}</li>
      ))}
    </ul>
  </div>
)}

    </div>
  );
}

export default ChannelChat;
