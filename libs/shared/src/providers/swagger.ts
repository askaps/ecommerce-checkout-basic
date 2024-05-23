import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function SetupSwagger(app: INestApplication, service: string, modules: any[]) {
  const options = new DocumentBuilder()
    .setTitle('Ecommerce Checkout Demo')
    .setDescription('Demonstrate api structure of basic ecommerce cart and checkout')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    include: modules,
    deepScanRoutes: true,
  });

  SwaggerModule.setup(`${service}/api/v1/docs`, app, document);
}
