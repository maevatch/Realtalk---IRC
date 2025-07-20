import { useEffect, useState } from 'react';
import socket from '../socket';

function ChannelChat({ channel, author, nickname }) {

    console.log('ChannelChat props:', { channel, nickname, author });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    setMessages([]); // réinitialise les messages à chaque changement de canal

    const handleMessage = (msg) => setMessages((prev) => [...prev, msg]);

    socket.on('server_message', handleMessage);
    socket.on('message', handleMessage);

    // Rejoindre automatiquement le canal si on le sélectionne
    socket.emit('/join', channel, (response) => {
        setServerMessage(response);
    });

    return () => {
        socket.off('server_message', handleMessage);
        socket.off('message', handleMessage);
    };
    }, [channel]); 

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('message', { channel, message: input });
    setInput('');
  };

  const quitChannel = () => {
    socket.emit('/quit', channel, (response) => {
      setServerMessage(response);
    });
  };

  const deleteChannel = () => {
    socket.emit('/delete', channel, (response) => {
      setServerMessage(response);
    });
  };

  return (
    <div>
      <h2>Canal : #{channel}</h2>

      {/* Boutons de gestion */}
      <div style={{ marginBottom: '1rem' }}>       
        <button onClick={quitChannel} title='Quitter'>👋 </button> {/* Pour quitter le canal */}      
        {author === nickname && (
        <button onClick={deleteChannel} title='Supprimer' style={{ color: 'red' }}>🗑️</button> )} {/* Pour supprimer le canal */}
      </div>

      <div id="chat" style={{ height: 200, overflowY: 'scroll', border: '1px solid gray', marginBottom: '1rem' }}>
        {messages.map((msg, i) => <p key={i}>{msg}</p>)}
      </div>

      <form onSubmit={sendMessage}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
      </form>

      {serverMessage && <p>{serverMessage}</p>}
    </div>
  );a
}

export default ChannelChat;
