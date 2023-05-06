import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';
import { CreateGooglePlaceDto } from './dto/create-google-place.dto';
import { UpdateGooglePlaceDto } from './dto/update-google-place.dto';
import { ApiTags } from '@nestjs/swagger';
import { QueryGooglePlaceDto } from './dto/query-google-place.dto';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('google-places')
@ApiTags('Google Places')
@Public()
export class GooglePlacesController {
  constructor(private readonly googlePlacesService: GooglePlacesService) {}

  @Get('search')
  search(@Query() query: QueryGooglePlaceDto) {
    //return this.googlePlacesService.search(query);
    return this.googlePlacesService.fetchByOutscraper();
  }

  // @Post()
  // create(@Body() createGooglePlaceDto: CreateGooglePlaceDto) {
  //   return this.googlePlacesService.create(createGooglePlaceDto);
  // }

  // @Get()
  // findAll() {
  //   return this.googlePlacesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.googlePlacesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateGooglePlaceDto: UpdateGooglePlaceDto) {
  //   return this.googlePlacesService.update(+id, updateGooglePlaceDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.googlePlacesService.remove(+id);
  // }
}
