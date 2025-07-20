import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/sidebar';
import ChannelChat from './components/ChannelChat';
import PrivateChat from './components/PrivateChat';
import socket from './socket';

function App() {
  const [nickname, setNickname] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationType, setConversationType] = useState(null); // 'channel' ou 'private'
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [channelAuthor, setChannelAuthor] = useState(null); // Nouveau state

  // Réception du message de bienvenue
  useEffect(() => {
    const handleServerMessage = (msg) => {
      if (!selectedConversation) {
        setWelcomeMessage(msg);
      }
    };

    socket.on('server_message', handleServerMessage);
    return () => {
      socket.off('server_message', handleServerMessage);
    };
  }, [selectedConversation]);

  // Réception du pseudo une fois authentifié
  useEffect(() => {
    socket.on('/nick', (nick) => {
      setNickname(nick);
    });

    return () => {
      socket.off('/nick');
    };
  }, []);

    const handleSelectConversation = ({ type, name, author }) => {
      setSelectedConversation({ type, name });
      setChannelAuthor(author || null);
    };


  if (!nickname) {
    return <Auth onAuthenticated={setNickname} />;
  }
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        nickname={nickname}
        onSelectConversation={handleSelectConversation}
      />
      <div style={{ flex: 1, padding: '1rem', position: 'relative' }}>
        {welcomeMessage && (
          <div style={{ backgroundColor: '#e0ffe0', border: '1px solid green', padding: '0.5rem', marginBottom: '1rem' }}>
            {welcomeMessage}
          </div>
        )}
        {!selectedConversation && <p>💬 Sélectionne une conversation</p>}

        {selectedConversation?.type === 'channel' && (
          <ChannelChat
            channel={selectedConversation.name}
            nickname={nickname}
            author={channelAuthor}
          />
        )}
        {selectedConversation?.type === 'private' && (
          <PrivateChat
            recipient={selectedConversation.name}
            nickname={nickname}
          />
        )}        
      </div>
    </div>
  );
}

export default App;
