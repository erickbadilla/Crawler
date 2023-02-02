import { Alignment, Cell, CellValue, Column } from 'exceljs';

export const createColumn = (
  columnWidth: number,
  alignment: Partial<Alignment> = {},
): Partial<Column> => ({
  alignment: {
    wrapText: true,
    horizontal: 'left',
    ...alignment,
  },
  width: columnWidth,
});

/**
 * @description Factory function for styling.
 */
const createStyler =
  <T extends 'fill' | 'border' | 'font'>(property: T) =>
  (styles: Cell[T]) =>
  (cell: Cell): Cell => {
    const propertyValue = cell[property];

    cell[property] = {
      ...propertyValue,
      ...styles,
    };

    return cell;
  };

export const addFontStylingCell = createStyler('font');

export const addBorderStylingCell = createStyler('border');

export const addFillStylingCell = createStyler('fill');

export const addValueToCell =
  (value: CellValue) =>
  (cell: Cell): Cell => {
    cell.value = value;

    return cell;
  };
