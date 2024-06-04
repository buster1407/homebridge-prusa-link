import { AccessoryConfig, API, Logger, Service } from 'homebridge';
import httpClient, { RequestOptions } from 'urllib';
import { Paths, PrinterStates, SensorModes } from './values.js';

export class PrusaLinkAccessory {

  private readonly statusUrl;
  private readonly sensorMode: SensorModes;

  private readonly sensorService: Service;
  private readonly informationService: Service;
  private readonly batteryService: Service;

  constructor(
    private readonly log: Logger,
    private readonly config: AccessoryConfig,
    private readonly api: API) {

    this.statusUrl = Paths.Http + this.config.ip + Paths.StatusPath;

    switch (this.config.sensorMode) {
      case SensorModes.OCCUPANCY:
        this.sensorMode = SensorModes.OCCUPANCY;
        this.sensorService = new this.api.hap.Service.OccupancySensor();
        break;
      case SensorModes.MOTION:
      default:
        this.sensorMode = SensorModes.MOTION;
        this.sensorService = new this.api.hap.Service.MotionSensor();
        break;
    }

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

    this.log.debug(`${this.config.name} is ${state}`);

    switch (this.sensorMode) {
      case SensorModes.OCCUPANCY:
        this.updateOccupancySensor(state);
        break;
      case SensorModes.MOTION:
        this.updateMotionSensor(state);
        break;
    }
    this.updateBatteryLevel(completion);
  }

  private updateMotionSensor(state: PrinterStates) {
    let motion = false;

    if (state === PrinterStates.FINISHED) {
      motion = true;
    }

    this.sensorService.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, motion);
  }

  private updateOccupancySensor(state: PrinterStates) {
    let occupied = false;

    if (state === PrinterStates.PRINTING) {
      occupied = true;
    }

    this.sensorService.updateCharacteristic(this.api.hap.Characteristic.OccupancyDetected, occupied);
  }

  private updateBatteryLevel(completion: number) {
    this.batteryService.updateCharacteristic(this.api.hap.Characteristic.BatteryLevel, completion);

    this.log.debug(`${this.config.name} Progress: ${completion}`);
  }

  public getServices(): Service[] {
    return [
      this.sensorService,
      this.batteryService,
      this.informationService,
    ];
  }
}