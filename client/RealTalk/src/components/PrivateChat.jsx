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
    <div>
      <h2>Privé avec {recipient}</h2>

      <div id="chat" style={{ height: 200, overflowY: 'scroll', border: '1px solid gray', marginBottom: '1rem' }}>
        {messages.map((msg, i) => <p key={i}>{msg}</p>)}
      </div>

      <form onSubmit={sendPrivate}>
        <input value={input} onChange={e => setInput(e.target.value)} />
      </form>

      {serverMessage && <p>{serverMessage}</p>}
    </div>
  );
}

export default PrivateChat;