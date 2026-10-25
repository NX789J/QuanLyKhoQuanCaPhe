import { Module } from '@nestjs/common';
import { AppDocsController } from './app-docs.controller';

@Module({
  controllers: [AppDocsController],
})
export class AppDocsModule {}