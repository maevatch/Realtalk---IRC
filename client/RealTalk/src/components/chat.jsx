import ChannelChat from './ChannelChat';
import PrivateChat from './PrivateChat';

function Chat({ nickname, activeConversation }) {
  if (!activeConversation) return <p>Sélectionne un canal ou une conversation privée.</p>;

  return activeConversation.type === 'channel' ? (
    <ChannelChat channel={activeConversation.name} />
  ) : (
    <PrivateChat recipient={activeConversation.name} nickname={nickname} />
  );
}

export default Chat;



////////////////////////////////////////////////////////////////////////////////////////////////////

// import { useState, useEffect } from 'react';
// import socket from '../socket';

// function Chat({ activeConversation, refreshSidebar }) {
//   const [nickname, setNickname] = useState('');
//   const [serverMessage, setServerMessage] = useState('');
//   const [inputValue, setInputValue] = useState('');
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     const handleMessage = (msg) => {
//       setMessages(prev => [...prev, msg]);
//     };

//     socket.on('connect', () => {
//       console.log("📡 Tentative de connexion au socket...");
//       console.log('✅ Connecté au serveur. ID :', socket.id);
//     });

//     socket.on('disconnect', (reason) => {
//       console.log('⚠️ Socket déconnectée:', reason);
//     });

//     socket.on('connect_error', (error) => {
//       console.error('❌ Erreur de connexion socket :', error.message);
//     });

//     socket.on('reconnect_attempt', (attempt) => {
//       console.log(`🔄 Tentative de reconnexion n°${attempt}`);
//     });

//     socket.on('/nick', (nick) => {
//       setNickname(nick);
//     });

//     // Nettoyage des messages lors du changement de canal ou de suppression/quit
//     socket.on('/create', () => {
//       setMessages([]);
//     });

//     socket.on('/join', () => {
//       setMessages([]);
//     });

//     socket.on('/delete', () => {
//       setMessages([]);
//     });

//     socket.on('/quit', () => {
//       setMessages([]);
//     });

//     socket.on('server_message', handleMessage);
//     socket.on('message', handleMessage);

//     // Affiche les messages privés reçus
//     socket.on('private_message', ({ from, content }) => {
//       setMessages(prev => [...prev, `📥 Message privé de ${from} : ${content}`]);
//     });

//     return () => {
//       socket.off('server_message', handleMessage);
//       socket.off('message', handleMessage);
//       socket.off('private_message');
//       socket.off('connect');
//       socket.off('disconnect');
//       socket.off('connect_error');
//       socket.off('reconnect_attempt');
//       socket.off('/nick');
//       socket.off('/create');
//       socket.off('/join');
//       socket.off('/delete');
//       socket.off('/quit');
//     };
//   }, []);

//   useEffect(() => {
//     const chatDiv = document.getElementById('chat');
//     if (chatDiv) {
//       chatDiv.scrollTop = chatDiv.scrollHeight;
//     }
//   }, [messages]);

//   useEffect(() => {
//     if (activeConversation && activeConversation.messages) {
//       setMessages(activeConversation.messages);
//     }
//   }, [activeConversation]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const command = inputValue.trim();
//     if (!command) return;

//     // Gestion des commandes
//     if (command.startsWith('/nick ')) {
//       const newNick = command.slice(6).trim();
//       if (newNick) {
//         socket.emit('/nick', newNick, (response) => {
//           setServerMessage(response);
//           if (response.startsWith('✅')) setNickname(newNick);
//         });
//       }
//       setInputValue('');
//       return;
//     }

//     if (command.startsWith('/create ')) {
//       const channelName = command.slice(8).trim();
//       if (channelName) {
//         socket.emit('/create', channelName, (response) => {
//           setServerMessage(response);
//           if (response.startsWith('✅')) {
//             // Rejoindre automatiquement le canal créé
//             socket.emit('/join', channelName, (joinRes) => {
//               setServerMessage(joinRes);
//             });
//           }
//         });
//       }
//       setInputValue('');
//       return;
//     }

//     if (command.startsWith('/join ')) {
//       const channelName = command.slice(6).trim();
//       if (channelName) {
//         socket.emit('/join', channelName, (response) => {
//           setServerMessage(response);
//           if (refreshSidebar) refreshSidebar(); // <-- Ajoute ceci
//         });
//       }
//       setInputValue('');
//       return;
//     }

//     if (command.startsWith('/delete ')) {
//       const channelName = command.slice(8).trim();
//       if (channelName) {
//         socket.emit('/delete', channelName, (response) => {
//           setServerMessage(response);
//         });
//       }
//       setInputValue('');
//       return;
//     }

//     if (command.startsWith('/quit')) {
//       if (activeConversation && activeConversation.type === 'channel') {
//         socket.emit('/quit', activeConversation.name, (response) => {
//           setServerMessage(response);
//         });
//       }
//       setInputValue('');
//       return;
//     }

//     if (command.startsWith('/msg ')) {
//       // /msg destinataire message
//       const [_, to, ...rest] = command.split(' ');
//       const content = rest.join(' ');
//       if (to && content) {
//         socket.emit('/msg', { to, content }, (response) => {
//           setServerMessage(response);
//           if (response.startsWith('✅')) {
//             setMessages(prev => [...prev, `➡️ (Privé à ${to}) : ${content}`]);
//           }
//         });
//       }
//       setInputValue('');
//       return;
//     }

//     // Sinon, message normal dans la conversation active
//     if (!activeConversation) return;

//     if (activeConversation.type === 'channel') {
//       socket.emit('message', { channel: activeConversation.name, message: command });
//     } else if (activeConversation.type === 'private') {
//       socket.emit('/msg', { to: activeConversation.name, content: command }, (response) => {
//         setServerMessage(response);
//         if (response && response.startsWith('✅')) {
//           setMessages(prev => [...prev, `➡️ (Privé à ${activeConversation.name}) : ${command}`]);
//         }
//       });
//     }

//     setInputValue('');
//   };

//   return (
//     <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
//       <h2>
//         Bienvenue {nickname || 'inconnu'}{' '}
//         {activeConversation
//           ? activeConversation.type === 'channel'
//             ? `(dans #${activeConversation.name})`
//             : `(discussion privée avec ${activeConversation.name})`
//           : ''}
//       </h2>

//       <div
//         id="chat"
//         style={{
//           border: '1px solid #ccc',
//           padding: '1rem',
//           height: '200px',
//           overflowY: 'scroll',
//           marginBottom: '1rem'
//         }}
//       >
//         {messages.map((msg, i) => (
//           <p key={i}>{msg}</p>
//         ))}
//       </div>

//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Tape une commande ou un message..."
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           style={{ width: '100%', padding: '0.5rem' }}
//         />
//       </form>

//       {serverMessage && <p style={{ marginTop: '1rem' }}>{serverMessage}</p>}
//     </div>
//   );
// }

// export default Chat;
