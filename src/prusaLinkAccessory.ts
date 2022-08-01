import { AccessoryConfig, API, Logger, Service } from 'homebridge';
import fetch from 'node-fetch';
import { Paths, PrinterStates } from './values';

export class PrusaLinkAccessory {

  private readonly baseURL = Paths.Http + this.config.ip;

  private readonly motionSensorService: Service;
  private readonly informationService: Service;

  private lastState: PrinterStates = PrinterStates.OPERATIONAL;

  constructor(
    private readonly log: Logger,
    private readonly config: AccessoryConfig,
    private readonly api: API) {

    this.motionSensorService = new this.api.hap.Service.MotionSensor();

    this.informationService = new this.api.hap.Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(api.hap.Characteristic.Manufacturer, this.config.manufacturer)
      .setCharacteristic(api.hap.Characteristic.Model, this.config.model);

    // Refresh state every 10 seconds
    setInterval(() => {
      this.refreshState();
    }, 10000);
  }

  async refreshState() {
    let motion = false;

    try {
      const response = await fetch(this.baseURL + Paths.JobPath, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apikey,
        },
      });
      const body = await response.json();
      const state = body.state;
      this.log.debug(`${this.config.name} is ${state}`);

      if (this.lastState === PrinterStates.PRINTING && state === PrinterStates.OPERATIONAL) {
        motion = true;
        this.log.info(`${this.config.name} finished printing!`);
      }

      this.lastState = state;

    } catch (e) {
      this.log.debug(`Cannot reach ${this.config.name}`);
    }
    this.motionSensorService.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, motion);
  }

  getServices(): Service[] {
    return [
      this.motionSensorService,
      this.informationService,
    ];
  }
}