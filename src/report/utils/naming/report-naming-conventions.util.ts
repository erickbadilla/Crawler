export const generateFullReportFileName = (reportName: string): string =>
  `${reportName}_Report_${new Date().toDateString()}.xlsx`;
