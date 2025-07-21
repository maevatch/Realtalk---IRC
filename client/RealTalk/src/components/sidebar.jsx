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
                <button onClick={() => handleJoinChannel(name, author)} title={`Rejoindre #${name}`}>+</button>
              </li>
            ))}
          </ul>

        )}

        {activeTab === 'conversations' && (
          <ul>
            {joinedChannelsWithAuthor.map(({ name, author }) => (
              <li key={name} style={{ cursor: 'pointer' }} onClick={() => onSelectConversation({ type: 'channel', name, author })}>
                #{name} <i style={{ fontSize: '0.8em', color: '#666' }}>par {author}</i>
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
      <div style={{ position: 'relative', textAlign: 'right', marginTop: '1rem' }}>
  <button onClick={() => setShowActions((prev) => !prev)} title="Nouveau...">➕</button>

  {showActions && (
    <div style={{
      position: 'absolute',
      bottom: '2.5rem',
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      padding: '0.5rem',
      borderRadius: '8px',
      zIndex: 10
    }}>
      <button onClick={handleCreateChannel} title="Créer un canal">#️</button>
      <button onClick={handlePrivateMessage} title="Message privé">🔒</button>
    </div>
  )}
</div>

    </div>
  );
}

export default Sidebar;
