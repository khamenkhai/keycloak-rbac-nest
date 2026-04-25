import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { ExampleModule } from '../src/modules/example/example.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true }),
    ExampleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestAppModule {}
