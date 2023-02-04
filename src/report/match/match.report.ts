import { AddWorksheetOptions, Column } from 'exceljs';
import compose from 'lodash/fp/compose.js';
import { PassThrough } from 'stream';

import { IMatchWebPagesReturn } from '../../crawler/index.js';
import {
  addAlignmentStylingCell,
  addFillStylingCell,
  addFontStylingCell,
  addValueToCell,
  createColumn,
} from '../../excel-service/excel.util.js';
import {
  ExcelJSService,
  TExcelJSConstructor,
} from '../../excel-service/index.js';
import { generateFullReportFileName } from '../index.js';

const normalFontStyling = compose(
  addFontStylingCell({
    size: 11,
  }),
  addAlignmentStylingCell({ wrapText: true, horizontal: 'left' }),
);

const addHeaderStyling = compose(
  addFontStylingCell({
    bold: true,
    size: 16,
    color: {
      argb: '000',
    },
  }),
  addFillStylingCell({
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
      argb: 'd3d3d3',
    },
  }),
  normalFontStyling,
);

const addLinkStyling = compose(
  addFontStylingCell({ underline: true, color: { argb: 'FF0000FF' } }),
  normalFontStyling,
);

const createMatchedColumn = (): Partial<Column> =>
  createColumn(15, {
    horizontal: 'center',
    wrapText: true,
  });

const createErrorMessageColumn = (): Partial<Column> =>
  createColumn(20, {
    horizontal: 'left',
    wrapText: true,
  });

export const createMatchReport = async (
  linksReport: IMatchWebPagesReturn[],
): Promise<{ filename: string; stream: PassThrough }> => {
  const stream = new PassThrough();

  const filename = generateFullReportFileName('Match');

  const EXCEL_SERVICE_OPTIONS: TExcelJSConstructor = {
    filename,
    stream,
    useSharedStrings: true,
    useStyles: true,
  };

  const SHEET_CONFIG: Partial<AddWorksheetOptions> = {
    pageSetup: {
      orientation: 'landscape',
    },
  };

  const excelService = new ExcelJSService(EXCEL_SERVICE_OPTIONS);

  const reportSheet = excelService.addSheet('Report', SHEET_CONFIG);

  reportSheet.columns = [
    createColumn(60),
    createMatchedColumn(),
    createErrorMessageColumn(),
  ];

  //Add columns sizes and configurations & Row header names
  const headerRow = ['Link', 'Matched', 'Error Message'];

  reportSheet.addRow(headerRow).eachCell(addHeaderStyling);

  //Add data to rows
  for (let row = 2; row < linksReport.length + 2; row++) {
    const { link, isMatched, error } = linksReport[row - 2];

    const linkDataRow = reportSheet.getRow(row);

    //Link
    compose(
      addLinkStyling,
      addValueToCell({ text: link, hyperlink: link }),
    )(linkDataRow.getCell(1));

    //Is Matched
    compose(
      normalFontStyling,
      addValueToCell(isMatched),
    )(linkDataRow.getCell(2));

    //Error message
    compose(
      normalFontStyling,
      addValueToCell(error?.message),
    )(linkDataRow.getCell(3));
  }

  reportSheet.commit();

  await excelService.close();

  return {
    filename,
    stream,
  };
};
