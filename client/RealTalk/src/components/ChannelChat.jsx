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

    // Gestions messages du serveur
    const handleMessage = (msg) => setMessages((prev) => [...prev, msg]);
    // Gestions des événements de suppression de canal
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
    <>
      <div className="chat-header">
        <div className="chat-title">#{channel}</div>
        <div className="chat-actions">
          <button className="chat-button" onClick={quitChannel} title='Quitter'>
            👋
          </button>
          {author === nickname && (
            <button className="chat-button delete" onClick={deleteChannel} title='Supprimer'>
              🗑️
            </button>
          )}
          <button className="chat-button" onClick={ShowUsers} title="Voir les utilisateurs">
            👥
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.includes('✅') || msg.includes('⛔') || msg.includes('👋') ? 'server' : ''}`}>
            {msg}
          </div>
        ))}
        {serverMessage && (
          <div className="message server">
            {serverMessage}
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={sendMessage}>
          <input 
            className="chat-input"
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tapez votre message..."
          />
          <button type="submit" className="send-button">
            ➤
          </button>
        </form>
      </div>

      {showUsers && (
        <div className="users-popup">
          <div className="users-popup-header">
            <div className="users-popup-title">Utilisateurs connectés</div>
            <button className="users-popup-close" onClick={() => setShowUsers(false)}>
              ✖
            </button>
          </div>
          <ul className="users-list">
            {channelUsers.map((u, i) => (
              <li key={i} className="user-item">{u}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default ChannelChat;
