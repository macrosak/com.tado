'use strict';

const Homey = require('homey');
const TadoDriver = require('../../lib/TadoDriver');

const tadoSub = require('./tadoAdditional');

class TadoDriverThermostat extends TadoDriver {

  onOAuth2Init() {
    super.onOAuth2Init();

    new Homey.FlowCardCondition('target_temperature_inbetween')
      .register()
      .registerRunListener(async (args, state) => {
        if (args.temperature_1 < args.temperature_2) {
          var val1 = args.temperature_1; 
          var val2 = args.temperature_2;
        } else {
          var val1 = args.temperature_2; 
          var val2 = args.temperature_1;
        }
        return ((args.device.getCapabilityValue('target_temperature') >= val1)
						&& (args.device.getCapabilityValue('target_temperature') <= val2));
      });

    new Homey.FlowCardCondition('measure_temperature_between')
      .register()
      .registerRunListener(async (args, state) => {
        if (args.temperature_1 < args.temperature_2) {
          var val1 = args.temperature_1; var
            val2 = args.temperature_2;
        } else {
          var val1 = args.temperature_2; var
            val2 = args.temperature_1;
        }
        return ((args.device.getCapabilityValue('measure_temperature') >= val1)
						&& (args.device.getCapabilityValue('measure_temperature') <= val2));
      });

    new Homey.FlowCardCondition('measure_humidity_between')
      .register()
      .registerRunListener(async (args, state) => {
        if (args.humidity_1 < args.humidity_2) {
          var val1 = args.humidity_1; var
            val2 = args.humidity_2;
        } else {
          var val1 = args.humidity_2; var
            val2 = args.humidity_1;
        }
        return ((args.device.getCapabilityValue('measure_humidity') >= val1)
						&& (args.device.getCapabilityValue('measure_humidity') <= val2));
      });

    new Homey.FlowCardCondition('heating_power_between')
      .register()
      .registerRunListener(async (args, state) => {
        if (args.capacity_1 < args.capacity_2) {
          var val1 = args.capacity_1; var
            val2 = args.capacity_2;
        } else {
          var val1 = args.capacity_2; var
            val2 = args.capacity_1;
        }
        return ((args.device.getCapabilityValue('heating_power') >= val1)
						&& (args.device.getCapabilityValue('heating_power') <= val2));
      });

    new Homey.FlowCardCondition('smart_heating')
      .register()
      .registerRunListener(async (args, state) => {
        return args.device.getCapabilityValue('smart_heating');
      });

    new Homey.FlowCardCondition('open_window')
      .register()
      .registerRunListener(async (args, state) => {
        return args.device.getCapabilityValue('detect_open_window');
      });

    new Homey.FlowCardCondition('if_battery_status')
      .register()
      .registerRunListener(async (args, state) => {
        return (args.device.getCapabilityValue('battery_state').indexOf('Low') < 0);
      });

    new Homey.FlowCardCondition('airco_mode')
      .register()
      .registerRunListener(async (args, state) => {
        const xMode = Homey.__(args.current_mode.mode);
        return xMode == (args.device.getCapabilityValue('airco_mode')).substr(0, xMode.length);
      })
      .getArgument('current_mode')
      .registerAutocompleteListener(async (query, args) => {
        return tadoSub.getAutocompleteAircoMode(args);
      });

    new Homey.FlowCardCondition('measure_temperature_outside_between')
      .register()
      .registerRunListener(async (args, state) => {
        if (args.temperature_1 < args.temperature_2) {
          var val1 = args.temperature_1;
          var val2 = args.temperature_2;
        } else {
          var val1 = args.temperature_2;
          var val2 = args.temperature_1;
        }
        return ((args.device.getCapabilityValue('measure_temperature.outside') >= val1)
						&& (args.device.getCapabilityValue('measure_temperature.outside') <= val2));
      });

    new Homey.FlowCardCondition('solar_intensity_between')
      .register()
      .registerRunListener(async (args, state) => {
        if (args.intensity_1 < args.intensity_2) {
          var val1 = args.intensity_1;
          var val2 = args.intensity_2;
        } else {
          var val1 = args.intensity_2;
          var val2 = args.intensity_1;
        }
        return ((args.device.getCapabilityValue('solar_intensity') >= val1)
						&& (args.device.getCapabilityValue('solar_intensity') <= val2));
      });

    new Homey.FlowCardCondition('weather_state')
      .register()
      .registerRunListener(async (args, state) => {
        return Homey.__(args.current_weather_state.condition) === args.device.getCapabilityValue('weather_state');
      })
      .getArgument('current_weather_state')
      .registerAutocompleteListener(async (query, args) => {
        return tadoSub.getAutocompleteWeatherCondition(args);
      });

    new Homey.FlowCardAction('set_on')
      .register()
      .registerRunListener(args => args.device.onFlowActionSetManual('ON'));

    new Homey.FlowCardAction('set_on_until_timer')
      .register()
      .registerRunListener(args => args.device.onFlowActionSetOnUntilTimer('ON', args));

    new Homey.FlowCardAction('set_on_until_smart')
      .register()
      .registerRunListener(args => args.device.onFlowActionSetUntilSmart('ON'));

    new Homey.FlowCardAction('set_off')
      .register()
      .registerRunListener(args => args.device.onFlowActionSetManual('OFF'));

    new Homey.FlowCardAction('set_off_until_timer')
      .register()
      .registerRunListener(args => args.device.onFlowActionSetUntilTimer('OFF', args));

    new Homey.FlowCardAction('set_off_until_smart')
      .register()
      .registerRunListener(args => args.device.onFlowActionSetUntilSmart('OFF'));

    new Homey.FlowCardAction('temperature_until_timer')
      .register()
      .registerRunListener(args => args.device.onFlowActionTemperatureUntilTimer(args))
      .getArgument('temperature')
      .registerAutocompleteListener(async (query, args) => {
        return tadoSub.getAutocompleteTemperature(args);
      });

    new Homey.FlowCardAction('thermostat_set_operation_mode')
      .register()
      .registerRunListener(args => args.device.setThermMode(args));

    const _flowActionAircoUntilTimer = new Homey.FlowCardAction('temperature_airco_until_timer')
      .register()
      .registerRunListener(args => args.device.onFlowActionTemperatureAircoUntilTimer(args));
    _flowActionAircoUntilTimer.getArgument('airco_mode')
		      .registerAutocompleteListener(async (query, args) => {
        return tadoSub.getAutocompleteAircoCoolHeat(args);
		      });
    _flowActionAircoUntilTimer.getArgument('temperature')
		      .registerAutocompleteListener(async (query, args) => {
        return tadoSub.getAutocompleteTemperature(args);
		      });

    const _flowActionAircoUntilSmart = new Homey.FlowCardAction('temperature_airco_until_smart')
      .register()
      .registerRunListener(args => args.device.onFlowActionTemperatureAircoUntilSmart(args));
    _flowActionAircoUntilSmart.getArgument('airco_mode')
			    .registerAutocompleteListener(async (query, args) => {
        return tadoSub.getAutocompleteAircoCoolHeat(args);
			    });
    _flowActionAircoUntilSmart.getArgument('temperature')
			    .registerAutocompleteListener(async (query, args) => {
        return tadoSub.getAutocompleteTemperature(args);
			    });

    new Homey.FlowCardAction('temperature_until_smart')
      .register()
      .registerRunListener(args => args.device.onFlowActionTemperatureUntilSmart(args))
      .getArgument('temperature')
      .registerAutocompleteListener(async (query, args) => {
        return tadoSub.getAutocompleteTemperature(args);
      });
  }

}

module.exports = TadoDriverThermostat;
