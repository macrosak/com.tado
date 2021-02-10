/* eslint-disable no-tabs */

'use strict';

const Homey = require('homey');
const tadoSub = require('./tadoAdditional');
const TadoDevice = require('../../lib/TadoDevice');

class TadoDeviceThermostat extends TadoDevice {

  onOAuth2Init() {
    super.onOAuth2Init();

    this.registerCapabilityListener('target_temperature', this._onCapabilityTargetTemperature.bind(this));
    this.registerCapabilityListener('target_onoff', this._onCapabilityTargetOnOff.bind(this));
    // this.registerCapabilityListener('tado_smart', this._onCapabilityTadoAuto.bind(this));

    this._flowTriggerTargetOnOff = new Homey.FlowCardTriggerDevice('target_onoff').register();
    this._flowTriggerHumidity = new Homey.FlowCardTriggerDevice('humidity').register();
    this._flowTriggerHeatingPower = new Homey.FlowCardTriggerDevice('heating_power').register();
    this._flowTriggerOpenWindow = new Homey.FlowCardTriggerDevice('detect_open_window').register();

    this._flowTriggerACModeChange = new Homey.FlowCardTriggerDevice('ac_mode_changed');
    this._flowTriggerACModeChange.register()
      .registerRunListener((args, state) => {
        const modeTranslated = Homey.__(args.current_mode.mode);
        return Promise.resolve(modeTranslated === state.mode);
      })
      .getArgument('current_mode')
      .registerAutocompleteListener((query, args) => {
        return Promise.resolve(tadoSub.getAutocompleteAircoMode(args));
      });

    this._flowTriggerSmartHeating = new Homey.FlowCardTriggerDevice('smart_heating').register();
    this._flowTriggerBatteryChange = new Homey.FlowCardTriggerDevice('battery_state_changed').register();
    this._flowTriggerOutsideTemperature = new Homey.FlowCardTriggerDevice('outside_temperature').register();
    this._flowTriggerSolarIntensity = new Homey.FlowCardTriggerDevice('solar_intensity').register();

    this._flowTriggerWeather = new Homey.FlowCardTriggerDevice('weather');
    this._flowTriggerWeather.register()
      .registerRunListener((args, state) => {
        return Promise.resolve(args.weather_selection.id === state.weather_id);
      })
      .getArgument('weather_selection')
      .registerAutocompleteListener((query, args) => {
        return Promise.resolve(tadoSub.getAutocompleteWeatherCondition(args));
      });

    if (this.hasCapability('operation_mode')) {
      this.registerCapabilityListener('operation_mode', this.onCapabilityOperationMode.bind(this));
    }
  }

  triggerFlowTargetOnOff(device, tokens) {
    this._flowTriggerTargetOnOff.trigger(device, tokens).catch(this.error);
  }

  triggerFlowHumidity(device, tokens) {
    this._flowTriggerHumidity.trigger(device, tokens).catch(this.error);
  }

  triggerFlowHeatingPower(device, tokens) {
    this._flowTriggerHeatingPower.trigger(device, tokens).catch(this.error);
  }

  triggerFlowOpenWindow(device, tokens) {
    this._flowTriggerOpenWindow.trigger(device, tokens).catch(this.error);
  }

  triggerFlowACModeChange(device, tokens, state) {
    this._flowTriggerACModeChange.trigger(device, tokens, state).catch(this.error);
  }

  triggerFlowSmartHeating(device, tokens) {
    this._flowTriggerSmartHeating.trigger(device, tokens).catch(this.error);
  }

  triggerFlowOutsideTemperature(device, tokens) {
    this._flowTriggerOutsideTemperature.trigger(device, tokens).catch(this.error);
  }

  triggerFlowSolarIntensity(device, tokens) {
    this._flowTriggerSolarIntensity.trigger(device, tokens).catch(this.error);
  }

  triggerFlowWeather(device, tokens, state) {
    this._flowTriggerWeather.trigger(device, tokens, state).catch(this.error);
  }

