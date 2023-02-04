import excelJS, { AddWorksheetOptions, Worksheet } from 'exceljs';

type TNumberOrString = string | number;

export type TExcelJSConstructor = ConstructorParameters<
  typeof excelJS.stream.xlsx.WorkbookWriter
>[0];

export type TWorkBook = excelJS.stream.xlsx.WorkbookWriter;

export class ExcelJSService {
  private workbook: TWorkBook;

  constructor(options: TExcelJSConstructor) {
    this.workbook = new excelJS.stream.xlsx.WorkbookWriter(options);
  }

  public addSheet(
    sheetName?: string,
    properties?: Partial<AddWorksheetOptions>,
  ): Worksheet {
    return this.workbook.addWorksheet(sheetName, properties);
  }

  public removeSheet(indexOrName: TNumberOrString): void {
    this.workbook.removeWorksheet(indexOrName);
  }

  public getSheet(indexOrName: TNumberOrString): Worksheet {
    return this.workbook.getWorksheet(indexOrName);
  }

  public async close(): Promise<void> {
    await this.workbook.commit();
  }
}
