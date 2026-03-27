import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as yaml from 'js-yaml';

const server = express();

export const createNestServer = async (expressInstance: any) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:5173', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Venue Booking System API')
    .setDescription(
      'API documentation for the Venue Booking System - manage locations, venues, bookings, and payments',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI at /api
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Venue Booking API Docs',
  });

  // Serve YAML file at /swagger/yaml
  app.use('/swagger/yaml', (req: any, res: any) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(yaml.dump(document));
  });

  // Serve JSON file at /swagger/json
  app.use('/swagger/json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(document, null, 2));
  });

  await app.init();
};

createNestServer(server);

export default server;
