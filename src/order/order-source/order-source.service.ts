import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from 'src/role/schemas/roles.schema';
import { Model } from 'mongoose';
import { Source } from '../enum/en.enum';
import { MarketPlaceType } from 'src/core/Constants/enum';
@Injectable()
export class OrderSourceService {
    ROLE_NAME = "Feedus"
    constructor(
        @InjectModel(Role.name)
        private roleModel: Model<RoleDocument>, //private cacheService: CacheService,
      ) {}

      async validateOrder(user:any ,body:any){
        let  allowedMarketPlaces = <any>{}
        for (const [key, value] of Object.entries(MarketPlaceType)) {
            allowedMarketPlaces[`${key}`] = value
          }
          // removing app and webiste access from feedus user
          delete allowedMarketPlaces.App
          delete allowedMarketPlaces.Website
                 
        const {source, marketPlaceType} = body
        const role = await this.roleModel.findById(user.roleId).lean();

        
        if (!role) return false;
        if(role.name === this.ROLE_NAME && source === Source.MarketPlace &&  Object.values(allowedMarketPlaces).includes(marketPlaceType) ){
            return false
        }
        return true
    
      }

}
