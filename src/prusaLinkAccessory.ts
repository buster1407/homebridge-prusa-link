import { AccessoryConfig, API, Logger, Service } from 'homebridge';
import httpClient, { RequestOptions } from 'urllib';
import { Paths, PrinterStates } from './values';

export class PrusaLinkAccessory {

  private readonly statusUrl = Paths.Http + this.config.ip + Paths.StatusPath;

  private readonly motionSensorService: Service;
  private readonly informationService: Service;
  private readonly batteryService: Service;

  constructor(
    private readonly log: Logger,
    private readonly config: AccessoryConfig,
    private readonly api: API) {

    this.motionSensorService = new this.api.hap.Service.MotionSensor();

    this.batteryService = new this.api.hap.Service.Battery();

    this.informationService = new this.api.hap.Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(api.hap.Characteristic.Manufacturer, this.config.manufacturer)
      .setCharacteristic(api.hap.Characteristic.SerialNumber, this.config.serialnumber)
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
      const options: RequestOptions = {
        digestAuth: `${this.config.user}:${this.config.password}`,
      };
      const response = await httpClient.request(this.statusUrl, options);
      const body = JSON.parse(response.data);
      state = body.printer.state;
      completion = body.job?.progress ?? 100;
    } catch (e) {
      // do nothing -> standard values will be set
    }

    this.updateMotionDetected(state);
    this.updateBatteryLevel(completion);
  }

  private updateMotionDetected(state: PrinterStates) {
    let motion = false;

    if (state === PrinterStates.FINISHED) {
      motion = true;
    }

    this.motionSensorService.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, motion);

    this.log.debug(`${this.config.name} is ${state}`);
  }

  private updateBatteryLevel(completion: number) {
    this.batteryService.updateCharacteristic(this.api.hap.Characteristic.BatteryLevel, completion);

    this.log.debug(`${this.config.name} Progress: ${completion}`);
  }

  public getServices(): Service[] {
    return [
      this.motionSensorService,
      this.batteryService,
      this.informationService,
    ];
  }
}