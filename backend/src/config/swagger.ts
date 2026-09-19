import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { env } from './env';

const routesPath = path.join(__dirname, '../modules/**/*.route.{ts,js}').replace(/\\/g, '/');
const controllersPath = path.join(__dirname, '../modules/**/*.controller.{ts,js}').replace(/\\/g, '/');

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hanzy API Documentation',
      version: '1.0.0',
      description: 'Tài liệu API cho hệ thống Website Ôn từ vựng tiếng Trung (theo HSK)',
      contact: {
        name: 'ldmpq',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập Access Token vào đây (định dạng: Bearer <token>)',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [routesPath, controllersPath],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

const totalPaths = Object.keys((swaggerSpec as any).paths || {}).length;
console.log(`🔎 Swagger tìm thấy: ${totalPaths} endpoints! (Path: ${routesPath})`);