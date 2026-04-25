import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.MOCK_KEYCLOAK_AUTH = 'true';
    process.env.KEYCLOAK_CLIENT_ID = 'test-client';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/example/auth (GET) -> 401 without token', () => {
    return request(app.getHttpServer()).get('/example/auth').expect(401);
  });

  it('/example/auth (GET) -> 200 with mock token', async () => {
    const res = await request(app.getHttpServer())
      .get('/example/auth')
      .set('Authorization', 'Bearer mock')
      .expect(200);

    expect(res.body?.ok).toBe(true);
    expect(res.body?.data?.user?.preferred_username).toBeDefined();
  });

  it('/example/roles/admin (GET) -> 403 when missing role', () => {
    return request(app.getHttpServer())
      .get('/example/roles/admin')
      .set('Authorization', 'Bearer mock')
      .set('x-mock-realm-roles', 'cashier')
      .expect(403);
  });

  it('/example/roles/admin (GET) -> 200 when role present', async () => {
    const res = await request(app.getHttpServer())
      .get('/example/roles/admin')
      .set('Authorization', 'Bearer mock')
      .set('x-mock-realm-roles', 'admin')
      .expect(200);

    expect(res.body?.ok).toBe(true);
  });

  it('/example/permissions/read (GET) -> 403 when missing permission', () => {
    return request(app.getHttpServer())
      .get('/example/permissions/read')
      .set('Authorization', 'Bearer mock')
      .set('x-mock-client-roles', 'write')
      .expect(403);
  });

  it('/example/permissions/read (GET) -> 200 when permission present', async () => {
    const res = await request(app.getHttpServer())
      .get('/example/permissions/read')
      .set('Authorization', 'Bearer mock')
      .set('x-mock-client-roles', 'read')
      .expect(200);

    expect(res.body?.ok).toBe(true);
  });

  it('/example/roles-and-permissions (GET) -> 200 when both present', async () => {
    const res = await request(app.getHttpServer())
      .get('/example/roles-and-permissions')
      .set('Authorization', 'Bearer mock')
      .set('x-mock-realm-roles', 'manager')
      .set('x-mock-client-roles', 'write')
      .expect(200);

    expect(res.body?.ok).toBe(true);
  });
});
