import { AddWorksheetOptions, Column } from 'exceljs';
import compose from 'lodash/fp/compose.js';
import { PassThrough } from 'stream';

import { ICheckLinkRedirectsReturn } from '../../crawler/index.js';
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

const createRedirectColumn = (): Partial<Column> => createColumn(25);

const createStatusColumn = (): Partial<Column> =>
  createColumn(10, {
    horizontal: 'center',
    wrapText: true,
  });

const createErrorMessageColumn = (): Partial<Column> =>
  createColumn(20, {
    horizontal: 'left',
    wrapText: true,
  });

const getMaxNumberOfRedirects = (
  redirects: ICheckLinkRedirectsReturn[],
): number =>
  redirects.reduce((maxNumber, linkData) => {
    const redirectsSize = linkData.redirects.length;
    return maxNumber < redirectsSize ? redirectsSize : maxNumber;
  }, 0);

export const createRedirectReportStream = async (
  linksReport: ICheckLinkRedirectsReturn[],
): Promise<{ filename: string; stream: PassThrough }> => {
  const stream = new PassThrough();

  const filename = generateFullReportFileName('Redirect');

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

  const maxNumberOfRedirects = getMaxNumberOfRedirects(linksReport);

  reportSheet.columns = [
    createColumn(60),
    createStatusColumn(),
    createErrorMessageColumn(),
  ];

  //Add columns sizes and configurations & Row header names
  const headerRow = ['Link', 'Status', 'Error Message'];

  for (let index = 0; index < maxNumberOfRedirects; index++) {
    reportSheet.columns.push(
      createRedirectColumn(),
      createStatusColumn(),
      createErrorMessageColumn(),
    );

    headerRow.push('Redirect', 'Status', 'Error Message');
  }

  reportSheet.addRow(headerRow).eachCell(addHeaderStyling);

  const REDIRECT_COLUMN_OFFSET = 3;

  //Add data to rows
  for (let row = 2; row < linksReport.length + 2; row++) {
    const { link, status, redirects, error } = linksReport[row - 2];

    const linkDataRow = reportSheet.getRow(row);

    //Link
    compose(
      addLinkStyling,
      addValueToCell({ text: link, hyperlink: link }),
    )(linkDataRow.getCell(1));

    //Status
    compose(normalFontStyling, addValueToCell(status))(linkDataRow.getCell(2));

    //Error message
    compose(
      normalFontStyling,
      addValueToCell(error?.message),
    )(linkDataRow.getCell(3));

    const redirectColumnEndIndex = redirects.length + REDIRECT_COLUMN_OFFSET;

    if (!redirects.length) {
      continue;
    }

    //Redirects status
    for (
      let column = REDIRECT_COLUMN_OFFSET;
      column <= redirectColumnEndIndex;
      column++
    ) {
      const redirect = redirects[column - REDIRECT_COLUMN_OFFSET];

      //Link cell
      compose(
        addLinkStyling,
        addValueToCell({
          text: redirect.link,
          hyperlink: redirect.link,
        }),
      )(linkDataRow.getCell(column));

      // Status cell
      linkDataRow.getCell(column + 1).value = redirect.status;
    }

    linkDataRow.commit();
  }

  reportSheet.commit();

  await excelService.close();

  return {
    filename,
    stream,
  };
};
