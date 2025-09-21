const { UserModel } = require('../db/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const privateKey = fs.readFileSync('./src/auth/jwtRS256.key');
const { handleError } = require('../../helper');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10, 
    message: {
        message: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
        data: null
    }
});     

module.exports = (app) => {
    app.post('/api/login', loginLimiter, async (req, res) => {
        const { username, password } = req.body; // attention ici

        if (!username || !password) { 
            return res.status(400).json({ 
                message: "Le mail et le mot de passe sont requis", 
                data: null 
            });
        }

        try {
            const user = await UserModel.findOne({ where: { username } });
            if (!user) {
                return res.status(401).json({ message: "Utilisateur non trouvé", data: null });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Mot de passe incorrect", data: null });
            }

            const accessToken = jwt.sign(
                { userId: user.id, userName: user.username },
                privateKey, 
                { algorithm: 'RS256', expiresIn: '30m' }
            );

            const refreshToken = jwt.sign(
                { userName: user.username }, 
                privateKey, 
                { algorithm: 'RS256', expiresIn: '7d' }
            );

            const decodedRefreshToken = jwt.decode(refreshToken);
            const refreshTokenExpiry = new Date(decodedRefreshToken.exp * 1000);
                
            user.refreshToken = refreshToken;
            user.refreshTokenExpiry = refreshTokenExpiry;
            await user.save();

            return res.json({ 
                message: "Authentification réussie", 
                data: { userId: user.id, accessToken, refreshToken } 
            });
        } catch (error) {
            const message = 'Erreur lors de l\'authentification';
            return handleError(res, error, message);
        }
    });
};