  triggerFlowBatteryChange(device, tokens) {
    this._flowTriggerBatteryChange.trigger(device, tokens).catch(this.error);
  }

  _onState(state) {
    // get first time poll info before polling with longer intervals
    if (this.hasCapability('battery_state')) {
      if (this.getCapabilityValue('battery_state') == undefined) {
        this.getZonesInfo()
          .catch(this.error);
      }
    }

    if (this.hasCapability('measure_temperature') && state.sensorDataPoints.insideTemperature) {
      var value = Math.round(10 * state.sensorDataPoints.insideTemperature.celsius) / 10;
      if (this.getCapabilityValue('measure_temperature') !== value && value !== undefined) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: insideTemperature changed to: ${value}`);
        this.setCapabilityValue('measure_temperature', value).catch(this.error);
      }
    }

    if (this.hasCapability('measure_humidity') && state.sensorDataPoints.humidity) {
      var value = Math.round(state.sensorDataPoints.humidity.percentage);
      if (this.getCapabilityValue('measure_humidity') !== value && value !== undefined) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: humidity changed to: ${value}`);
        this.triggerFlowHumidity(this, { percentage: value });
        this.setCapabilityValue('measure_humidity', value).catch(this.error);
      }
    }

    if (this.hasCapability('heating_power') && state.activityDataPoints.heatingPower) {
      var value = Math.round(state.activityDataPoints.heatingPower.percentage);
      if (this.getCapabilityValue('heating_power') !== value && value !== undefined) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: heatingPower changed to: ${value}`);
        this.triggerFlowHeatingPower(this, { percentage: value });
        this.setCapabilityValue('heating_power', value).catch(this.error);
      }
    }

    if (this.hasCapability('detect_open_window')) {
      var value = (state.openWindow !== null);
      if (this.getCapabilityValue('detect_open_window') !== value && value !== undefined) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: openWindow changed to: ${value}`);
        this.triggerFlowOpenWindow(this, { detection: value });
        this.setCapabilityValue('detect_open_window', value).catch(this.error);
      }
    }

    if (this.hasCapability('smart_heating')) {
      var value = (state.overlayType !== 'MANUAL');
      if (this.getCapabilityValue('smart_heating') !== value && value !== undefined) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: Smart Schedule changed to: ${value}`);
        this.triggerFlowSmartHeating(this, { detection: value });
        this.setCapabilityValue('smart_heating', value).catch(this.error);
      }
    }

    if (state.overlay !== null && typeof state.overlay.termination.type === 'string' && this.hasCapability('operation_mode')) {
      if (state.setting.power === 'ON') {
        this.setCapabilityValue('operation_mode', state.overlay.termination.type).catch(this.error);
      } else {
        this.setCapabilityValue('operation_mode', 'OFF').catch(this.error);
      }
    }

    if (this.hasCapability('airco_mode')) {
      var value = state.setting.power;
      if (value == 'ON') {
        value = state.setting.mode;
      }
      value = value.substr(0, 1).toUpperCase() + value.substr(1).toLowerCase();
      value = Homey.__(value);
      if (state.overlay !== null) {
        const overlayType = state.overlay.termination.type;
        switch (overlayType) {
          case 'MANUAL':
            value = `${value} (${Homey.__('manual')})`;
            break;

          case 'TIMER':
            var overlayTime = Math.round(Number(state.overlay.termination.remainingTimeInSeconds) / 5) * 5;
            var tH = Math.floor(overlayTime / 3600);
            var tM = Math.floor((overlayTime - tH * 3600) / 60);
            var tS = Math.floor(overlayTime - tH * 3600 - tM * 60);
            if (tM < 10) {
              tM = `0${tM}`;
            }
            if (tS < 10) {
              tS = `0${tS}`;
            }
            value = `${value} ${tH}:${tM}:${tS}`;
            break;

          case 'TADO_MODE':
            value = `${value} ${Homey.__('until_schedule')}`;
            break;

		  default:
			// Do nothing.
        }
      }

      if (this.getCapabilityValue('airco_mode') !== value && value !== undefined) {
        let valCap = this.getCapabilityValue('airco_mode');
        if (valCap === null) {
          valCap = '-';
        }
        let spacePos = value.indexOf(' ');
        if (spacePos == -1) {
          spacePos = value.length;
        }
        const acMode = value.substr(0, spacePos);
        if (valCap.substr(0, spacePos) != acMode) {
          tadoSub.doLog(`Flow trigger for ${this.getName()}: mode changed to: ${value.substr(0, spacePos)}`);
          this.triggerFlowACModeChange(this, {}, { mode: acMode });
        }
        this.setCapabilityValue('airco_mode', value).catch(this.error);
      }
    }

    if (this.hasCapability('target_onoff')) {
      var value = (state.setting.power == 'ON');
      if (this.getCapabilityValue('target_onoff') !== value) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}:target_onoff changed to: ${value}`);
        this.triggerFlowTargetOnOff(this, { is_on: value });
        this.setCapabilityValue('target_onoff', value).catch(this.error);
      }
    }

    if (this.hasCapability('target_temperature')) {
      var value = this.getCapabilityValue('target_temperature');

      if (state.setting.power == 'OFF') { // set to OFF
        switch (state.setting.type) {
          case 'HEATING': value = 5; break;
          case 'HOT_WATER': value = 30; break;
        }
      } else { // set to temperature
        value = Math.round(10 * state.setting.temperature.celsius) / 10;
      }

      if (this.getCapabilityValue('target_temperature') !== value) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: target_temperature changed to: ${value}`);
        this.setCapabilityValue('target_temperature', value).catch(this.error);
      }
    }
  }

  _onWeather(state) {
    if (this.hasCapability('measure_temperature.outside') && state.outsideTemperature) {
      const value = Number(state.outsideTemperature.celsius);
      if (this.getCapabilityValue('measure_temperature.outside') !== value) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: outsideTemperature changed to: ${value}`);
        this.triggerFlowOutsideTemperature(this, { temperature: value });
        this.setCapabilityValue('measure_temperature.outside', value).catch(this.error);
      }
    }

    if (this.hasCapability('solar_intensity') && state.solarIntensity) {
      const value = Number(state.solarIntensity.percentage);
      if (this.getCapabilityValue('solar_intensity') !== value) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: solarIntensity changed to: ${value}`);
        this.triggerFlowSolarIntensity(this, { intensity: value });
        this.setCapabilityValue('solar_intensity', value).catch(this.error);
      }
    }

    if (this.hasCapability('weather_state') && state.weatherState) {
      const value = (state.weatherState.value).toLowerCase();
      let conditionExist = false;
      const weatherConditionsList = tadoSub.getWeatherConditions();

	    weatherConditionsList.forEach(item => {
        if (value === item) {
          conditionExist = true;
        }
	    });
      if (conditionExist) {
        var valueTranslated = Homey.__(value);
      } else {
        tadoSub.doLog(`new weather condition found: ${value}`);
        var valueTranslated = value.replace(/_/g, ' ');
        valueTranslated = valueTranslated.substr(0, 1).toUpperCase() + valueTranslated.substr(1);
      }

      if (this.getCapabilityValue('weather_state') != valueTranslated) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: weatherState changed to: ${value} (${valueTranslated})`);
        this.triggerFlowWeather(this, {}, { weather_id: value });
        this.setCapabilityValue('weather_state', valueTranslated).catch(this.error);
      }
    }
  }

  _onZoneControl(state) {
    if (this._type == 'AIR_CONDITIONING') {
      // get hysteresis and minOnOffTimeInSeconds for AIR_CONDITIONING on/off behavior
      if (state.hysteresis) { // from getZoneControl(homeId, zoneId, 'drivers' )
        this.setStoreValue('hysteresis', state.hysteresis.celsius, (err, store) => {
          if (err) {
            console.error(err);
          }
        });
        this.setStoreValue('minOnOffTimeInSeconds', state.minOnOffTimeInSeconds, (err, store) => {
          if (err) {
            console.error(err);
          }
        });
      }
    }
  }

  _onZonesInfo(state) { // check battery state
    if (this.hasCapability('battery_state')) {
      const thisZone = this;
      let txtBat = ''; // Final mobile capability info
      let statusTherm = ''; let statusValve = ''; // mobile capability info for Thermostat / Valves
      let tokenStateOk = true; // for token 'OK'
      let tokenOkSerial = ''; // for token 'OK'
      let tokenNotOkSerial = ''; // for token 'Not OK'

      state.forEach((zone, indexZone) => {
        if (zone.id === thisZone._zoneId) {
          const statusBattery = {}; // collect device types + batt state. { RU: NORMAL/LOW, VA: NORMAL/LOW }, VA = LOW when one valve (of multiple) is low.
          const battNotNormal = []; // collect zone devices with batt not NORMAL { serial: dev.serialNo, batt: dev.batteryState }
          let withBattery = 0; // count battery powered zone devices

          txtBat = ''; statusTherm = ''; statusValve = '';
          tokenOkSerial = ''; tokenNotOkSerial = '', tokenStateOk = true;
          zone.devices.forEach((dev, indexDev) => {
            const tadoTypeId = (dev.serialNo).substr(0, 2);
            if (dev.batteryState !== undefined) {
              withBattery++;
              if (statusBattery[tadoTypeId] === undefined) {
                statusBattery[tadoTypeId] = 'NORMAL';
              }
              if (dev.batteryState !== 'NORMAL') {
                battNotNormal.push({ serial: dev.serialNo, batt: dev.batteryState });
                statusBattery[tadoTypeId] = dev.batteryState;
                if (tokenNotOkSerial !== '') {
                  tokenNotOkSerial += ', ';
                }
                tokenNotOkSerial += dev.serialNo;
                tokenStateOk = false;
              } else {
                if (tokenOkSerial != '') {
                  tokenOkSerial += ', ';
                }
                tokenOkSerial += dev.serialNo;
              }
            }
          });

          let txtComma = tokenOkSerial.lastIndexOf(',');
          if (txtComma > 0) {
            tokenOkSerial = `${tokenOkSerial.substr(0, txtComma)} ${Homey.__('and')}${tokenOkSerial.substr(txtComma + 1)}`;
          }
          txtComma = tokenNotOkSerial.lastIndexOf(',');
          if (txtComma > 0) {
            tokenNotOkSerial = `${tokenNotOkSerial.substr(0, txtComma)} ${Homey.__('and')}${tokenNotOkSerial.substr(txtComma + 1)}`;
          }

          // compile sensor text info ( statusTherm / statusValve --> txtBat)
          if (statusBattery.RU !== undefined) {
            if (statusBattery.RU === 'NORMAL') {
              statusTherm = 'OK';
            } else {
              statusTherm = statusBattery.RU;
            }
          }

          if (statusBattery.VA !== undefined) {
            if (statusBattery.VA === 'NORMAL') {
              statusValve = 'OK';
            } else {
              statusValve = statusBattery.VA;
            }
          }

          if (statusTherm !== '' && statusTherm !== 'OK') { // TEXT -> Text
            statusTherm = statusTherm.substr(0, 1).toUpperCase() + statusTherm.substr(1).toLowerCase();
          }
          if (statusValve !== '' && statusValve !== 'OK') { // TEXT -> Text
            statusValve = statusValve.substr(0, 1).toUpperCase() + statusValve.substr(1).toLowerCase();
          }

          let txt1 = ''; let
            txt2 = '';
          if (statusTherm !== '') { // thermostat in zone
            if (statusValve !== '') { // also valve(s) in zone
              if (statusValve === 'OK') { // valve(s) batt is NORMAL
                txt1 = `${Homey.__('Thermostat')}: ${statusTherm}`;
              } else { // valve(s) batt not NORMAL
                txt1 = `${Homey.__('Therm')}:${statusTherm}`;
              }
            } else { // no valve(s) in zone
              txt1 = statusTherm;
            }
          }

          let valveTranslate = 'Valve';
          if (statusValve !== '') { // valve(s) in zone
            if (statusTherm !== '') { // also thermostat in zone
              if (statusTherm === 'OK') { // thermostat batt is NORMAL
                if (battNotNormal.length > 1) {
                  valveTranslate = 'Valves';
                }
                txt2 = `${Homey.__(valveTranslate)}: ${statusValve}`;
              } else { // thermostat batt not NORMAL
                if (battNotNormal.length > 2) {
                  valveTranslate = 'Valves';
                }
                txt2 = `${Homey.__(valveTranslate)}:${statusValve}`;
              }
            } else { // no thermostat in zone
              if (withBattery > 1 && battNotNormal.length === 1) { // multiple valves, one batt not NORMAL
                txt2 = `1${Homey.__('Valve')}: ${statusValve}`;
              } else if ((withBattery === 2 && battNotNormal.length === 2) || (withBattery === 2 && battNotNormal.length === 0)) { // two valves, both batt same value
                txt2 = `${Homey.__('Both')} ${statusValve}`;
              } else if ((withBattery > 2 && battNotNormal.length === withBattery) || (withBattery > 2 && battNotNormal.length === 0)) { // multiple valves, all batt same value
                txt2 = `${Homey.__('All')} ${statusValve}`;
              } else if (withBattery > 2 && battNotNormal.length < withBattery) { // multiple valves, multiple batt not NORMAL
                txt2 = `${battNotNormal.length} ${Homey.__('Valves')} ${statusValve}`;
              } else { // single valve
                txt2 = statusValve;
              }
            }
          }

          if (statusTherm === 'OK' && statusValve !== 'OK' && statusValve !== '') { // thermostat + valve(s), valve(s) not NORMAL
            txtBat = txt2;
          } else if (statusTherm !== 'OK' && statusTherm !== '' && statusValve === 'OK') { // thermostat + valve(s), thermostat not NORMAL
            txtBat = txt1;
          } else if (statusTherm === statusValve && statusTherm !== '') { // thermostat + valve(s), both have equal value
            if (withBattery === 2) { // 2 battery powered devices
              txtBat = `${Homey.__('Both')} ${statusTherm}`;
            } else { // more than 2 battery powered devices
              txtBat = `${Homey.__('All')} ${statusTherm}`;
            }
          } else { // thermostat and/or valve(s), and different/no value
            txtBat = txt1;
            if (statusValve !== '' && statusTherm !== '') {
              txtBat += ', ';
            }
            txtBat += txt2;
          }
        }
      });

      if (this.getCapabilityValue('battery_state') !== txtBat) {
        tadoSub.doLog(`Flow trigger for ${this.getName()}: battery changed to: ${txtBat}, Not Ok: ${tokenNotOkSerial}`);
        this.triggerFlowBatteryChange(this, { state: tokenStateOk, isOk: tokenOkSerial, isNotOk: tokenNotOkSerial });
        this.setCapabilityValue('battery_state', txtBat).catch(this.error);
      }
    }
  }

  _onBatteryBlink() {
    if (this.hasCapability('measure_battery') && this.hasCapability('battery_state')) {
      if (this.getCapabilityValue('battery_state') !== null) {
        let valueBatt = this.getCapabilityValue('measure_battery');
        if (this.getCapabilityValue('battery_state').toLowerCase().indexOf('low') >= 0) { // batt Low
          if (valueBatt !== 0) {
            valueBatt = 0;
          } else {
            valueBatt = 30;
          }
        } else { // batt OK
          valueBatt = 100;
        }
        if (valueBatt !== this.getCapabilityValue('measure_battery')) {
          this.setCapabilityValue('measure_battery', valueBatt).catch(this.error);
        }
      }
    }
    return true;
  }

  async onCapabilityOperationMode(value) {
    return this.setThermMode({ mode: value });
  }

  async onFlowActionSetManual(state, args) {
    let tCelsius = Number(args.temperature.celsius);

    let objSetting = {
      setting: {
        type: this._type,
        power: state
      },
      termination: {
        type: 'MANUAL',
      },
    };

    if (state === 'ON') {
      objSetting.type = 'MANUAL';
      objSetting.setting.temperature = { celsius: tCelsius };
    }

    return this.oAuth2Client.setOverlay(this._homeId, this._zoneId, objSetting);
  }

  async onFlowActionSetUntilTimer(state, args) {
    let tCelsius = Number(args.temperature.celsius);
    let objSetting = { 
      type: 'MANUAL',
      setting: {
        type: this._type,
        power: state,
        temperature: { celsius: tCelsius },
      },
      termination: {
        type: 'TIMER',
        durationInSeconds: Number((args.timer_off).substr(0, 2)) * 3600 + Number((args.timer_off).substr(3, 2)) * 60,
      },
    };
    return this.oAuth2Client.setOverlay(this._homeId, this._zoneId, objSetting);
  }

  async onFlowActionSetUntilSmart(state, args) {
    let tCelsius = Number(args.temperature.celsius);
    let objSetting = {
      type: 'MANUAL',
      setting: {
        type: this._type,
        power: state,
        temperature: { celsius: tCelsius },
      },
      termination: {
        type: 'TADO_MODE',
      },
    };
    // - Off Until next Smart Schedule change
    return this.oAuth2Client.setOverlay(this._homeId, this._zoneId, objSetting);
  }

  async onFlowActionSetSmartSchedule(state, args) {
    if (!this.getCapabilityValue('smart_heating')) { // smart_heating false -> true
      return this.oAuth2Client.unsetOverlay(this._homeId, this._zoneId).then(() => {
        return this.getState();
      });
    } // smart_heating was true already
    return this.getState();
  }

  async setThermMode({ mode }) {
    this.oAuth2Client.getState(this._homeId, this._zoneId)
      .then(state => {
        this.setAvailable();
        let args = {
          temperature: {
            celsius: 20,
          }
        };

        if (state.setting.type === 'HEATING' && state.setting.temperature !== null) {
          args.temperature = {
            celsius: state.setting.temperature.celsius
          };
        }

        switch (mode) {
          case 'SCHEDULE':
            return this.onFlowActionSetSmartSchedule('ON', args);
          case 'MANUAL':
            return this.onFlowActionSetManual('ON', args);
          case 'UNTIL_CHANGE':
            return this.onFlowActionSetUntilSmart('ON', args);
          case 'OFF':
            return this.onFlowActionSetManual('OFF', args);
            // case 'TIMER':
          default:
          // do nothing
        }
      })
      .catch(err => {
        this.error(err);
        this.setUnavailable(err);
        throw err;
      });
  }

  async onFlowActionTemperatureUntilTimer(args) {
    const tCelsius = Number(args.temperature.celsius);

    switch (this._type) {
      case 'HOT_WATER':
        if (this._zoneCapabilities.canSetTemperature) {
          var	tadoOverlaySetting = {
            type: this._type,
            power: 'ON',
            temperature: { celsius: tCelsius },
          };
        } else if (tCelsius === 0) {
          var	tadoOverlaySetting = {
            type: this._type,
            power: 'OFF',
          };
        } else {
          var	tadoOverlaySetting = {
            type: this._type,
            power: 'ON',
            temperature: null,
          };
        }
        break;

      case 'HEATING':
        var	tadoOverlaySetting = {
          type: this._type,
          power: 'ON',
          temperature: { celsius: tCelsius },
        };
        break;
    }

    return this.oAuth2Client.setOverlay(this._homeId, this._zoneId, {
      type: 'MANUAL',
      setting: tadoOverlaySetting,
      termination: {
        type: 'TIMER',
        durationInSeconds: Number((args.timer_off).substr(0, 2)) * 3600 + Number((args.timer_off).substr(3, 2)) * 60,
      },
    });
  }

  async onFlowActionTemperatureAircoUntilTimer(args) {
    return this.oAuth2Client.setOverlay(this._homeId, this._zoneId, {
      type: 'MANUAL',
      setting: {
        type: 'AIR_CONDITIONING',
        power: 'ON',
        mode: (args.airco_mode.mode).toUpperCase(),
        temperature: { celsius: Number(args.temperature.celsius) },
      },
      termination: {
        type: 'TIMER',
        durationInSeconds: Number((args.timer_off).substr(0, 2)) * 3600 + Number((args.timer_off).substr(3, 2)) * 60,
      },
    });
  }

  async onFlowActionTemperatureUntilSmart(args) {
    const tCelsius = Number(args.temperature.celsius);

    switch (this._type) {
      case 'HOT_WATER':
        if (this._zoneCapabilities.canSetTemperature) {
          var	tadoOverlaySetting = {
            type: this._type,
            power: 'ON',
            temperature: { celsius: tCelsius },
          };
        } else { // has no thermostat. on/off only
          if (tCelsius === 0) {
            var xPower = 'OFF';
          } else {
            var xPower = 'ON';
          }
          var	tadoOverlaySetting = {
            type: this._type,
            power: xPower,
            temperature: null,
          };
        }
        break;

      case 'HEATING':
        var	tadoOverlaySetting = {
          type: this._type,
          power: 'ON',
          temperature: { celsius: tCelsius },
        };
        break;
    }

    return this.oAuth2Client.setOverlay(this._homeId, this._zoneId, {
      type: 'MANUAL',
      setting: tadoOverlaySetting,
      termination: { type: 'TADO_MODE' },
    });
  }

  async onFlowActionTemperatureAircoUntilSmart(args) {
    return this.oAuth2Client.setOverlay(this._homeId, this._zoneId, {
      type: 'MANUAL',
      setting: {
        type: 'AIR_CONDITIONING',
        power: 'ON',
        mode: (args.airco_mode.mode).toUpperCase(),
        temperature: { celsius: Number(args.temperature.celsius) },
      },
      termination: { type: 'TADO_MODE' },
    });
  }

  async _onCapabilityTargetTemperature(value) {
    switch (this._type) {
      case 'AIR_CONDITIONING':
        var modeNow = this.getCapabilityValue('airco_mode').toUpperCase();
        if (modeNow.indexOf(' ') > 0) {
          modeNow = modeNow.substr(0, modeNow.indexOf(' '));
        }
        if (modeNow !== 'HEAT') {
          modeNow = 'COOL';
        }
        var objSetting = {
          type: this._type,
          power: 'ON',
          mode: modeNow,
          temperature: {
            celsius: value,
          },
        };
        break;

      case 'HOT_WATER':
      case 'HEATING':
        var objSetting = {
          type: this._type,
          power: 'ON',
          temperature: {
            celsius: value,
          },
        };
        break;
    }

    return this.oAuth2Client.setOverlay(this._homeId, this._zoneId, {
      setting: objSetting,
      termination: {
        type: 'MANUAL',
      },
    }).then(() => {
      return this.getState();
    });
  }

  async _onCapabilityTargetOnOff(value) {
    if (value) {
      var xPower = 'ON';
    } else {
      var xPower = 'OFF';
    }

    const objOverlay = {
      setting: {
        type: this._type,
        power: xPower,
        temperature: { celsius: 20 },
      },
      termination: {
        type: 'MANUAL',
      },
    };

    return this.oAuth2Client.setOverlay(this._homeId, this._zoneId, objOverlay).then(() => {
      return this.getState();
    });
  }

  // async _onCapabilityTadoAuto(value) {
  //   if (!this.getCapabilityValue('smart_heating')) { // smart_heating false -> true
  //     return this.oAuth2Client.unsetOverlay(this._homeId, this._zoneId).then(() => {
  //       return this.getState();
  //     });
  //   } // smart_heating was true already
  //   return this.getState();
  // }

}

module.exports = TadoDeviceThermostat;
