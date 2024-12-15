import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import type { KyleHomebridgePlatform } from './platform.js';
import { setTimeout } from 'timers/promises';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class RecirculationPump {
  private service: Service;

  private pumpStates = {
    On: false,
    LastRun: Date.now(),
  };

  constructor(
    private readonly platform: KyleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Kyle')
      .setCharacteristic(this.platform.Characteristic.Model, 'Raspberry-Pi-Pico-2-W')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '0001')
      .setCharacteristic(this.platform.Characteristic.ValveType, 'Recirculation Pump');

    this.service = 
      this.accessory.getService(this.platform.Service.Valve) || this.accessory.addService(this.platform.Service.Valve);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.DisplayName);

    // create handlers for required characteristics
    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .onGet(this.active.bind(this))
      .onSet(this.setPumpToOn.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.InUse)
      .onGet(this.inUseGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.ValveType)
      .onGet(this.valveTypeGet.bind(this));

  }

  async setPumpToOn(value: CharacteristicValue) {
    this.platform.log.debug(`Setting pump to ${value}`);

    // Fake reaching out to the pump
    await setTimeout(1000, () => {
      this.pumpStates.On = true;
      this.pumpStates.LastRun = Date.now();
    });

    setTimeout(120000, () => {
      this.pumpStates.On = false;
    });
  }

  async inUseGet(): Promise<CharacteristicValue> {
    this.platform.log.debug('Checking if pump is in use');
    return this.pumpStates.On ? this.platform.Characteristic.InUse.IN_USE : this.platform.Characteristic.InUse.NOT_IN_USE;
  }

  async active(): Promise<CharacteristicValue> {
    this.platform.log.debug('Checking if pump is active');
    return this.pumpStates.On ? this.platform.Characteristic.Active.ACTIVE : this.platform.Characteristic.Active.INACTIVE;
  }

  async valveTypeGet(): Promise<CharacteristicValue> {
    this.platform.log.debug('Getting Valve Type');
    return 'Recirculation Pump';
  }
}
