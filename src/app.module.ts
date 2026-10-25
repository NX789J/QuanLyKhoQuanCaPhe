import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { AppDocsModule } from './modules/app-docs/app-docs.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { BeveragesModule } from './modules/beverages/beverages.module';
import { StockReceiptsModule } from './modules/stock-receipts/stock-receipts.module';
import { StockIssuesModule } from './modules/stock-issues/stock-issues.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getDatabaseConfig(),
    }),
    AppDocsModule,
    AuthModule,
    RolesModule,
    UsersModule,
    CategoriesModule,
    SuppliersModule,
    IngredientsModule,
    BeveragesModule,
    StockReceiptsModule,
    StockIssuesModule,
    AlertsModule,
    ReportsModule,
  ],
})
export class AppModule {}