import Excel = require('exceljs');

export const DefaultPath = '/tmp/data.xlsx';

export const createXlsxFileFromJson = async (
  jsonData: Array<Object>,
  header: Array<String>,
  sheetName: string = 'data',
  pathToWrite: string = DefaultPath,
): Promise<boolean> => {
  if (jsonData.length > 0) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.addRow(header);
    worksheet.addRows([
      ...jsonData.map((record) =>
        header.map((headerItem) => record[`${headerItem}`]),
      ),
    ]);
    await workbook.xlsx.writeFile(pathToWrite);
    return true;
  }

  return false;
};
