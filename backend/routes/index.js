import express from 'express';
import swaggerUI from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

import swaggerDoc from '../docs/openapi.json' with {type: 'json'};
import rentalRoutes from './rentals.js';
import authenticationRoutes from './authentication.js';
import ratingsRoutes from './ratings.js';
import postcodeAPIRoutes from './postcodeAPI.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, '../../frontend/dist');


router.use('/rentals', rentalRoutes);
router.use('/user', authenticationRoutes);
router.use('/ratings', ratingsRoutes);
router.use('/postcodeAPI', postcodeAPIRoutes);

router.use('/docs', swaggerUI.serve);
router.get('/docs', swaggerUI.setup(swaggerDoc));

router.use(express.static(buildPath));

const validFrontEndPages = ['/', '/rental-search', '/login', '/rated-properties']
validFrontEndPages.forEach(page => {
  router.get(page, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
})


// Return error if no valid path specified
router.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Page not found!'});
})

export default router;