import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Keycloak Admin API')
    .setDescription('The Keycloak Admin API description')
    .setVersion('1.0')
    .addTag('Keycloak')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/reference',
    apiReference({
      content: document,
      theme: 'purple',
    }),
  );

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Scalar UI running on: http://localhost:3001/reference`);
  console.log(`Swagger UI running on: http://localhost:3001/api`);

}
bootstrap();