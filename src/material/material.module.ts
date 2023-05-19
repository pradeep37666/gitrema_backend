import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Material, MaterialSchema } from './schemas/material.schema';
import {
  RestaurantMaterial,
  RestaurantMaterialSchema,
} from './schemas/restaurant-material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: RestaurantMaterial.name, schema: RestaurantMaterialSchema },
    ]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule {}
