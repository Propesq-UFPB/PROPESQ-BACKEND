import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map(origin => origin.trim())
    .filter(Boolean) ?? ['http://localhost:3100', 'http://127.0.0.1:3100'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('PROPESQ Backend API')
    .setDescription(
      'API do PROPESQ para gestão de autenticação, usuários, projetos de pesquisa, unidades acadêmicas e planos de trabalho.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Informe o token no formato: Bearer <seu_token_jwt>. Utilize o token obtido no endpoint de autenticação.',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();

  const options = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.GRUVBOX),
    customSiteTitle: 'Documentacao API - PROPESQ',
  };

  SwaggerModule.setup('api', app, document, options);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}

bootstrap();
