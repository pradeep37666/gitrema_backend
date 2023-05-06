import { Injectable } from '@nestjs/common';
import { CreateGooglePlaceDto } from './dto/create-google-place.dto';
import { UpdateGooglePlaceDto } from './dto/update-google-place.dto';
import { QueryGooglePlaceDto } from './dto/query-google-place.dto';
import { Client } from '@googlemaps/google-maps-services-js';
import * as Outscraper from 'outscraper';

@Injectable()
export class GooglePlacesService {
  constructor() {}
  async search(query: QueryGooglePlaceDto) {
    const client = new Client({});
    const r = await client.placeDetails({
      params: {
        place_id: 'ChIJRWGKgAfbwxUR4gwyeX-gq-8',
        key: 'AIzaSyAuV-Z9urkPx4kdNVCJ0g8KcqVxb1AWDFg',
      },
    });
    console.log(JSON.stringify(r.data.result));
    return;
    console.log({
      location: {
        lat: query.latitude,
        lng: query.longitude,
      },
      type: 'restaurant',
      key: 'AIzaSyAuV-Z9urkPx4kdNVCJ0g8KcqVxb1AWDFg',
      // radius: query.radius ?? 50,
    });
    client
      .placesNearby({
        params: {
          location: {
            lat: query.latitude,
            lng: query.longitude,
          },
          type: 'restaurant',
          key: 'AIzaSyAuV-Z9urkPx4kdNVCJ0g8KcqVxb1AWDFg',
          radius: query.radius ?? 50,
        },
      })
      .then(async (r) => {
        const results = r.data.results;
        console.log(results);
        if (results.length > 0) {
          const place = results[0];
          const r = await client.placeDetails({
            params: {
              place_id: place.place_id,
              key: 'AIzaSyAuV-Z9urkPx4kdNVCJ0g8KcqVxb1AWDFg',
            },
          });
          console.log(JSON.stringify(r.data.result));
          // .then((r) => {
          //   console.log(JSON.stringify(r.data.result));
          // });
        }
        // for (const i in results) {
        //   // this.suiteCrmService.createDeal({
        //   //   data: {
        //   //     type: 'Deal',
        //   //     attributes: {
        //   //       name: results[i].name,
        //   //       primary_address_street: results[i].formatted_address,
        //   //       // first_name: 'Ahmed',
        //   //       // last_name: '',
        //   //       // full_name: 'Ahmed',
        //   //       // title: 'Mr',
        //   //       // photo: '',
        //   //       // department: 'ABC',
        //   //       // do_not_call: '0',
        //   //       // phone_home: '1234567890',
        //   //       // email: 'ahmed@gmail.com',
        //   //       // phone_mobile: '',
        //   //       // phone_work: '',
        //   //       // phone_other: '',
        //   //       // phone_fax: '',
        //   //       // email1: 'ahmed@gmail.com',
        //   //       // email2: '',
        //   //     },
        //   //   },
        //   // });

        // }
        // console.log(r.data.results);
      })
      .catch((e) => {
        console.log(e.response.data.error_message);
      });
  }
  async fetchByOutscraper() {
    const client = new Outscraper(
      'YXV0aDB8NjQ0OTZmMzE1YTU5OTMwYWE2ZDBjYjVlfDA1ZGNlOGY1YTE',
    );
    client.googleMapsSearch(['restaurants']).then((response) => {
      console.log(response);
    });
  }
  // create(createGooglePlaceDto: CreateGooglePlaceDto) {
  //   return 'This action adds a new googlePlace';
  // }
  // findAll() {
  //   return `This action returns all googlePlaces`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} googlePlace`;
  // }
  // update(id: number, updateGooglePlaceDto: UpdateGooglePlaceDto) {
  //   return `This action updates a #${id} googlePlace`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} googlePlace`;
  // }
}
