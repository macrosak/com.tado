'use strict';

const Homey = require('homey');
const TadoDriver = require('../../lib/TadoDriver');

const tadoSub = require('./tadoAdditional');

const capabilitiesMap = {
	'TADO_HOME': [
		'measure_temperature.outside',
		'solar_intensity',
		'weather_state',
		'presence_status'
	],
	'HEATING': [
		'tado_smart',
		'target_temperature',
		'measure_temperature',
		'measure_humidity',
		'heating_power',
		'detect_open_window',
		'smart_heating',
		'battery_state',
	  "measure_battery",
		'heating_only'
	],
	'HOT_WATER': [
		'tado_smart',
		'target_temperature',
		'smart_heating',
		'heating_only'
	],
	'HOT_WATER_ONOFF': [
		'tado_smart',
		'target_onoff',
		'smart_heating'
	],
	'AIR_CONDITIONING': [
		'tado_smart',
		'target_temperature',
		'measure_temperature',
		'measure_humidity',
		'smart_heating',
		'airco_mode'
	]
}

const capabilitiesOptionsMap = {
	'TADO_HOME': {
		"measure_temperature.outside": {
			"title": {
				"en": "Temperature outside",
				"nl": "Temperatuur buiten"
			}
		}
	},
	'HEATING': {
		"tado_smart": {
    	"preventInsights": true,
	    "preventTag": true
		},
		"target_temperature": {
		    "min": 5,
		    "max": 25
    },
		"measure_battery": {
    	"preventInsights": true,
	    "preventTag": true
		},
		"heating_only": {
    	"preventInsights": true,
	    "preventTag": true
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
		"heating_only": {
    	"preventInsights": true,
	    "preventTag": true
		}
	},
	'HOT_WATER_ONOFF': {
		"tado_smart": {
    	"preventInsights": true,
	    "preventTag": true
		}
	},
	'AIR_CONDITIONING': {
		"tado_smart": {
    	"preventInsights": true,
	    "preventTag": true
		},
		"target_temperature": {
	    "min": 15,
	    "max": 31,
	    "step": 1
    }
	}
}

const mobileComponentsMap = {
	'TADO_HOME': [
    {
	    "id": "icon",
	    "options": {
		    "showTitle": true
	    }
    },
    {
	    "id": "sensor",
		    "capabilities": [
				"presence_status",
				"measure_temperature.outside",
				"solar_intensity",
				"weather_state"
			],
			"options": {
				"showTitle": true,
				"icons": {
					"presence_status": "drivers/thermostat/assets/presence.svg",
					"measure_temperature.outside": "drivers/thermostat/assets/temp_out.svg",
					"solar_intensity": "drivers/thermostat/assets/sun.svg",
					"weather_state": "drivers/thermostat/assets/weather.svg"
				},
				"presence_status": {
			        "noblink": false,
			        "invert": true,
					"label": {
						"true": { "en": "Someone is at home", "nl": "Iemand is thuis" },
						"false": { "en": "No one is at home", "nl": "Niemand is thuis" }
					}
				}
			}
    }
  ],

	'HEATING': [
    {
	    "id": "icon",
	    "capabilities": [ "tado_smart" ],
	    "options": {
		    "showTitle": true
	    }
    },
    {
	    "id": "battery",
	    "capabilities": [ "measure_battery" ],
	    "options": {
		    "showTitle": false
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
				"battery_state"
			],
			"options": {
				"showTitle": true,
				"icons": {
					"measure_temperature": "drivers/thermostat/assets/temp.svg",
					"heating_power": "drivers/thermostat/assets/heating.svg",
					"measure_humidity": "drivers/thermostat/assets/humidity.svg",
					"detect_open_window": "drivers/thermostat/assets/open_window.svg",
					"smart_heating": "drivers/thermostat/assets/smart_heating.svg",
					"battery_state": "drivers/thermostat/assets/battery.svg"
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
				"smart_heating"
			],
			"options": {
				"showTitle": true,
				"icons": {
					"smart_heating": "drivers/thermostat/assets/smart_heating.svg"
				},
				"smart_heating": {
					"noblink": false,
					"invert": true,
					"label": {
							"true": { "en": "Active", "nl": "Actief" },
							"false": { "en": "Not active", "nl": "Niet actief" }
					}
				}
			}
    },
    {
	    "id": "thermostat",
	    "capabilities": [ "target_temperature" ]
    }
	],

	'HOT_WATER_ONOFF': [
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
				"smart_heating"
			],
			"options": {
				"showTitle": true,
				"icons": {
					"smart_heating": "drivers/thermostat/assets/smart_heating.svg"
				},
				"smart_heating": {
					"noblink": false,
					"invert": true,
					"label": {
							"true": { "en": "Active", "nl": "Actief" },
							"false": { "en": "Not active", "nl": "Niet actief" }
					}
				}
			}
		},
		{
			"id": "toggle",
			"capabilities": [ "target_onoff" ],
			"options": {
				"showTitle": false
			}
		}
	],

	'AIR_CONDITIONING': [
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
				"airco_mode",
				"measure_temperature",
				"measure_humidity",
				"smart_heating"
			],
			"options": {
				"showTitle": true,
				"icons": {
					"measure_temperature": "drivers/thermostat/assets/temp.svg",
					"measure_humidity": "drivers/thermostat/assets/humidity.svg",
					"smart_heating": "drivers/thermostat/assets/smart_heating.svg",
					"airco_mode": "drivers/thermostat/assets/airco_mode.svg"
				},
				"smart_heating": {
					"noblink": false,
					"invert": true,
					"label": {
							"true": { "en": "Active", "nl": "Actief" },
							"false": { "en": "Not active", "nl": "Niet actief" }
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

		new Homey.FlowCardCondition('target_temperature_inbetween')
			.register()
			.registerRunListener( (args, state) => {
				if( args.temperature_1 < args.temperature_2 ){
					var val1 = args.temperature_1,  val2 = args.temperature_2
				} else {
					var val1 = args.temperature_2,  val2 = args.temperature_1
				}
				return ((args.device.getCapabilityValue('target_temperature') >= val1 )
						&& (args.device.getCapabilityValue('target_temperature') <= val2 ));
			});

		new Homey.FlowCardCondition('measure_temperature_between')
			.register()
			.registerRunListener( (args, state) => {
				if( args.temperature_1 < args.temperature_2 ){
					var val1 = args.temperature_1,  val2 = args.temperature_2
				} else {
					var val1 = args.temperature_2,  val2 = args.temperature_1
				}
				return ((args.device.getCapabilityValue('measure_temperature') >= val1 )
						&& (args.device.getCapabilityValue('measure_temperature') <= val2 ));
			});

		new Homey.FlowCardCondition('measure_humidity_between')
			.register()
			.registerRunListener( (args, state) => {
				if( args.humidity_1 < args.humidity_2 ){
					var val1 = args.humidity_1,  val2 = args.humidity_2
				} else {
					var val1 = args.humidity_2,  val2 = args.humidity_1
				}
				return ((args.device.getCapabilityValue('measure_humidity') >= val1 )
						&& (args.device.getCapabilityValue('measure_humidity') <= val2 ));
			});

		new Homey.FlowCardCondition('heating_power_between')
			.register()
			.registerRunListener( (args, state) => {
				if( args.capacity_1 < args.capacity_2 ){
					var val1 = args.capacity_1,  val2 = args.capacity_2
				} else {
					var val1 = args.capacity_2,  val2 = args.capacity_1
				}
				return ((args.device.getCapabilityValue('heating_power') >= val1 )
						&& (args.device.getCapabilityValue('heating_power') <= val2 ));
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

		new Homey.FlowCardCondition('if_battery_status')
			.register()
			.registerRunListener( (args, state) => {
				return ( args.device.getCapabilityValue('battery_state').indexOf('Low') < 0 );
			});

		new Homey.FlowCardCondition('airco_mode')
			.register()
			.registerRunListener( (args, state) => {
				var xMode = Homey.__(args.current_mode.mode)
				return xMode == (args.device.getCapabilityValue('airco_mode')).substr(0, xMode.length);
			})
			.getArgument('current_mode')
        .registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteAircoMode(args) );
        });

		new Homey.FlowCardCondition('measure_temperature_outside_between')
			.register()
			.registerRunListener( (args, state) => {
				if( args.temperature_1 < args.temperature_2 ){
					var val1 = args.temperature_1,  val2 = args.temperature_2
				} else {
					var val1 = args.temperature_2,  val2 = args.temperature_1
				}
				return ((args.device.getCapabilityValue('measure_temperature.outside') >= val1 )
						&& (args.device.getCapabilityValue('measure_temperature.outside') <= val2 ));
			});

		new Homey.FlowCardCondition('solar_intensity_between')
			.register()
			.registerRunListener( (args, state) => {
				if( args.intensity_1 < args.intensity_2 ){
					var val1 = args.intensity_1,  val2 = args.intensity_2
				} else {
					var val1 = args.intensity_2,  val2 = args.intensity_1
				}
				return ((args.device.getCapabilityValue('solar_intensity') >= val1 )
						&& (args.device.getCapabilityValue('solar_intensity') <= val2 ));
			});

		new Homey.FlowCardCondition('weather_state')
		.register()
		.registerRunListener( (args, state) => {
			return Homey.__(args.current_weather_state.condition) == args.device.getCapabilityValue('weather_state');
		})
		.getArgument('current_weather_state')
      .registerAutocompleteListener(( query, args ) => {
				return Promise.resolve(tadoSub.getAutocompleteWeatherCondition(args) );
      });

		new Homey.FlowCardCondition('presence_status')
			.register()
			.registerRunListener( (args, state) => {
				return args.device.getCapabilityValue('presence_status');
			});

		new Homey.FlowCardCondition('mobile_tracking_true')
			.register()
			.registerRunListener( (args, state) => {
				var conditionResult = false;
				args.device.getStoreValue('mobileDevices').forEach(function(item){
					if( args.mobile_device_selection.id === item.id ){
						conditionResult = item.settings.geoTrackingEnabled
					}
				});
				return conditionResult;
			})
			.getArgument('mobile_device_selection')
	      .registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevices(args) );
	      });

		new Homey.FlowCardCondition('mobile_location_time')
			.register()
			.registerRunListener( (args, state) => {
				var time_out = Number((args.time_out).substr(0,2)) * 60 + Number((args.time_out).substr(3,2));
				var conditionResult = false;
				args.device.getStoreValue('mobileDevices').forEach(function(item){
					if( args.mobile_device_selection.id === item.id ){
						if( item.settings.geoTrackingEnabled ){
							conditionResult = ( item.minutesSinceLocation < time_out )
						}
					}
				});
				return conditionResult;
			})
			.getArgument('mobile_device_selection')
	      .registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevicesLocationBased(args) );
	      });

		new Homey.FlowCardCondition('mobile_location_true')
			.register()
			.registerRunListener( (args, state) => {
				var conditionResult = false;
				args.device.getStoreValue('mobileDevices').forEach(function(item){
					if( args.mobile_device_selection.id === item.id ){
						if( item.settings.geoTrackingEnabled ){
							conditionResult = ( item.location && ( item.location !== null ) )
						}
					}
				});
				return conditionResult;
			})
			.getArgument('mobile_device_selection')
	      .registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevicesLocationBased(args) );
	      });

		new Homey.FlowCardCondition('mobile_athome_true')
			.register()
			.registerRunListener( (args, state) => {
				var conditionResult = false;
				args.device.getStoreValue('mobileDevices').forEach(function(item){
					if( args.mobile_device_selection.id === item.id ){
						if( item.settings.geoTrackingEnabled ){
							if( item.location && (item.location !== null)){
								conditionResult = item.location.atHome
							}
						}
					}
				});
				return conditionResult;
			})
			.getArgument('mobile_device_selection')
	      .registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevicesLocationBased(args) );
	      });

		new Homey.FlowCardCondition('mobile_distance_between')
			.register()
			.registerRunListener( (args, state) => {
				if( args.distance_1 < args.distance_2 ){
					var val1 = args.distance_1,  val2 = args.distance_2
				} else {
					var val1 = args.distance_2,  val2 = args.distance_1
				}
				var conditionResult = false;
				args.device.getStoreValue('mobileDevices').forEach(function(item){
					if( args.mobile_device_selection.id === item.id ){
						if( item.settings.geoTrackingEnabled ){
							if( item.location && (item.location !== null)){
								conditionResult = ((item.location.relativeDistanceFromHomeFence >= val1 )
										&& (item.location.relativeDistanceFromHomeFence <= val2 ))
							}
						}
					}
				});
				return conditionResult;
			})
			.getArgument('mobile_device_selection')
	      .registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevicesLocationBased(args) );
	      });

		new Homey.FlowCardCondition('mobile_kilometer_between')
			.register()
			.registerRunListener( (args, state) => {
				if( args.distance_1 < args.distance_2 ){
					var val1 = args.distance_1,  val2 = args.distance_2
				} else {
					var val1 = args.distance_2,  val2 = args.distance_1
				}
				val1 = tadoSub.convertKilometerToRelative(val1);
				val2 = tadoSub.convertKilometerToRelative(val2);
				var conditionResult = false;
				args.device.getStoreValue('mobileDevices').forEach(function(item){
					if( args.mobile_device_selection.id === item.id ){
						if( item.settings.geoTrackingEnabled ){
							if( item.location && (item.location !== null)){
								conditionResult = ((item.location.relativeDistanceFromHomeFence >= val1 )
										&& (item.location.relativeDistanceFromHomeFence <= val2 ))
							}
						}
					}
				});
				return conditionResult;
			})
			.getArgument('mobile_device_selection')
	      .registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevicesLocationBased(args) );
	      });



		new Homey.FlowCardAction('set_smart')
			.register()
			.registerRunListener(args => args.device.onFlowActionSetSmart());

		new Homey.FlowCardAction('set_on')
			.register()
			.registerRunListener(args => args.device.onFlowActionSetOn());

		new Homey.FlowCardAction('set_on_until_timer')
			.register()
			.registerRunListener( args => args.device.onFlowActionSetOnUntilTimer(args));

		new Homey.FlowCardAction('set_on_until_smart')
			.register()
			.registerRunListener(args => args.device.onFlowActionSetOnUntilSmart());

		new Homey.FlowCardAction('set_off')
			.register()
			.registerRunListener(args => args.device.onFlowActionSetOff());

		new Homey.FlowCardAction('set_off_until_timer')
			.register()
			.registerRunListener( args => args.device.onFlowActionSetOffUntilTimer(args));

		new Homey.FlowCardAction('set_off_until_smart')
			.register()
			.registerRunListener(args => args.device.onFlowActionSetOffUntilSmart());

		new Homey.FlowCardAction('temperature_until_timer')
			.register()
			.registerRunListener( args => args.device.onFlowActionTemperatureUntilTimer(args))
			.getArgument('temperature')
        .registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteTemperature(args) );
        });

		var _flowActionAircoUntilTimer = new Homey.FlowCardAction('temperature_airco_until_timer')
					.register()
					.registerRunListener( args => args.device.onFlowActionTemperatureAircoUntilTimer(args));
				_flowActionAircoUntilTimer.getArgument('airco_mode')
		      .registerAutocompleteListener(( query, args ) => {
						return Promise.resolve(tadoSub.getAutocompleteAircoCoolHeat(args) );
		      });
				_flowActionAircoUntilTimer.getArgument('temperature')
		      .registerAutocompleteListener(( query, args ) => {
						return Promise.resolve(tadoSub.getAutocompleteTemperature(args) );
		      });

		var _flowActionAircoUntilSmart = new Homey.FlowCardAction('temperature_airco_until_smart')
					.register()
					.registerRunListener( args => args.device.onFlowActionTemperatureAircoUntilSmart(args));
				_flowActionAircoUntilSmart.getArgument('airco_mode')
			    .registerAutocompleteListener(( query, args ) => {
						return Promise.resolve(tadoSub.getAutocompleteAircoCoolHeat(args) );
			    });
				_flowActionAircoUntilSmart.getArgument('temperature')
			    .registerAutocompleteListener(( query, args ) => {
						return Promise.resolve(tadoSub.getAutocompleteTemperature(args) );
			    });

		new Homey.FlowCardAction('temperature_until_smart')
			.register()
			.registerRunListener(args => args.device.onFlowActionTemperatureUntilSmart(args))
			.getArgument('temperature')
        .registerAutocompleteListener(( query, args ) => {
					return Promise.resolve( tadoSub.getAutocompleteTemperature(args) );
        });

	}


	async _onPairListDevices( result ) {
		let devices = [];

		result.forEach( item => {
			let home = item.home;
			item.zones.forEach( zone => {

				// select icon for various devices
				//
				// Known tado device serial:
				// GW... = Gateway (pre-HomeKit bridge) [not yet used in this app]
				// IB... = Internet Bridge (HomeKit compatible) [not yet used in this app]
				// BU... = Boiler Unit (extension kit?) [not yet used in this app]
				// RU... = Thermostat (RU = Remote Unit?)
				// VA... = Radiator Thermostat (VA = Valve Addition?)
				// WR... = Air Conditioning Controller (WR = Wireless Remote?).
				var xIcon = '';
				switch(zone.type){
					case 'TADO_HOME':
						xIcon = 'tado_device_home.svg';
						break;

					case 'AIR_CONDITIONING':
						xIcon = 'tado_device_airco.svg';
						break;

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

							if( xRU > 0 && xVA2 > 0 ){ // Combi of Thermostat + multiple Radiator Thermostat(s)
								xIcon = 'tado_device_radiator_set_combi.svg';
							} else if( xRU > 0 && xVA > 0 ){ // Combi of Thermostat + Radiator Thermostat
								xIcon = 'tado_device_combi.svg';
							} else if( xVA > 0 ){
								if( xVA2 > 0 ){ // Multiple Radiator Thermostats
									xIcon = 'tado_device_radiator_set.svg';
								} else { // Single Radiator Thermostat only
									xIcon = 'tado_device_radiator.svg';
								}
							} else {
								xIcon = 'tado_device_thermostat.svg'; // Thermostat only
							}
						}
						break;

					default:
						xIcon = 'icon.svg';
				}

				// get device type for capabilitiesMap, capabilitiesOptionsMap, mobileComponentsMap
				var mapType = zone.type;
				if( zone.type == 'HOT_WATER'){ // check for thermostat when device type is HOT_WATER
					if( !zone.zoneCapabilities.canSetTemperature ){ // Has no thermostat
						var mapType = mapType + '_ONOFF'; // change mapType to HOT_WATER_ONOFF
					}
				}

				var capabilitiesOpt = [];
				capabilitiesOpt = capabilitiesOptionsMap[ mapType ];

				// get fixed capabilities like target_temperature min & max,
				// and set capabilitiesOpt.target_temperature for zone
				switch( mapType ){
					case 'HEATING':
						tMin = zone.zoneCapabilities.temperatures.celsius.min
						tMax = zone.zoneCapabilities.temperatures.celsius.max
						capabilitiesOpt.target_temperature = {
							min: tMin, max: tMax
						}
					break;

					case 'HOT_WATER':
						tMin = zone.zoneCapabilities.temperatures.celsius.min
						tMax = zone.zoneCapabilities.temperatures.celsius.max
						capabilitiesOpt.target_temperature = {
							min: tMin, max: tMax, step: 1
						}
						break;

					case 'HOT_WATER_ONOFF':
						// no thermostat and no target_temperature -> no min, max or step
						// no other fixed capability settings
						break;

					case 'AIR_CONDITIONING':
						var tMin = 16, tMax = 30; //AC defaults
						if(zone.zoneCapabilities.COOL){ // device-dependent minimum
							tMin = zone.zoneCapabilities.COOL.temperatures.celsius.min
						}
						if(zone.zoneCapabilities.HEAT){ // device-dependent maximum
							tMax = zone.zoneCapabilities.HEAT.temperatures.celsius.max
						}
						capabilitiesOpt.target_temperature = {
							min: tMin, max: tMax, step: 1
						}
						break;

					case 'TADO_HOME':
						// mobile device tracking & weather
						break;
				}

				let device = {};
					device.name = `${zone.name} (${home.name})`;
					device.data = {
						homeId: home.id,
						zoneId: zone.id,
						zoneCapabilities: zone.zoneCapabilities,
						type: zone.type
					}
		      device.icon = xIcon;
					device.capabilities = capabilitiesMap[ mapType ];
					device.capabilitiesOptions = capabilitiesOpt;
					device.mobile = { components: mobileComponentsMap[ mapType ] };

				devices.push(device);
			})
		})
		return devices;
	}

}

module.exports = TadoDriverThermostat;
