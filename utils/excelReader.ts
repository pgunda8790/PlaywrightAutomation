import * as XLSX from 'xlsx';
import * as path from 'path';

export function readExcelData(fileName: string, sheetName: string) {
  const filePath = path.resolve(__dirname, `../data/${fileName}`);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[sheetName];
  const allData = XLSX.utils.sheet_to_json(sheet) as any[];
  return allData.filter(row => row.execute === 'yes');
}