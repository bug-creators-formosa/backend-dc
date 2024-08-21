import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    forbidNonWhitelisted: true,
    transform: true
  }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(
    app.get('Reflector'),
    {
      excludePrefixes: ['_'],
    }
  ));

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap();
