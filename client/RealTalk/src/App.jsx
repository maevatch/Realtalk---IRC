import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/sidebar';
import ChannelChat from './components/ChannelChat';
import PrivateChat from './components/PrivateChat';
import socket from './socket';
import './styles/realtalk.css';

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
    <div className="app-container">
      <Sidebar
        nickname={nickname}
        onSelectConversation={handleSelectConversation}
      />
      <div className="chat-container">
        {welcomeMessage && (
          <div className="welcome-message">
            {welcomeMessage}
          </div>
        )}
        
        {!selectedConversation && (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-text">Sélectionnez une conversation</div>
            <div className="empty-state-subtext">Choisissez un canal ou démarrez une conversation privée</div>
          </div>
        )}

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
