import { useEffect, useState } from 'react';
import socket from '../socket';

function PrivateChat({ recipient, nickname }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
  setMessages([]); // reset messages à chaque changement de destinataire

  socket.emit('/private_history', recipient, (history) => {
    setMessages(history || []);
  });

  const handlePrivate = ({ from, content }) => {
    // Ne réagit que si le message vient bien du destinataire en cours
    if (from === recipient) {
      setMessages(prev => [...prev, `📥 ${from} : ${content}`]);
    }
  };

  socket.on('private_message', handlePrivate);

  return () => {
    socket.off('private_message', handlePrivate);
  };
}, [recipient]);


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
      <div id="chat" style={{ height: 200, overflowY: 'scroll', border: '1px solid gray' }}>
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
