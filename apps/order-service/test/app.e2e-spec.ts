import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { OrderServiceModule } from './../src/order-service.module';

describe('OrderServiceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrderServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
});
