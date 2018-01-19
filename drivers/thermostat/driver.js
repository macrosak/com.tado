'use strict';

const Homey = require('homey');
const TadoDriver = require('../../lib/TadoDriver');

const capabilitiesMap = {
	'HEATING': [
		'tado_smart',
		'target_temperature',
		'measure_temperature',
		'measure_humidity',
		'heating_power',
		'detect_open_window',
		'smart_heating',
		'measure_temperature.outside',
		'solar_intensity',
		'weather_state',
		'presence_status',
	],
	'HOT_WATER': [
		'tado_smart',
		'target_temperature',
		'smart_heating',
		'measure_temperature.outside',
		'solar_intensity',
		'weather_state',
		'presence_status',
	],
}
const capabilitiesOptionsMap = {
	'HEATING': {
		"tado_smart": {
    	"preventInsights": true,
	    "preventTag": true
		},
		"target_temperature": {
		    "min": 5,
		    "max": 25
    },
		"measure_temperature.outside": {
			"title": {
				"en": "Temperature outside",
				"nl": "Temperatuur buiten"
			}
		}
	},
	'HOT_WATER': {
		"tado_smart": {
    	"preventInsights": true,
	    "preventTag": true
		},
		"target_temperature": {
	    "min": 30,
	    "max": 65
    },
		"measure_temperature.outside": {
			"title": {
				"en": "Temperature outside",
				"nl": "Temperatuur buiten"
			}
		}
	}
}

const mobileComponentsMap = {
	'HEATING': [
	    {
		    "id": "icon",
		    "capabilities": [ "tado_smart" ],
		    "options": {
			    "showTitle": true
		    }
	    },
	    {
		    "id": "sensor",
		    "capabilities": [
				"measure_temperature",
				"measure_humidity",
				"heating_power",
				"smart_heating",
				"detect_open_window",
				"presence_status",
				"measure_temperature.outside",
				"solar_intensity",
				"weather_state",
			],
			"options": {
				"showTitle": true,
				"icons": {
					"measure_temperature": "drivers/thermostat/assets/temp.svg",
					"heating_power": "drivers/thermostat/assets/heating.svg",
					"measure_humidity": "drivers/thermostat/assets/humidity.svg",
					"detect_open_window": "drivers/thermostat/assets/open_window.svg",
					"smart_heating": "drivers/thermostat/assets/smart_heating.svg",
					"presence_status": "drivers/thermostat/assets/presence.svg",
					"measure_temperature.outside": "drivers/thermostat/assets/temp_out.svg",
					"solar_intensity": "drivers/thermostat/assets/sun.svg",
					"weather_state": "drivers/thermostat/assets/weather.svg",
				},
				"detect_open_window": {
					"noblink": false,
					"invert": false,
					"label": {
							"true": { "en": "Heating paused", "nl": "Verwarming gepauzeerd" },
							"false": { "en": "Not detected", "nl": "Niet gedetecteerd" }
					}
				},
				"smart_heating": {
					"noblink": false,
					"invert": true,
					"label": {
							"true": { "en": "Active", "nl": "Actief" },
							"false": { "en": "Not active", "nl": "Niet actief" }
					}
				},
				"presence_status": {
			        "noblink": false,
			        "invert": true,
					"label": {
						"true": { "en": "Someone is at home", "nl": "Iemand is thuis" },
						"false": { "en": "Everyone is out", "nl": "Iedereen is weg" }
					}
				}
			}
	    },
	    {
		    "id": "thermostat",
		    "capabilities": [ "target_temperature" ]
	    }
    ],

    'HOT_WATER': [
	    {
		    "id": "icon",
		    "capabilities": [ "tado_smart" ],
		    "options": {
			    "showTitle": true
		    }
	    },
	    {
		    "id": "sensor",
		    "capabilities": [
				"smart_heating",
				"presence_status",
				"measure_temperature.outside",
				"solar_intensity",
				"weather_state",
			],
			"options": {
				"showTitle": true,
				"icons": {
					"smart_heating": "drivers/thermostat/assets/smart_heating.svg",
					"measure_temperature.outside": "drivers/thermostat/assets/temp_out.svg",
					"solar_intensity": "drivers/thermostat/assets/sun.svg",
					"weather_state": "drivers/thermostat/assets/weather.svg",
					"presence_status": "drivers/thermostat/assets/presence.svg",
				},
				"smart_heating": {
					"noblink": false,
					"invert": true,
					"label": {
							"true": { "en": "Active", "nl": "Actief" },
							"false": { "en": "Not active", "nl": "Niet actief" }
					}
				},
				"presence_status": {
			        "noblink": false,
			        "invert": true,
					"label": {
						"true": { "en": "Someone is at home", "nl": "Iemand is thuis" },
						"false": { "en": "Everyone is out", "nl": "Iedereen is weg" }
					}
				}
			}
	    },
	    {
		    "id": "thermostat",
		    "capabilities": [ "target_temperature" ]
	    }
	]
}

