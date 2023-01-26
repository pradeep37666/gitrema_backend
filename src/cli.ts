import { NestFactory } from '@nestjs/core';
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    await CommandFactory.run(AppModule);

    // or, if you only want to print Nest's warnings and errors
    await CommandFactory.run(AppModule, ['warn', 'error']);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}
console.log('Test');
bootstrap();
console.log('Test1');
