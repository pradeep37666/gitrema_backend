import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImportDto } from './dto/import.dto';
import { ImportType } from './enum/import.enum';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Import, ImportDocument } from './schemas/import.schema';

import { ImportHelperService } from './import-helper.service';

@Injectable()
export class ImportService {
  constructor(
    @InjectModel(Import.name)
    private readonly importModel: Model<ImportDocument>,
    private importHelperService: ImportHelperService,
  ) {}

  async import(
    req: any,
    dto: ImportDto,
    file: Express.Multer.File,
  ): Promise<any> {
    file = file[0];

    const importObj = await this.importModel.create({
      addedBy: req.user.userId,
    });
    if (!importObj)
      throw new BadRequestException(`Failed to create the import`);
    switch (dto.type) {
      case ImportType.Supplier:
        this.importHelperService.handleSupplierImport(req, file, importObj);
        break;
      case ImportType.Restaurant:
        this.importHelperService.handleRestaurantImport(req, file, importObj);
        break;
      case ImportType.MenuItem:
        this.importHelperService.handleMenuImport(req, file, importObj);
        break;
    }

    return importObj;
  }

  async findOne(importId: string): Promise<ImportDocument> {
    const exists = await this.importModel.findById(importId);
    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }
}
