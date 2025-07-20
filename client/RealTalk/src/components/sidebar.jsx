// Sidebar.jsx
import { useEffect, useState } from 'react';
import socket from '../socket';

function Sidebar({ nickname, onSelectConversation }) {
  const [activeTab, setActiveTab] = useState('channels');
  const [channels, setChannels] = useState([]);
  const [joinedChannels, setJoinedChannels] = useState([]);
  const [privateConversations, setPrivateConversations] = useState([]);

  useEffect(() => {
  // Récupérer la liste des canaux disponibles
  socket.emit('/list', '', (data) => {
    setChannels(data);
  });
  // Récupérer les canaux auxquels l'utilisateur a déjà adhéré
  socket.emit('/mychannels', (data) => {
    setJoinedChannels(data);  // data = [channelName, ...]
  });
  // Récupérer les conversations privées
  socket.emit('/privates', (data) => {
    setPrivateConversations(data);  // data = [username, ...]
  });
  // Écouter les événements de création de canaux
  socket.on('/create', (newChannel) => {
    setChannels((prev) => [...prev, { name: newChannel, author: 'Inconnu' }]);
  });
  // Écouter les événements de jointure de canaux 
  socket.on('/join', (channel) => {
    setJoinedChannels((prev) => [...new Set([...prev, channel])]);
  });
  // Écouter les événements de suppression de canaux
  socket.on('/force_quit', (channelName) => {
    setJoinedChannels((prev) => prev.filter((name) => name !== channelName));
  });

  // Nettoyage des écouteurs d'événements
  return () => {
    socket.off('/create');
    socket.off('/join');
    socket.off('/force_quit');
  };
}, [nickname]);

  const handlePrivateMessage = () => {
    const recipient = prompt("Avec qui veux-tu discuter en privé ?");
    if (!recipient || recipient === nickname) return;

    socket.emit('/msg', recipient, (response) => {
      if (response.startsWith('✅')) {
        onSelectConversation({ type: 'private', name: recipient });
      } else {
        alert(response);
      }
    });
  };

  const handleJoinChannel = (channelName) => {
    const confirmJoin = window.confirm(`Rejoindre le canal #${channelName} ?`);
    if (!confirmJoin) return;

    socket.emit('/join', channelName, (response) => {
      alert(response);
      if (response.startsWith('✅')) {
        onSelectConversation({ type: 'channel', name: channelName });
      }
    });
  };

  return (
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '1rem', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTab('channels')}>Canaux</button>
        <button onClick={() => setActiveTab('conversations')}>Conversations</button>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        {activeTab === 'channels' && (
          <ul>
            {channels.map(({ name, author }) => (
              <li key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span>#{name} <i style={{ fontSize: '0.8em', color: '#666' }}>par {author}</i></span>
                <button onClick={() => handleJoinChannel(name)} title={`Rejoindre #${name}`}>+</button>
              </li>
            ))}
          </ul>

        )}

        {activeTab === 'conversations' && (
          <ul>
            {joinedChannels.map((channel) => (
              <li key={channel} style={{ cursor: 'pointer' }} onClick={() => onSelectConversation({ type: 'channel', name: channel })}>
                #{channel}
              </li>
            ))}
            {privateConversations.map((user) => (
              <li key={user} style={{ cursor: 'pointer' }} onClick={() => onSelectConversation({ type: 'private', name: user })}>
                🔒 {user}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ➕ Bouton pour message privé */}
      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <button onClick={handlePrivateMessage} title="Nouveau message privé">➕</button>
      </div>
    </div>
  );
}

export default Sidebar;
