import { AccessoryConfig, API, Logger, Service } from 'homebridge';
import fetch from 'node-fetch';
import { Paths, PrinterStates } from './values';

export class PrusaLinkAccessory {

  private readonly baseURL = Paths.Http + this.config.ip;

  private readonly motionSensorService: Service;
  private readonly informationService: Service;
  private readonly batteryService: Service;

  private lastState: PrinterStates = PrinterStates.OFFLINE;

  constructor(
    private readonly log: Logger,
    private readonly config: AccessoryConfig,
    private readonly api: API) {

    this.motionSensorService = new this.api.hap.Service.MotionSensor();

    this.batteryService = new this.api.hap.Service.Battery();

    this.informationService = new this.api.hap.Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(api.hap.Characteristic.Manufacturer, this.config.manufacturer)
      .setCharacteristic(api.hap.Characteristic.Model, this.config.model);

    // Refresh state every 10 seconds
    setInterval(() => {
      this.refreshState();
    }, 10000);
  }

  private async refreshState() {
    let state = PrinterStates.OFFLINE;
    let completion = 1;

    try {
      const response = await fetch(this.baseURL + Paths.JobPath, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apikey,
        },
      });
      const body = await response.json();
      state = body.state;
      completion = body.progress?.completion ?? 1;

    } catch (e) {
      // do nothing -> standard values will be set
    }

    this.updateMotionDetected(state);
    this.updateBatteryLevel(completion);
  }

  private updateMotionDetected(state: PrinterStates) {
    let motion = false;

    if(this.lastState === PrinterStates.PRINTING && state === PrinterStates.OPERATIONAL) {
      motion = true;
      this.log.info(`${this.config.name} finished printing!`);
    }

    this.lastState = state;
    this.motionSensorService.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, motion);

    this.log.debug(`${this.config.name} is ${state}`);
  }

  private updateBatteryLevel(completion: number) {
    const completionInPercent = Math.round(completion * 100);
    this.batteryService.updateCharacteristic(this.api.hap.Characteristic.BatteryLevel, completionInPercent);

    this.log.debug(`${this.config.name} Progress: ${completionInPercent}`);
  }

  public getServices(): Service[] {
    return [
      this.motionSensorService,
      this.batteryService,
      this.informationService,
    ];
  }
}