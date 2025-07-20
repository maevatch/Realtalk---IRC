const mongoose = require('mongoose');
require('dotenv').config(); // charge MONGODB_URI

// 🔁 Ajoute ici tes modèles
const User = require('./models/user.js');
const Channel = require('./models/channel.js'); // si tu as un modèle pour les salons
const Message = require('./models/message.js'); // etc.

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 🧼 Supprime tout dans chaque collection
    await Promise.all([
      User.deleteMany({}),
      Channel.deleteMany({}),
      Message.deleteMany({}), // décommente si tu en as un
    ]);

    console.log('🧹 Toutes les collections ont été vidées (documents supprimés)');
  } catch (err) {
    console.error('❌ Erreur MongoDB :', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
})();
