import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

import authRoutes from './modules/auth/auth.route';

import vocabularyRoutes from './modules/vocabulary/vocabulary.route';
import topicRoutes from './modules/topic/topic.route';

import deckRoutes from './modules/deck/deck.route';
import srsRoutes from './modules/srs/srs.route';

import translateRoutes from './modules/translate/translate.route';

import dashboardRoutes from './modules/dashboard/dashboard.route';
import libraryRoutes from './modules/library/library.route';

import quizRoutes from './modules/quiz/quiz.route';
import favoriteRoutes from './modules/favorite/favorite.route';

const app: Application = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Docs Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Han Vault API is running smoothly 🚀' });
});

// Auth
app.use('/api/auth', authRoutes);

// Vocabularies & Topics
app.use('/api/vocabularies', vocabularyRoutes);
app.use('/api/topics', topicRoutes);

// Decks & SRS
app.use('/api/decks', deckRoutes);
app.use('/api/srs', srsRoutes);

//Translate
app.use('/api/translate', translateRoutes);

// Dashboard & Library
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/library', libraryRoutes);

// Quizzes & Favorites
app.use('/api/quizzes', quizRoutes);
app.use('/api/favorites', favoriteRoutes);

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('🔥 Global Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ (Internal Server Error)',
  });
});

export default app;