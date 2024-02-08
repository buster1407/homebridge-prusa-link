export class Paths {
  static readonly Http = 'http://';
  static readonly StatusPath = '/api/v1/status';
}

export enum PrinterStates {
  IDLE = 'Idle',
  PRINTING = 'Printing',
  PAUSED = 'Paused',
  STOPPED = 'Stopped',
  FINISHED = 'Finished',
  OFFLINE = 'Offline' // Custom state
}