require('dotenv').config();

const express = require('express');
const User= require('./models/user.js');
const Channel = require('./models/channel.js');
const Message = require('./models/message.js');

const mongoose= require ('mongoose');

const cors = require('cors');


//App setup
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

//Connexion DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connecté à MongoDB');
}).catch((err) => {
  console.error('❌ Erreur de connexion MongoDB :', err);
});


// En mémoire : utilisateurs et canaux
const users = {};         // { socket.id: nickname }
const channels = new Set(); // noms de canaux créés
const privateMessages = {}; // { nickname: Set([autreNickname, ...]) }

//////////// Connexion au socket ////////////////////

io.on('connection', (socket) => {
  console.log('✅ Nouveau client connecté :', socket.id);
  ////////////// Créer un pseudo (/nick) ////////////////
  socket.on('/nick', async (nickname, callback) => {
  const alreadyUsed = await User.findOne({ username: nickname });

  if (alreadyUsed) {
    alreadyUsed.socketId = socket.id;
    await alreadyUsed.save();
    callback("✅ Pseudo repris !");
    socket.emit('/nick', nickname);
    users[socket.id] = nickname;
    socket.emit('server_message', `👋 Content de te revoir, ${nickname} !`);  // Ajout message de bienvenue
    return;
  }

  const newUser = new User({ username: nickname, socketId: socket.id });
  await newUser.save();
  callback("✅ Pseudo enregistré !");
  socket.emit('/nick', nickname);
  socket.emit('server_message', `Bienvenue ${nickname} !`); ///message bienvenue
  users[socket.id] = nickname; 

});

  /////////// Créer un canal (/create) ////////////////
  socket.on('/create', async (channelName, callback) => {
    if (channels.has(channelName)) {
      return callback("❌ Le canal existe déjà !");
    }

    try {
      // Ajouter en mémoire
      channels.add(channelName);
      socket.join(channelName);

      // Créer dans MongoDB s'il n'existe pas
      let existing = await Channel.findOne({ name: channelName });

      if (!existing) {
        const currentUser = await User.findOne({ socketId: socket.id });

        await Channel.create({
          name: channelName,
          users: currentUser ? [currentUser._id] : []
        });
      }

      callback("✅ Canal créé !");
      socket.emit('/create', channelName);
      socket.broadcast.emit('/create', channelName); //pour informer les autres clients
    } catch (err) {
      console.error('❌ Erreur MongoDB :', err);
      callback("❌ Erreur lors de la création du canal.");
    }
  });

  /////////// Supprimer un canal (/delete) ///////////
  socket.on('/delete', (channelName, callback) => {
    if (channels.has(channelName)) {
      channels.delete(channelName);
      callback("✅ Canal supprimé");
      socket.emit('/delete', channelName);
    } else {
      callback("❌ Ce canal n'existe pas !");
    }
  });

  //////// Rejoindre un canal (/join) /////////
  socket.on('/join', async (channelName, callback) => {
    const channelDoc = await Channel.findOne({ name: channelName });
    if (!channelDoc) {
      return callback("❌ Ce canal n'existe pas !");
    }
    // Mets à jour le Set en mémoire si besoin
    channels.add(channelName);

    try {
      socket.join(channelName);
      callback("✅ Tu as rejoint le canal");
      socket.emit('/join', channelName);
      socket.broadcast.emit('/join', channelName); //pour informer les autres clients

      // Récupérer l'utilisateur courant
      const author = await User.findOne({ socketId: socket.id });

      // Ajouter l'utilisateur au tableau "users" du canal (évite doublons)
      await Channel.updateOne(
        { name: channelName },
        { $addToSet: { users: author._id } }
      );
      console.log(`[DEBUG] Ajout de ${author.username} au canal ${channelName}`);

      // Charger et renvoyer l’historique du canal
      const channelDoc = await Channel.findOne({ name: channelName });
      const messages = await Message.find({ channel: channelDoc._id })
        .populate('author', 'username')
        .sort({ timestamp: 1 });

      const formatted = messages.map(m => `${m.author.username} : ${m.content}`);
      if (formatted.length > 0) {
        socket.emit('server_message', `📜 ${formatted.length} messages précédents :`);
        formatted.forEach(msg => socket.emit('server_message', msg));
      }

    } catch (err) {
      console.error('❌ Erreur lors du join/historique :', err);
      io.to(channelName).emit('server_message', `🔔 ${author.username} a rejoint le canal.`);
      callback("❌ Erreur lors de la connexion au canal.");
    }
  });

  /////////// Quitter un canal (/quit) /////////////
  socket.on('/quit', (channelName, callback) => {
    socket.leave(channelName);
    callback("👋 Tu as quitté le canal");
    socket.emit('/quit', channelName); // utile uniquement si tu le traites côté client
    io.to(channelName).emit('server_message', `${users[socket.id]} a quitté le canal.`);
  });

  ////////// Envoie message dans un canal //////////////
  socket.on('message', async ({ channel, message }) => {
  try {
    const author = await User.findOne({ socketId: socket.id });
    const channelDoc = await Channel.findOne({ name: channel });

    if (!author || !channelDoc) {
      console.log("❌ Pas d'auteur ou de canal trouvé, on stop");
      return;
    }

    console.log("[DEBUG] Avant sauvegarde message public :", { content: message, author: author._id, channel: channelDoc._id });

    const savedMessage = await Message.create({
      content: message,
      author: author._id,
      channel: channelDoc._id
    });

    console.log("✅ Message public sauvegardé avec succès :", savedMessage);

    io.to(channel).emit('server_message',  `${author.username} : ${message}`);
  } catch (err) {
    console.error('❌ Erreur lors de l’enregistrement du message :', err);
  }
});

  /////////// Lorsqu'un message privé est envoyé, on enregistre la conversation
 socket.on('/msg', async (data, callback) => {
  let to, content;

  // Si data est un objet : { to: "bob", content: "salut" }
  if (typeof data === 'object') {
    to = data.to;
    content = data.content;
  } else if (typeof data === 'string') {
    // Si c’est juste une chaîne, vérifier s’il y a un espace
    const [target, ...msgParts] = data.split(' ');
    to = target;
    content = msgParts.join(' ');
  }

  if (!to || to === socket.nickname) {
    return callback?.("❌ Nom d’utilisateur invalide");
  }

  const recipientSocket = Array.from(users.entries())
    .find(([_, s]) => s.nickname === to)?.[1];

  if (!recipientSocket) {
    return callback?.("❌ Utilisateur non connecté.");
  }

  if (content) {
    // Envoi direct du message
    recipientSocket.emit('private_message', { from: socket.nickname, content });

    // Historique côté expéditeur
    if (!privateMessages[socket.nickname]) privateMessages[socket.nickname] = {};
    if (!privateMessages[socket.nickname][to]) privateMessages[socket.nickname][to] = [];
    privateMessages[socket.nickname][to].push({ from: socket.nickname, content });

    // Historique côté destinataire
    if (!privateMessages[to]) privateMessages[to] = {};
    if (!privateMessages[to][socket.nickname]) privateMessages[to][socket.nickname] = [];
    privateMessages[to][socket.nickname].push({ from: socket.nickname, content });

    return callback?.(`✅ Message envoyé à ${to}`);
  } else {
    // Juste ouverture de conversation
    return callback?.(`✅ Conversation ouverte avec ${to}`);
  }
});


  ///////////// Lister les canaux du serveur (/list) ///////////////
socket.on('/list', async (filter = '', callback) => {
  try {
    const regex = new RegExp(filter, 'i'); // i = insensible à la casse
    const allChannels = await Channel.find({ name: { $regex: regex } })
      .populate('users', 'username')
      .lean();

    const formatted = allChannels.map(c => ({
      name: c.name,
      author: c.users && c.users.length > 0 ? c.users[0].username : 'Inconnu'
    }));

    callback(formatted);
  } catch (err) {
    console.error('/list error :', err);
    callback([]);
  }
});
 
  ////////////////// Lister les utilisateurs d'un canal (/users)///////////////////////
  socket.on('/users', async (callback) => {
    try {
      const currentUser = await User.findOne({ socketId: socket.id });
      const channelDoc = await Channel.findOne({ users: currentUser._id });

      if (!channelDoc) {
        return callback("❌ Tu n'es dans aucun canal.");
      }

      const usersInChannel = await User.find({ _id: { $in: channelDoc.users } }, 'username');
      const list = usersInChannel.map(u => u.username).join(', ');
      callback(`👥 Utilisateurs dans #${channelDoc.name} : ${list}`);
    } catch (err) {
      console.error('/users error :', err);
      callback("❌ Erreur lors de la récupération des utilisateurs.");
    }
  });

  ////////////// Liste conversations privées de l'utilisateur (/privates) ///////////////
  socket.on('/privates', async (callback) => {
  const nickname = users[socket.id];
  if (!nickname) return callback([]);
  try {
    const me = await User.findOne({ username: nickname });
    if (!me) return callback([]);

    // Trouver tous les utilisateurs avec qui j'ai échangé au moins un message privé
    const messages = await Message.find({
      $or: [
        { author: me._id },
        { recipient: me._id }
      ],
      recipient: { $ne: null } // message privé
    }).populate('author recipient', 'username');

    // Extraire les interlocuteurs uniques
    const interlocutorsSet = new Set();

    messages.forEach(msg => {
      if (msg.author.username !== nickname) interlocutorsSet.add(msg.author.username);
      if (msg.recipient.username !== nickname) interlocutorsSet.add(msg.recipient.username);
    });

    callback(Array.from(interlocutorsSet));
  } catch (err) {
    console.error('Erreur dans /privates:', err);
    callback([]);
  }
});

/////////// Récupérer les canaux de l'utilisateur (/mychannels) ///////////////
  socket.on('/mychannels', async (callback) => {
    try {
      const user = await User.findOne({ socketId: socket.id });
      if (!user) {
        console.log('[DEBUG] Pas de user trouvé pour socket', socket.id);
        return callback([]);
      }
      const channelsUser = await Channel.find({ users: user._id }, 'name');
      const names = channelsUser.map(c => c.name);
      console.log('[DEBUG] Canaux de', user.username, ':', names);
      callback(names);
    } catch (err) {
      console.error('/mychannels error :', err);
      callback([]);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`Client déconnecté : ${socket.id}`);
    // Libère le pseudo côté mémoire
    delete users[socket.id];
  });

  /////////// Historique des messages privés avec un utilisateur spécifique (/private_history) ////////////
  socket.on('/private_history', async (withUser, callback) => {
    try {
      const me = await User.findOne({ socketId: socket.id });
      const other = await User.findOne({ username: withUser });
      if (!me || !other) return callback([]);
      const messages = await Message.find({
        $or: [
          { author: me._id, recipient: other._id },
          { author: other._id, recipient: me._id }
        ]
      }).sort({ timestamp: 1 }).populate('author', 'username');
      callback(messages.map(m => `${m.author.username} : ${m.content}`));
    } catch (err) {
      callback([]);
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