class TadoDriverThermostat extends TadoDriver {

	onInit() {

		new Homey.FlowCardCondition('weather_state')
			.register()
			.registerRunListener( (args, state) => {
				return Homey.__(args.current_state) == args.device.getCapabilityValue('weather_state');
			});

		new Homey.FlowCardCondition('presence_status')
			.register()
			.registerRunListener( (args, state) => {
				return args.device.getCapabilityValue('presence_status');
			});

		new Homey.FlowCardCondition('smart_heating')
			.register()
			.registerRunListener( (args, state) => {
				return args.device.getCapabilityValue('smart_heating');
			});

		new Homey.FlowCardCondition('open_window')
			.register()
			.registerRunListener( (args, state) => {
				return args.device.getCapabilityValue('detect_open_window');
			});


		new Homey.FlowCardAction('set_off')
			.register()
			.registerRunListener(args => args.device.onFlowActionSetOff());

		new Homey.FlowCardAction('set_smart')
			.register()
			.registerRunListener(args => args.device.onFlowActionSetSmart());

	}

	async _onPairListDevices( result ) {
		let devices = [];

		result.forEach( item => {
			let home = item.home;
			item.zones.forEach( zone => {

				// Known tado device identifiers:
				// GWxx = Gateway
				// BUxx = Boiler Unit
				// RUxx = Thermostat (Remote Unit)
				// VAxx = Radiator Thermostat (Valve Addition ?)
				// ACxx = Air Conditioning Control -> Expected id = AC. Should be checked and included as device.
				//
				// Available zone icons:
				// tado_device_thermostat.svg
				// tado_device_radiator.svg
				// tado_device_combi.svg -> thermostat + valve(s)
				// tado_device_water.svg
				// tado_device_airco.svg
				var xIcon = '';
				switch(zone.type){
					case 'HOT_WATER':
						xIcon = 'tado_device_water.svg';
						break;

					case 'HEATING':
						var xDeviceTypes = zone.deviceTypes;
						if(xDeviceTypes.length){
							var xDeviceString = '.';
							xDeviceTypes.forEach(function(item, index){
								xDeviceString += item;
							});
							var xRU = xDeviceString.indexOf('RU'),	// Thermostat available?
									xVA = xDeviceString.indexOf('VA'),	//Radiator thermostat available?
									xVA2 = xDeviceString.indexOf('VA', xVA + 1);	// more Radiator thermostats available?

							if( xRU > 0 && xVA > 0 ){ // Combi of Thermostat(s) + Radiator Thermostat(s)
								xIcon = 'tado_device_combi.svg'; break;
							} else if( xVA > 0 ){
								if( xVA2 > 0 ){ // Multiple Radiator Thermostat(s)
									xIcon = 'tado_device_radiator_set.svg'; break;
								} else { // Single Radiator Thermostat
									xIcon = 'tado_device_radiator.svg'; break;
								}
							} else {
								xIcon = 'tado_device_thermostat.svg'; break; // Thermostat(s)
							}
						}
						break;

					default:
						xIcon = 'tado_device_thermostat.svg';
				}

				let device = {};
					device.name = `${zone.name} (${home.name})`;
					device.data = {
						homeId: home.id,
						zoneId: zone.id,
						type: zone.type
					}
		      //device.icon = "drivers/thermostat/assets/" + xIcon + ".svg";
		      device.icon = xIcon;
					device.capabilities = capabilitiesMap[ zone.type ];
					device.capabilitiesOptions = capabilitiesOptionsMap[ zone.type ];
					device.mobile = { components: mobileComponentsMap[ zone.type ] };

				devices.push(device);
			})
		})
		return devices;
	}

}

module.exports = TadoDriverThermostat;
