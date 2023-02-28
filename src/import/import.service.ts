import { Injectable } from '@nestjs/common';
import { ImportDto } from './dto/import.dto';
import { ImportType } from './enum/import.enum';
import Excel = require('exceljs');

@Injectable()
export class ImportService {
  async import(
    req: any,
    dto: ImportDto,
    file: Express.Multer.File,
  ): Promise<any> {
    console.log(dto);
    switch (dto.type) {
      case ImportType.Supplier:
        console.log(dto);
        await this.handleSupplierImport(file);
        break;
    }
    return;
  }

  async handleSupplierImport(file) {
    if (file.length > 0) {
      file = file[0];
    }
    console.log(file);
    const extension = file.path.split('.').pop();
    const workBook = new Excel.Workbook();
    let worksheet = null;
    if (['xlsx', 'xls'].includes(extension.toLowerCase())) {
      await workBook.xlsx.readFile(file.path);
      worksheet = await workBook.getWorksheet(1);
    } else {
      const worksheet = await workBook.csv.readFile(file.path);
    }
    console.log(extension, worksheet.rowCount);
    for (let i = 1; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i).getCell(`A`).value;

      console.log(row);
    }
  }
}
