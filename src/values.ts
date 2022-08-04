export class Paths {
  static readonly Http = 'http://';
  static readonly PrinterPath = '/api/printer';
  static readonly JobPath = '/api/job';
}

export enum PrinterStates {
  OPERATIONAL = 'Operational',
  PRINTING = 'Printing',
  PAUSED = 'Paused',
  OFFLINE = 'Offline' // Custom state
}