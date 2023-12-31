import { Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Driver, DriverSchema } from './schema/driver.schema';

@Module({
  controllers: [DriverController],
  providers: [DriverService],
  imports: [
    MongooseModule.forFeature([{ name: Driver.name, schema: DriverSchema }]),
  ],
})
export class DriverModule {}
