import { useEffect, useState } from 'react';
import socket from '../socket';

function PrivateChat({ recipient, nickname }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    setMessages([]); // reset à chaque changement de destinataire

    socket.emit('/private_history', recipient, (history) => {
      setMessages(history || []);
    });

    const handlePrivate = ({ from, content }) => {
      // Affiche les messages reçus d'autrui
      if (from === recipient) {
        setMessages(prev => [...prev, `📥 ${from} : ${content}`]);
      } else if (from === nickname && recipient) {
        // Optionnel : reflète aussi mes propres messages envoyés dans un autre onglet
        setMessages(prev => [...prev, `➡️ (Moi à ${recipient}) : ${content}`]);
      }
    };

    socket.on('private_message', handlePrivate);

    return () => {
      socket.off('private_message', handlePrivate);
    };
  }, [recipient, nickname]);

  const sendPrivate = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit('/msg', { to: recipient, content: input }, (res) => {
      setServerMessage(res);
      if (res.startsWith('✅')) {
        setMessages(prev => [...prev, `➡️ (Moi à ${recipient}) : ${input}`]);
      }
    });

    setInput('');
  };

  return (
    <>
      <div className="chat-header">
        <div className="chat-title">🔒 {recipient}</div>
        <div className="chat-actions">
          <div style={{ color: '#8696a0', fontSize: '0.9rem' }}>
            Conversation privée
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.includes('✅') || msg.includes('⛔') ? 'server' : ''}`}>
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
        <form className="chat-input-form" onSubmit={sendPrivate}>
          <input 
            className="chat-input"
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder="Tapez votre message privé..."
          />
          <button type="submit" className="send-button">
            ➤
          </button>
        </form>
      </div>
    </>
  );
}

export default PrivateChat;