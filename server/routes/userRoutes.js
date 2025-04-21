const express = require('express');
const router = express.Router();
const User = require('../models/users.js');


router.post('/register', async (req, res) => {
  try {
      const { nombre, apellido, correo, contraseña, telefono } = req.body;

      if (!correo || !contraseña) {
          return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
      }

      const newUser = new User({
          nombre,
          apellido,
          correo,
          telefono,
          contraseña, // Contraseña en texto plano
          puntos: 100, // Ejemplo de campo adicional
          nivel: 1,    // Ejemplo de campo adicional
      });

      await newUser.save();
      res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});
  

// Login de usuario
router.post('/login', async (req, res) => {
  try {
      const { correo, contraseña } = req.body;

      // Buscar al usuario por correo
      const user = await User.findOne({ correo });
      if (!user) {
          return res.status(400).json({ message: 'Correo incorrecto' });
      }

      // Comparar directamente las contraseñas
      if (user.contraseña !== contraseña) {
          return res.status(400).json({ message: 'Contraseña incorrecta' });
      }

      res.json({
          message: 'Inicio de sesión exitoso',
          correo: user.correo,
          userId: user._id,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});

  
// Endpoint para obtener usuarios
router.get('/users', async (req, res) => {
    try {
      const user = await User.find(); // Obtener todos los usuarios
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


// Obtener perfil de usuario
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Editar datos del usuario
router.put('/edit/:id', async (req, res) => {
  try {
      const { nombre, apellido, correo, telefono, contraseña } = req.body;
      const userId = req.params.id;

      const updates = { nombre, apellido, correo, telefono };

      // Si la contraseña fue proporcionada, rehashearla
      if (contraseña) {
          const hashedPassword = await bcrypt.hash(contraseña, 10);
          updates.contraseña = hashedPassword;
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Datos actualizados con éxito", user: updatedUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


// Obtener puntos y nivel de un usuario por su ID
router.get('/point/:id', async (req, res) => {
  try {
      const user = await User.findById(req.params.id, 'puntos nivel');
      if (!user) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ puntos: user.puntos, nivel: user.nivel });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});

// Actualizar puntos y nivel de un usuario
router.put('/points/:id', async (req, res) => {
  try {
      const { puntos, nivel } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          { puntos, nivel },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Puntos actualizados con éxito", user: updatedUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});

// Enviar correo para restablecer contraseña
router.post('/forgot-password', async (req, res) => {
  const { correo } = req.body;

  try {
      // Verifica si el usuario existe
      const user = await User.findOne({ correo });
      if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Genera un token único
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      // URL de restablecimiento
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

      // Enviar correo
      const subject = 'Restablecimiento de contraseña';
      const text = `Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace: ${resetUrl}`;
      const html = `
          <h1>Restablecimiento de contraseña</h1>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <a href="${resetUrl}">Haz clic aquí para restablecer tu contraseña</a>
          <p>Este enlace estará activo durante 1 hora.</p>
      `;

      await sendEmail(correo, subject, text, html);

      res.json({ message: 'Correo enviado para restablecer contraseña.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al enviar el correo.' });
  }
});


// Restablecer contraseña
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { contraseña } = req.body;

  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
          return res.status(400).json({ message: 'Token inválido o expirado' });
      }

      // Guardar la contraseña en texto plano
      user.contraseña = contraseña;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();
      res.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al restablecer la contraseña.' });
  }
});
module.exports = router;