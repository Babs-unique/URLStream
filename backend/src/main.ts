import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './utils/utils.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.use(cookieParser(process.env.COOKIE_SECRET));
  const frontendOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim());
   app.enableCors({ origin: frontendOrigins, credentials: true });
   const config = new DocumentBuilder()
    .setTitle('URLStream API')
    .setDescription('Documentation of URLStream API')
    .setVersion('1.0')
    .addTag('urlstream')
    .addCookieAuth('urlstream_auth', { type: 'apiKey', in: 'cookie' }, 'urlstream_auth')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
