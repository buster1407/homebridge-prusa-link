export class Paths {
  static readonly Http = 'http://';
  static readonly StatusPath = '/api/v1/status';
}

export enum PrinterStates {
  IDLE = 'IDLE',
  PRINTING = 'PRINTING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  FINISHED = 'FINISHED',
  OFFLINE = 'OFFLINE' // Custom state
}