'use strict';

const Homey = require('homey');
const { OAuth2Driver } = require('homey-oauth2app');

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

class TadoDriver extends OAuth2Driver {
  
  async onPairListDevices({ oAuth2Client }) {
    const { homes } = await oAuth2Client.getMe();
    
    const devices = [];
    await Promise.all(homes.map(async home => {      
      const zones = await oAuth2Client.getZones(home.id);
      
      // add Home
      if( zones.length ) {      
        devices.push({
          name: `${home.name} — ${Homey.__('Home')}`,
          data: {
            homeId: home.id,
            zoneId: zones[0].id,
      			type: 'TADO_HOME',
          },
          icon: 'tado_device_home.svg',
          capabilities: capabilitiesMap['TADO_HOME'],
          capabilitiesOptionsMap: capabilitiesOptionsMap['TADO_HOME'],
          mobile: mobileComponentsMap['TADO_HOME'],
        });
      }
      
      // add Zones
      await Promise.all(zones.map(async zone => {
        const zoneCapabilities = await oAuth2Client.getZoneCapabilities(home.id, zone.id);
        zone.zoneCapabilities = zoneCapabilities;
        devices.push({
          name: `${home.name} — ${zone.name}`,
          data: {
            zoneCapabilities,
						homeId: home.id,
						zoneId: zone.id,
						type: zone.type,
          },
          icon: this.constructor.getZoneIcon({ home, zone }),
          capabilities: this.constructor.getZoneCapabilities({ home, zone }),
          capabilitiesOptions: this.constructor.getZoneCapabilitiesOptions({ home, zone }),
          mobile: this.constructor.getZoneMobile({ home, zone }),
        })
      }));
    }));
        
    return devices;
  }
  
  static getZoneIcon({ home, zone }) {
    let icon = undefined;
		switch(zone.type){
			case 'AIR_CONDITIONING':
				icon = 'tado_device_airco.svg';
				break;

			case 'HOT_WATER':
				icon = 'tado_device_water.svg';
				break;

			case 'HEATING':
				let deviceTypes = zone.deviceTypes;
				if(deviceTypes.length){
					var deviceString = '.';
					deviceTypes.forEach((item, index) => {
						deviceString += item;
					});
					let xRU = deviceString.includes('RU'),	// Thermostat available?
							xVA = deviceString.includes('VA'),	//Radiator thermostat available?
							xVA2 = deviceString.includes('VA', xVA + 1);	// more Radiator thermostats available?

					if( xRU > 0 && xVA2 > 0 ){ // Combi of Thermostat + multiple Radiator Thermostat(s)
						icon = 'tado_device_radiator_set_combi.svg';
					} else if( xRU > 0 && xVA > 0 ){ // Combi of Thermostat + Radiator Thermostat
						icon = 'tado_device_combi.svg';
					} else if( xVA > 0 ){
						if( xVA2 > 0 ){ // Multiple Radiator Thermostats
							icon = 'tado_device_radiator_set.svg';
						} else { // Single Radiator Thermostat only
							icon = 'tado_device_radiator.svg';
						}
					} else {
						icon = 'tado_device_thermostat.svg'; // Thermostat only
					}
				}
				break;
		}
		return icon;
  }
  
  static getZoneMapType({ home, zone }) {
			let mapType = zone.type;
			if( zone.type == 'HOT_WATER'){ // check for thermostat when device type is HOT_WATER
				if( !zone.zoneCapabilities.canSetTemperature ){ // Has no thermostat
					mapType += '_ONOFF'; // change mapType to HOT_WATER_ONOFF
				}
			}
			return mapType;
  }
  
  static getZoneMobile({ home, zone }) {
    const mapType = this.getZoneMapType({ home, zone });
    const components = mobileComponentsMap[mapType];
    return { components }
  }
  
  static getZoneCapabilities({ home, zone }) {
    const mapType = this.getZoneMapType({ home, zone });
    return capabilitiesMap[mapType];
  }
  
  static getZoneCapabilitiesOptions({ home, zone }) {
    const mapType = this.getZoneMapType({ home, zone });
		const capabilitiesOptions = capabilitiesOptionsMap[mapType];

		// get fixed capabilities like target_temperature min & max
		switch( mapType ){
			case 'HEATING':
				tMin = zone.zoneCapabilities.temperatures.celsius.min
				tMax = zone.zoneCapabilities.temperatures.celsius.max
				capabilitiesOptions.target_temperature = {
					min: tMin, max: tMax
				}
			break;

			case 'HOT_WATER':
				tMin = zone.zoneCapabilities.temperatures.celsius.min
				tMax = zone.zoneCapabilities.temperatures.celsius.max
				capabilitiesOptions.target_temperature = {
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
				capabilitiesOptions.target_temperature = {
					min: tMin, max: tMax, step: 1
				}
				break;

			case 'TADO_HOME':
				// mobile device tracking & weather
				break;
		}
		
		return capabilitiesOptions;
  }

}

module.exports = TadoDriver;
