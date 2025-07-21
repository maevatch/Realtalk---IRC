// Sidebar.jsx
import { useEffect, useState } from 'react';
import socket from '../socket';

function Sidebar({ nickname, onSelectConversation }) {
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' ou 'conversations'
  const [channels, setChannels] = useState([]);// Liste des canaux disponibles
  const [joinedChannels, setJoinedChannels] = useState([]);// Liste des canaux auxquels l'utilisateur a adhéré
  const [joinedChannelsWithAuthor, setJoinedChannelsWithAuthor] = useState([]);// Liste des canaux avec info auteur
  const [privateConversations, setPrivateConversations] = useState([]);// Liste des conversations privées
  const [showActions, setShowActions] = useState(false);// État pour afficher/masquer les actions


  useEffect(() => {
  // Récupérer la liste des canaux disponibles
  socket.emit('/list', '', (data) => {
    setChannels(data);
    
    // Récupérer les canaux auxquels l'utilisateur a déjà adhéré après avoir reçu la liste
    socket.emit('/mychannels', (joinedData) => {
      setJoinedChannels(joinedData);  // data = [channelName, ...]
      // Enrichir avec les infos d'auteur depuis la liste complète
      const enrichedChannels = joinedData.map(channelName => {
        const channelInfo = data.find(ch => ch.name === channelName);
        return {
          name: channelName,
          author: channelInfo ? channelInfo.author : 'Inconnu'
        };
      });
      setJoinedChannelsWithAuthor(enrichedChannels);
    });
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
    // Mettre à jour aussi la liste enrichie
    setJoinedChannelsWithAuthor((prev) => {
      const channelInfo = channels.find(ch => ch.name === channel);
      const newChannel = {
        name: channel,
        author: channelInfo ? channelInfo.author : 'Inconnu'
      };
      const exists = prev.find(ch => ch.name === channel);
      return exists ? prev : [...prev, newChannel];
    });
  });
  // Écouter les événements de sortie de canaux
  socket.on('/quit', (channelName) => {
    setJoinedChannels((prev) => prev.filter((name) => name !== channelName));
    setJoinedChannelsWithAuthor((prev) => prev.filter((ch) => ch.name !== channelName));
  });
  socket.on('/force_quit', (channelName) => {
    setJoinedChannels((prev) => prev.filter((name) => name !== channelName));
    setJoinedChannelsWithAuthor((prev) => prev.filter((ch) => ch.name !== channelName));
  });

  // Nettoyage des écouteurs d'événements
  return () => {
    socket.off('/create');
    socket.off('/join');
    socket.off('/force_quit');
    socket.off('/quit');
  };
}, [nickname]);
  // /msg
  const handlePrivateMessage = () => {
  const recipient = prompt("Avec qui veux-tu discuter en privé ?");
  if (!recipient || typeof recipient !== 'string' || recipient === nickname) return;
    socket.emit('/msg', recipient, (response) => {
      if (response.startsWith('✅')) {
        // Ajouter dans la liste si pas encore présent
        setPrivateConversations((prev = []) =>
          prev.includes(recipient) ? prev : [...prev, recipient]
        );

        onSelectConversation({ type: 'private', name: recipient });
      } else {
        alert(response);
      }
    });

    setShowActions(false);
  };


// /create
  const handleCreateChannel = () => {
    const channelName = prompt("Nom du nouveau canal :");
    if (!channelName) return;

    socket.emit('/create', channelName, (response) => {
      alert(response);
      if (response.startsWith('✅')) {
        // 👉 Rejoindre automatiquement le canal juste après l'avoir créé
        socket.emit('/join', channelName, (joinResponse) => {
          if (joinResponse.startsWith('✅')) {
            onSelectConversation({ type: 'channel', name: channelName, author: nickname });
          } else {
            alert(joinResponse);
          }
        });
      }
    });

    setShowActions(false);
  };

// /join
  const handleJoinChannel = (channelName, author) => {
    const confirmJoin = window.confirm(`Rejoindre le canal #${channelName} ?`);
    if (!confirmJoin) return;
      socket.emit('/join', channelName, (response) => {
        alert(response);
        if (response.startsWith('✅')) {
          onSelectConversation({ type: 'channel', name: channelName, author });
        }
      });

    };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">RealTalk</div>
        <div style={{ color: '#8696a0', fontSize: '0.9rem' }}>@{nickname}</div>
      </div>

      <div className="sidebar-tabs">
        <button 
          className={`sidebar-tab ${activeTab === 'channels' ? 'active' : ''}`}
          onClick={() => setActiveTab('channels')}
        >
          Canaux
        </button>
        <button 
          className={`sidebar-tab ${activeTab === 'conversations' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          Conversations
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'channels' && (
          <ul className="sidebar-list">
            {channels.map(({ name, author }) => (
              <li key={name} className="sidebar-item">
                <div className="channel-info">
                  <div className="channel-name">#{name}</div>
                  <div className="channel-author">par {author}</div>
                </div>
                <button 
                  className="join-button" 
                  onClick={() => handleJoinChannel(name, author)} 
                  title={`Rejoindre #${name}`}
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'conversations' && (
          <ul className="sidebar-list">
            {joinedChannelsWithAuthor.map(({ name, author }) => (
              <li 
                key={name} 
                className="sidebar-item" 
                onClick={() => onSelectConversation({ type: 'channel', name, author })}
              >
                <div className="channel-info">
                  <div className="channel-name">#{name}</div>
                  <div className="channel-author">par {author}</div>
                </div>
              </li>
            ))}
            {privateConversations.map((user) => (
              <li 
                key={user} 
                className="sidebar-item" 
                onClick={() => onSelectConversation({ type: 'private', name: user })}
              >
                <div className="channel-info">
                  <div className="channel-name">🔒 {user}</div>
                  <div className="channel-author">Conversation privée</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar-actions">
        <button 
          className="add-button" 
          onClick={() => setShowActions((prev) => !prev)} 
          title="Nouveau..."
        >
          +
        </button>

        {showActions && (
          <div className="actions-popup">
            <button className="action-button" onClick={handleCreateChannel}>
              📢 Créer un canal
            </button>
            <button className="action-button" onClick={handlePrivateMessage}>
              🔒 Message privé
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
