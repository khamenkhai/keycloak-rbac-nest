import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
  getPublicPayload() {
    return {
      message: 'public',
      serverTime: new Date().toISOString(),
    };
  }

  getAuthenticatedPayload() {
    return {
      message: 'authenticated',
      serverTime: new Date().toISOString(),
    };
  }

  getRoleProtectedPayload() {
    return {
      message: 'role check passed',
      serverTime: new Date().toISOString(),
    };
  }

  getPermissionProtectedPayload() {
    return {
      message: 'permission check passed',
      serverTime: new Date().toISOString(),
    };
  }

  getRoleAndPermissionProtectedPayload() {
    return {
      message: 'all checks passed',
      serverTime: new Date().toISOString(),
    };
  }
}
