const express = require('express');
const { FavoriteModel, MonumentModel } = require('../db/sequelize'); // Import correct

module.exports = (app) => {
  const router = express.Router();

  function handleError(res, error, status = 400) {
    res.status(status).json({ error: error.message || error });
  }

  // Ajouter aux favoris
  router.post('/:monumentId', async (req, res) => {
    try {
      const userId = req.user.userId;
      const monumentId = req.params.monumentId;
      const existing = await FavoriteModel.findOne({ where: { userId, monumentId } });
      if (existing) throw new Error('Monument déjà en favori');
      const fav = await FavoriteModel.create({ userId, monumentId });
      res.json(fav);
    } catch (e) {
      handleError(res, e, 400);
    }
  });

  // Supprimer des favoris
  router.delete('/:monumentId', async (req, res) => {
    try {
      const userId = req.user.userId;
      const monumentId = req.params.monumentId;
      await FavoriteModel.destroy({ where: { userId, monumentId } });
      res.sendStatus(204);
    } catch (e) {
      handleError(res, e, 400);
    }
  });

  // Lister les favoris avec inclusion du modèle Monument
  router.get('/', async (req, res) => {
    try {
      const userId = req.user.userId;
      const favs = await FavoriteModel.findAll({
        where: { userId },
        include: [{ model: MonumentModel, as: 'monument' }],
      });
      res.json(favs);
    } catch (e) {
      handleError(res, e, 400);
    }
  });

  app.use('/api/favorites', router);
};
