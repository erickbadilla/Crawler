import { Alignment, Cell, CellValue, Column, Row } from 'exceljs';

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

type TStyleTarget = Cell | Row;

/**
 * @description Factory function for styling.
 */
const createStyler =
  <T extends 'fill' | 'border' | 'font' | 'alignment'>(property: T) =>
  (styles: TStyleTarget[T]) =>
  (target: TStyleTarget): TStyleTarget => {
    const propertyValue = target[property];

    target[property] = {
      ...propertyValue,
      ...styles,
    };

    return target;
  };

export const addFontStylingCell = createStyler('font');

export const addBorderStylingCell = createStyler('border');

export const addFillStylingCell = createStyler('fill');

export const addAlignmentStylingCell = createStyler('alignment');

export const addValueToCell =
  (value: CellValue) =>
  (cell: Cell): Cell => {
    cell.value = value;

    return cell;
  };
