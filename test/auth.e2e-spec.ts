import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/sign-up (POST)', async () => {
    const mockUser = {
      username: 'test_user',
      email: 'example@gmail.com',
      password: '123456',
    };

    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(mockUser)
      .expect(400)

    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ ...mockUser, name: mockUser.username })
      .expect(201)
  });
});
