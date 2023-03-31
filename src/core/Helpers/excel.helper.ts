import Excel = require('exceljs');
import {
  REPORT_FIELDS,
  REPORT_HEADER,
} from 'src/reports/constants/reports.constant';

export const DefaultSheetName = 'Data';
export const DefaultPath = '/tmp/data.xlsx';

export const createXlsxFileFromJson = async (
  jsonData: Array<object>,
  header: string,
  sheetName: string = DefaultSheetName,
  pathToWrite: string = DefaultPath,
): Promise<boolean> => {
  if (jsonData.length > 0) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.addRow(REPORT_HEADER[header]);
    worksheet.addRows([
      ...jsonData.map((record) =>
        REPORT_FIELDS[header].map((headerItem) =>
          record[`${headerItem}`] ? record[`${headerItem}`].toString() : '',
        ),
      ),
    ]);
    await workbook.xlsx.writeFile(pathToWrite);
    return true;
  }

  return false;
};
