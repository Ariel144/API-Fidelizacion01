const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
import payload from 'payload';
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

const app = express();


app.use(cors());
app.use(express.json());
app.use('/api/user', userRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB localmente'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Rutas básicas de ejemplo
app.get('/', (req, res) => {
    res.send("API en funcionamiento");
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

module.exports = app; // Exportar la app para Vercel