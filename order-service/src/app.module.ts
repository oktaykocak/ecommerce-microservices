import { Module } from '@nestjs/common';
import { OrderModule } from './orders/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    OrderModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
