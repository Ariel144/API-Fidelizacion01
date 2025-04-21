const User = require ('./models/users');

const customAuth = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca al usuario por correo
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        // Valida la contraseña en texto plano
        if (user.password === password) {
            // Genera un token de sesión
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            return res.status(200).json({ token });
        } else {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error interno', error });
    }
};

module.exports = customAuth;