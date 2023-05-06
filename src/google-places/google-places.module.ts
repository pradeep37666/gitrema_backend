import { Module } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';
import { GooglePlacesController } from './google-places.controller';
import { HttpCallerModule } from 'src/core/Providers/http-caller/http-caller.module';

@Module({
  imports: [HttpCallerModule],
  controllers: [GooglePlacesController],
  providers: [GooglePlacesService],
})
export class GooglePlacesModule {}
