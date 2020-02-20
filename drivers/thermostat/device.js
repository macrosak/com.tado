'use strict';

const tadoSub = require('./tadoAdditional');
const TadoInsights = require('./tadoMobileInsights');
const TadoDevice = require('../../lib/TadoDevice');
const Homey = require('homey');


class TadoDeviceThermostat extends TadoDevice {

	onOAuth2Init() {
		super.onOAuth2Init();

		this.registerCapabilityListener('target_temperature', this._onCapabilityTargetTemperature.bind(this))
		this.registerCapabilityListener('target_onoff', this._onCapabilityTargetOnOff.bind(this))
		this.registerCapabilityListener('tado_smart', this._onCapabilityTadoAuto.bind(this))

		this._flowTriggerTargetOnOff = new Homey.FlowCardTriggerDevice('target_onoff').register();
		this._flowTriggerHumidity = new Homey.FlowCardTriggerDevice('humidity').register();
		this._flowTriggerHeatingPower = new Homey.FlowCardTriggerDevice('heating_power').register();
		this._flowTriggerOpenWindow = new Homey.FlowCardTriggerDevice('detect_open_window').register();

		this._flowTriggerACModeChange = new Homey.FlowCardTriggerDevice('ac_mode_changed');
		this._flowTriggerACModeChange.register()
			.registerRunListener(( args, state ) => {
				var modeTranslated = Homey.__(args.current_mode.mode)
				return Promise.resolve( modeTranslated === state.mode );
			})
			.getArgument('current_mode')
				.registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteAircoMode(args) );
				});

		this._flowTriggerSmartHeating = new Homey.FlowCardTriggerDevice('smart_heating').register();
		this._flowTriggerBatteryChange = new Homey.FlowCardTriggerDevice('battery_state_changed').register();
		this._flowTriggerOutsideTemperature = new Homey.FlowCardTriggerDevice('outside_temperature').register();
		this._flowTriggerSolarIntensity = new Homey.FlowCardTriggerDevice('solar_intensity').register();

		this._flowTriggerWeather = new Homey.FlowCardTriggerDevice('weather');
		this._flowTriggerWeather.register()
			.registerRunListener(( args, state ) => {
				return Promise.resolve( args.weather_selection.id === state.weather_id );
			})
			.getArgument('weather_selection')
				.registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteWeatherCondition(args) );
				});

		this._flowTriggerPresence = new Homey.FlowCardTriggerDevice('presence_status').register();

		this._flowTriggerMobileGeoTrackingEnabled = new Homey.FlowCardTriggerDevice('mobile_tracking_changed');
		this._flowTriggerMobileGeoTrackingEnabled.register()
			.registerRunListener(( args, state ) => {
				return Promise.resolve( args.mobile_device_selection.id === state.mobile_id );
			})
			.getArgument('mobile_device_selection')
				.registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevices(args) );
				});

		this._flowTriggerMobileLocation = new Homey.FlowCardTriggerDevice('mobile_location_null_changed')
		this._flowTriggerMobileLocation.register()
			.registerRunListener(( args, state ) => {
				return Promise.resolve( args.mobile_device_selection.id === state.mobile_id );
			})
			.getArgument('mobile_device_selection')
				.registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevicesLocationBased(args) );
				});

		this._flowTriggerMobileTimeSinceLocation = new Homey.FlowCardTriggerDevice('mobile_time_since_location')
		this._flowTriggerMobileTimeSinceLocation.register()
			.registerRunListener(( args, state ) => {
				var minToGo = Number((args.time_out).substr(0,2)) * 60 + Number((args.time_out).substr(3,2)) - state.minutes_since_location,
						minutesRepeat = Number(args.repeat);
				switch(minutesRepeat){
					case 0: var timeValid = (minToGo === 0); break;
					default: var timeValid = ( minToGo <= 0 && ( minToGo % minutesRepeat === 0 ) ); break;
				}
				return Promise.resolve( args.mobile_device_selection.id === state.mobile_id  && timeValid );
			})
			.getArgument('mobile_device_selection')
				.registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevicesLocationBased(args) );
				});

		this._flowTriggerMobileAtHome = new Homey.FlowCardTriggerDevice('mobile_athome_changed');
		this._flowTriggerMobileAtHome.register()
			.registerRunListener(( args, state ) => {
				return Promise.resolve( args.mobile_device_selection.id === state.mobile_id );
			})
			.getArgument('mobile_device_selection')
				.registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevicesLocationBased(args) );
				});

		this._flowTriggerMobileRelativeDistanceFromHomeFence = new Homey.FlowCardTriggerDevice('mobile_distance_changed');
		this._flowTriggerMobileRelativeDistanceFromHomeFence.register()
		.registerRunListener(( args, state ) => {
				return Promise.resolve( args.mobile_device_selection.id === state.mobile_id );
			})
			.getArgument('mobile_device_selection')
				.registerAutocompleteListener(( query, args ) => {
					return Promise.resolve(tadoSub.getAutocompleteMobileDevicesLocationBased(args) );
				});

	}
	
	

	triggerFlowTargetOnOff( device, tokens ) {
		this._flowTriggerTargetOnOff.trigger( device, tokens ).catch( this.error )
	}

	triggerFlowHumidity( device, tokens ) {
		this._flowTriggerHumidity.trigger( device, tokens ).catch( this.error )
	}

	triggerFlowHeatingPower( device, tokens ) {
		this._flowTriggerHeatingPower.trigger( device, tokens ).catch( this.error )
	}

	triggerFlowOpenWindow( device, tokens ) {
		this._flowTriggerOpenWindow.trigger( device, tokens ).catch( this.error )
	}

	triggerFlowACModeChange( device, tokens, state ) {
		this._flowTriggerACModeChange.trigger( device, tokens, state ).catch( this.error )
	}

	triggerFlowSmartHeating( device, tokens ) {
		this._flowTriggerSmartHeating.trigger( device, tokens ).catch( this.error )
	}

	triggerFlowOutsideTemperature( device, tokens ) {
		this._flowTriggerOutsideTemperature.trigger( device, tokens ).catch( this.error )
	}

	triggerFlowSolarIntensity( device, tokens ) {
		this._flowTriggerSolarIntensity.trigger( device, tokens ).catch( this.error )
	}

	triggerFlowWeather( device, tokens, state ) {
		this._flowTriggerWeather.trigger( device, tokens, state ).catch( this.error )
	}

	triggerFlowPresence( device, tokens ) {
		this._flowTriggerPresence.trigger( device, tokens ).catch( this.error )
	}

	triggerFlowBatteryChange( device, tokens ) {
		this._flowTriggerBatteryChange.trigger( device, tokens ).catch( this.error )
	}

	triggerFlowMobileGeoTrackingEnabled( device, tokens, state ) {
		this._flowTriggerMobileGeoTrackingEnabled.trigger( device, tokens, state ).catch( this.error )
	}

	triggerFlowMobileLocation( device, tokens, state ) {
		this._flowTriggerMobileLocation.trigger( device, tokens, state ).catch( this.error )
	}

	triggerFlowMobileTimeSinceLocation( device, tokens, state ) {
		this._flowTriggerMobileTimeSinceLocation.trigger( device, tokens, state ).catch( this.error )
	}

	triggerFlowMobileAtHome( device, tokens, state ) {
		this._flowTriggerMobileAtHome.trigger( device, tokens, state ).catch( this.error )
	}

	triggerFlowMobileRelativeDistanceFromHomeFence( device, tokens, state ) {
		this._flowTriggerMobileRelativeDistanceFromHomeFence.trigger( device, tokens, state ).catch( this.error )
	}


	_onState( state ) {
		// get first time poll info before polling with longer intervals
		if( this.hasCapability('battery_state') ){
			if(this.getCapabilityValue('battery_state') == undefined ){
				this.getZonesInfo()
					.catch( this.error );
			}
		}

		if( this.hasCapability('measure_temperature') && state.sensorDataPoints.insideTemperature ){
			var value = Math.round( 10 * state.sensorDataPoints.insideTemperature.celsius )/10
			if(this.getCapabilityValue('measure_temperature') !== value && value !== undefined ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': insideTemperature changed to: ' + value)
				this.setCapabilityValue('measure_temperature', value).catch( this.error );
			}
		}

		if( this.hasCapability('measure_humidity') && state.sensorDataPoints.humidity ){
			var value = Math.round( state.sensorDataPoints.humidity.percentage )
			if(this.getCapabilityValue('measure_humidity') !== value && value !== undefined ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': humidity changed to: ' + value)
				this.triggerFlowHumidity( this, {'percentage': value } )
				this.setCapabilityValue('measure_humidity', value ).catch( this.error );
			}
		}

		if( this.hasCapability('heating_power') && state.activityDataPoints.heatingPower ){
			var value = Math.round( state.activityDataPoints.heatingPower.percentage )
			if(this.getCapabilityValue('heating_power') !== value && value !== undefined ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': heatingPower changed to: ' + value)
				this.triggerFlowHeatingPower( this, {'percentage': value } )
				this.setCapabilityValue('heating_power', value ).catch( this.error );
			}
		}

		if( this.hasCapability('detect_open_window') ){
			var value = (state.openWindow !== null)
			if(this.getCapabilityValue('detect_open_window') !== value && value !== undefined ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': openWindow changed to: ' + value)
				this.triggerFlowOpenWindow( this, {'detection': value } )
				this.setCapabilityValue('detect_open_window', value ).catch( this.error );
			}
		}
/*
		if( this.hasCapability('smart_heating') ){
			var value = (state.overlayType !== 'MANUAL')
			if(this.getCapabilityValue('smart_heating') !== value && value !== undefined ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': Smart Schedule changed to: ' + value)
				this.triggerFlowSmartHeating( this, {'detection': value } )
				this.setCapabilityValue('smart_heating', value ).catch( this.error );
			}
		}
*/

		if( this.hasCapability('smart_heating') ){
			var value = (state.overlayType !== 'MANUAL')
			if(this.getCapabilityValue('smart_heating') !== value && value !== undefined ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': Smart Schedule changed to: ' + value)
				this.triggerFlowSmartHeating( this, {'detection': value } )
				this.setCapabilityValue('smart_heating', value ).catch( this.error );
			}
		}


		if( this.hasCapability('airco_mode') ){
			var value = state.setting.power
			if(value == 'ON'){
				value = state.setting.mode
			}
			value = value.substr(0,1).toUpperCase() + value.substr(1).toLowerCase();
			value = Homey.__(value)
			if(state.overlay !== null){
				var overlayType = state.overlay.termination.type
				switch(overlayType){
					case 'MANUAL':
						value = value + ' (' + Homey.__('manual') + ')'
						break;

					case 'TIMER':
						var overlayTime = Math.round( Number(state.overlay.termination.remainingTimeInSeconds) / 5) * 5,
								tH = Math.floor( overlayTime / 3600 ),
								tM = Math.floor( (overlayTime - tH * 3600) / 60 ),
								tS = Math.floor( overlayTime - tH * 3600 - tM * 60 );
						if(tM < 10){ tM = '0' + tM;}
						if(tS < 10){ tS = '0' + tS;}
						value = value + ' ' + tH + ':' + tM + ':' + tS
						break;

					case 'TADO_MODE':
						value = value + ' ' + Homey.__('until_schedule')
						break;
				}
			}

			if(this.getCapabilityValue('airco_mode') !== value && value !== undefined ){
				var valCap = this.getCapabilityValue('airco_mode');
				if(valCap === null){ valCap = '-'; }
				var spacePos = value.indexOf(' ')
				if(spacePos == -1){ spacePos = value.length; }
				var acMode = value.substr(0, spacePos );
				if( valCap.substr(0, spacePos ) != acMode ){
					tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': mode changed to: ' + value.substr(0, spacePos ))
					this.triggerFlowACModeChange( this, {}, { 'mode': acMode } )
				}
				this.setCapabilityValue('airco_mode', value ).catch( this.error );
			}
		}


		if( this.hasCapability('target_onoff') ){
			var value = ( state.setting.power == 'ON' )
			if(this.getCapabilityValue('target_onoff') !== value ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ':target_onoff changed to: ' + value);
				this.triggerFlowTargetOnOff( this, {'is_on': value } )
				this.setCapabilityValue('target_onoff', value ).catch( this.error );
			}
		}

		if( this.hasCapability('target_temperature') ){
			var value = this.getCapabilityValue('target_temperature');

			if( state.setting.power == 'OFF' ) { // set to OFF
				switch(state.setting.type){
					case'HEATING': value = 5; break;
					case'HOT_WATER': value = 30; break;
				}
			} else { // set to temperature
				value = Math.round( 10 * state.setting.temperature.celsius )/10;
			}

			if(this.getCapabilityValue('target_temperature') !== value ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': target_temperature changed to: ' + value);
				this.setCapabilityValue('target_temperature', value ).catch( this.error );
			}
		}
	}


	_onWeather( state ) {
		if( this.hasCapability('measure_temperature.outside') && state.outsideTemperature ){
			const value = Number(state.outsideTemperature.celsius);
			if( this.getCapabilityValue('measure_temperature.outside') !== value ){
				tadoSub.doLog('Flow trigger for ' + this.getName() + ': outsideTemperature changed to: ' + value)
				this.triggerFlowOutsideTemperature( this, { 'temperature': value } )
				this.setCapabilityValue('measure_temperature.outside', value ).catch( this.error );
			}
		}

		if( this.hasCapability('solar_intensity') && state.solarIntensity ){
			const value = Number(state.solarIntensity.percentage);
			if( this.getCapabilityValue('solar_intensity') !== value ){
				tadoSub.doLog('Flow trigger for ' + this.getName() + ': solarIntensity changed to: ' + value)
				this.triggerFlowSolarIntensity( this, { 'intensity': value } )
				this.setCapabilityValue('solar_intensity', value ).catch( this.error );
			}
		}

		if( this.hasCapability('weather_state') && state.weatherState ){
			var value = (state.weatherState.value).toLowerCase(),
					conditionExist = false,
					weatherConditionsList = tadoSub.getWeatherConditions();

	    weatherConditionsList.forEach( function( item ){
				if( value === item ){ conditionExist = true; }
	    });
			if( conditionExist ){
				var valueTranslated = Homey.__(value);
			} else {
				tadoSub.doLog( 'new weather condition found: ' + value );
				var valueTranslated = value.replace(/_/g, " ");
				valueTranslated = valueTranslated.substr(0,1).toUpperCase() + valueTranslated.substr(1);
			}

			if(this.getCapabilityValue('weather_state') != valueTranslated ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': weatherState changed to: ' + value + ' (' + valueTranslated + ')' )
				this.triggerFlowWeather( this, {}, {weather_id: value} )
				this.setCapabilityValue('weather_state', valueTranslated ).catch( this.error );
			}
		}
	}

	_onZoneControl( state ) {
		if( this._type == 'AIR_CONDITIONING' ){
			// get hysteresis and minOnOffTimeInSeconds for AIR_CONDITIONING on/off behavior
			if( state.hysteresis ) { // from getZoneControl(homeId, zoneId, 'drivers' )
				this.setStoreValue('hysteresis', state.hysteresis.celsius, function(err, store) {
					if(err) { console.error(err) }
				});
				this.setStoreValue('minOnOffTimeInSeconds', state.minOnOffTimeInSeconds, function(err, store) {
					if(err) { console.error(err) }
				});
			}
		}
	}

	_onMobileDevices( state ) {
		if( this._type == 'TADO_HOME' ){
			var tadoInsights = new TadoInsights;

			tadoInsights.cleanMobileInsights( state );

			// get some first time poll info before polling with longer intervals
			if( this.hasCapability('weather_state') ){
				if(this.getCapabilityValue('weather_state') == undefined ){
						this.getWeather()
							.catch( this.error );
				}
			}

			var currentTimeStamp = new Date().getTime();

			var mobileDevicesBefore = this.getStoreValue('mobileDevices');
			if( mobileDevicesBefore === null ){ // first time run
				mobileDevicesBefore = state.slice();
				mobileDevicesBefore.forEach(function( mobileDevice, mobileIndex ){
					mobileDevicesBefore[mobileIndex] = {
						name: mobileDevice.name,
						id: mobileDevice.id,
						settings: { geoTrackingEnabled: false },
						deviceMetadata: {
							platform: mobileDevice.deviceMetadata.platform,
							osVersion: mobileDevice.deviceMetadata.osVersion,
							model: mobileDevice.deviceMetadata.model,
							locale: mobileDevice.deviceMetadata.locale
						},
						lastChangeTimeStamp: currentTimeStamp,
						minutesSinceLocation: 0
					}
				});
			}


			for(var indexState = 0; indexState < state.length; indexState++ ){
				var itemState = state[indexState];

				itemState.lastChangeTimeStamp = currentTimeStamp
				itemState.minutesSinceLocation = 0;

				for(var indexBefore = 0; indexBefore < mobileDevicesBefore.length; indexBefore++ ){
					var itemPrevious = mobileDevicesBefore[indexBefore]

					if( itemState.id === itemPrevious.id ){
						var mobileLocationUpdated = false, // set true if mobile location data changes
								minSinceLocation = Math.floor((currentTimeStamp - itemPrevious.lastChangeTimeStamp) / 60000);

						itemState.lastChangeTimeStamp = itemPrevious.lastChangeTimeStamp
						itemState.minutesSinceLocation = itemPrevious.minutesSinceLocation
						if( minSinceLocation !== Number( itemPrevious.minutesSinceLocation ) ){
							itemState.minutesSinceLocation = minSinceLocation;
							tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': minutesSinceLocation changed to: ' + minSinceLocation + ' for ' + itemState.name);
							this.triggerFlowMobileTimeSinceLocation(
								this,
								{ 'minutes_since_location': minSinceLocation },
								{ 'mobile_id': itemState.id, 'minutes_since_location': minSinceLocation }
							)
						}

						// check for changes in geoTrackingEnabled
						if( itemState.settings.geoTrackingEnabled !== itemPrevious.settings.geoTrackingEnabled ){
							mobileLocationUpdated = true;
							tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': GeoTrackingEnabled changed to: ' + itemState.settings.geoTrackingEnabled + ' for ' + itemState.name);
							tadoInsights.mobileEntry( itemState, 'geoTrackingEnabled' )
							this.triggerFlowMobileGeoTrackingEnabled(
								this,
								{ 'mobile_geoTrackingEnabled': itemState.settings.geoTrackingEnabled },
								{ 'mobile_id': itemState.id }
							)
						}

						if( itemState.settings.geoTrackingEnabled && itemState.location !== undefined){ // if geoTrackingEnabled...
							tadoInsights.createInitialMobileInsights( itemState )
							// check for location change (valid / null)
							if( ( itemState.location !== null ) !== ( itemPrevious.location !== null ) ){ // change from valid -> null or null -> valid
								var validLocation = ( itemState.location !== null );
								tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': valid location changed to: ' + validLocation + ' for ' + itemState.name);
								this.triggerFlowMobileLocation(
									this,
									{ 'mobile_location': validLocation }
								)
							}

							if ( itemState.location === null ){ // invalid location
								// ...
							} else { // valid location
								if( itemPrevious.location === undefined ||  itemPrevious.location === null ){ // itemPrevious.location = invalid
									// trigger all location-related flows.
									tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': atHome changed to: ' + itemState.location.atHome + ' for ' + itemState.name);
									tadoInsights.mobileEntry( itemState, 'atHome' )
									this.triggerFlowMobileAtHome(
										this,
										{ 'mobile_athome': itemState.location.atHome },
										{ 'mobile_id': itemState.id }
									)

									var rel = Number(itemState.location.relativeDistanceFromHomeFence),
											km = tadoSub.convertRelativeToKilometer(rel),
											mi = tadoSub.convertKilometerToMile(km);

									tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': relativeDistanceFromHomeFence changed to: ' + rel + ' (' + km + 'km)' + ' for ' + itemState.name);
									tadoInsights.mobileEntry( itemState, 'distanceFromHomeFence' )
									this.triggerFlowMobileRelativeDistanceFromHomeFence(
										this,
										{ 'mobile_distance': itemState.location.relativeDistanceFromHomeFence },
										{ 'mobile_id': itemState.id }
									)

								} else { // itemPrevious.location = valid

									// check for atHome change
									if( itemState.location.atHome !== itemPrevious.location.atHome ){
										mobileLocationUpdated = true;
										tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': atHome changed to: ' + itemState.location.atHome + ' for ' + itemState.name);
										tadoInsights.mobileEntry( itemState, 'atHome' )
										this.triggerFlowMobileAtHome(
											this,
											{ 'mobile_athome': itemState.location.atHome },
											{ 'mobile_id': itemState.id }
										)
									}

									// check for relativeDistanceFromHomeFence change
									if( itemState.location.relativeDistanceFromHomeFence !== itemPrevious.location.relativeDistanceFromHomeFence ){
										mobileLocationUpdated = true;
										var rel = Number(itemState.location.relativeDistanceFromHomeFence),
												km = tadoSub.convertRelativeToKilometer(rel),
												mi = tadoSub.convertKilometerToMile(km);

										tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': relativeDistanceFromHomeFence changed to: ' + rel + ' (' + km + 'km)' + ' for ' + itemState.name);
										tadoInsights.mobileEntry( itemState, 'distanceFromHomeFence' )
										this.triggerFlowMobileRelativeDistanceFromHomeFence(
											this,
											{
												'mobile_distance': rel,
												'mobile_kilometers': km,
												'mobile_miles': mi
											},
											{ 'mobile_id': itemState.id }
										)
									} else if( itemState.location.bearingFromHome.degrees !== itemPrevious.location.bearingFromHome.degrees
													|| itemState.location.bearingFromHome.radians !== itemPrevious.location.bearingFromHome.radians ){
										// detect directional change (bearingFromHome) to assist in this mobile device's mobileLocationUpdated.
										tadoSub.doLog( itemState.name + ': location.bearingFromHome change. degrees:' + itemPrevious.location.bearingFromHome.degrees + ', radians:' + itemState.location.bearingFromHome.radians)
										mobileLocationUpdated = true;
										var km = tadoSub.convertRelativeToKilometer( Number(itemState.location.relativeDistanceFromHomeFence) )
										tadoInsights.mobileEntry( itemState, 'distanceFromHomeFence' )
									}

								}
							}
						}

						if(mobileLocationUpdated){ // set lastChangeTimeStamp
							itemState.lastChangeTimeStamp = currentTimeStamp;
							itemState.minutesSinceLocation = 0;
						}

					}
				} // end loop: for(var indexBefore...
				state[indexState] = itemState;
			} //end loop: for(var indexState...

			this.setStoreValue('mobileDevices', state, function(err, store) {
				if(err) { console.error(err) }
			})

			// general presence_status
			var value = false; // false = everyone is out, true =  someone is at home
			var geoOn = false; // true = at least one phone/tablet with location based control
			state.forEach(function(item, index){
				if(item.settings.geoTrackingEnabled){ // LBC enabled
					if(item.location !== null && item.location !== undefined){ // null = no connection for at least about 35 hours
						if(item.location.stale === false){ // false = location is 'fresh'
							value = (value || item.location.atHome)
							geoOn = true;
						}
					}
				}
			});
			if(geoOn === false){ // no mobile device with valid LBC
				value = true; // act like someone is at home. (default when LBC is not used by any phone/tablet)
			}
			if(this.hasCapability('presence_status')) {
  			if(this.getCapabilityValue('presence_status') !== value ){
  				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': Presence changed to: ' + value )
  				this.triggerFlowPresence( this, {'presence': value } )
  				this.setCapabilityValue('presence_status', value ).catch( this.error );
  			}
			}
		}

	}


	_onZonesInfo( state ) { // check battery state
		if( this.hasCapability('battery_state') ){
			var thisZone = this;
			var txtBat = '', // Final mobile capability info
					statusTherm = '', statusValve = '', // mobile capability info for Thermostat / Valves
					tokenStateOk = true, // for token 'OK'
					tokenOkSerial = '', // for token 'OK'
					tokenNotOkSerial = ''; // for token 'Not OK'

			state.forEach(function(zone, indexZone){
				if(zone.id === thisZone._zoneId){
					var statusBattery = {}, // collect device types + batt state. { RU: NORMAL/LOW, VA: NORMAL/LOW }, VA = LOW when one valve (of multiple) is low.
							battNotNormal = [], // collect zone devices with batt not NORMAL { serial: dev.serialNo, batt: dev.batteryState }
							withBattery = 0; // count battery powered zone devices

					txtBat = ''; statusTherm = ''; statusValve = '';
					tokenOkSerial = ''; tokenNotOkSerial = '', tokenStateOk = true;
					zone.devices.forEach(function(dev, indexDev){
						var tadoTypeId = (dev.serialNo).substr(0,2);
						if(dev.batteryState !== undefined){

							withBattery ++;
							if(statusBattery[tadoTypeId] === undefined ){ statusBattery[tadoTypeId] = 'NORMAL'; }
							if(dev.batteryState !== 'NORMAL'){
								battNotNormal.push( { serial: dev.serialNo, batt: dev.batteryState } )
								statusBattery[tadoTypeId] = dev.batteryState;
								if(tokenNotOkSerial !== ''){
									tokenNotOkSerial += ', ';
								}
								tokenNotOkSerial = tokenNotOkSerial + dev.serialNo;
								tokenStateOk = false;
							} else {
								if(tokenOkSerial != ''){
									tokenOkSerial += ', ';
								}
								tokenOkSerial = tokenOkSerial + dev.serialNo;
							}
						}
					});

					var txtComma = tokenOkSerial.lastIndexOf(',');
					if(txtComma > 0){
						tokenOkSerial = tokenOkSerial.substr(0, txtComma) + ' ' + Homey.__('and') + tokenOkSerial.substr(txtComma + 1);
					}
					txtComma = tokenNotOkSerial.lastIndexOf(',');
					if(txtComma > 0){
						tokenNotOkSerial = tokenNotOkSerial.substr(0, txtComma) + ' ' + Homey.__('and') + tokenNotOkSerial.substr(txtComma + 1);
					}

					// compile sensor text info ( statusTherm / statusValve --> txtBat)
					if(statusBattery.RU !== undefined){
						if(statusBattery.RU === 'NORMAL'){
							statusTherm = 'OK';
						} else {
							statusTherm = statusBattery.RU;
						}
					}

					if(statusBattery.VA !== undefined){
						if(statusBattery.VA === 'NORMAL'){
							statusValve = 'OK';
						} else {
							statusValve = statusBattery.VA;
						}
					}

					if(statusTherm !== '' && statusTherm !== 'OK'){ // TEXT -> Text
						statusTherm = statusTherm.substr(0,1).toUpperCase() + statusTherm.substr(1).toLowerCase();
					}
					if(statusValve !== '' && statusValve !== 'OK'){ // TEXT -> Text
						statusValve = statusValve.substr(0,1).toUpperCase() + statusValve.substr(1).toLowerCase();
					}

					var txt1 = '', txt2 = '';
					if(statusTherm !== ''){ // thermostat in zone
						if(statusValve !== ''){ // also valve(s) in zone
							if(statusValve === 'OK'){ // valve(s) batt is NORMAL
								txt1 = Homey.__('Thermostat') + ': ' + statusTherm;
							} else { // valve(s) batt not NORMAL
								txt1 = Homey.__('Therm') + ':' + statusTherm;
							}
						} else { // no valve(s) in zone
							txt1 = statusTherm;
						}
					}

					var valveTranslate = 'Valve';
					if(statusValve !== ''){ // valve(s) in zone
						if(statusTherm !== ''){ // also thermostat in zone
							if(statusTherm === 'OK'){ // thermostat batt is NORMAL
								if(battNotNormal.length > 1){ valveTranslate = 'Valves'; }
								txt2 = Homey.__(valveTranslate) + ': ' + statusValve;
							} else { // thermostat batt not NORMAL
								if(battNotNormal.length > 2){ valveTranslate = 'Valves'; }
								txt2 = Homey.__(valveTranslate) + ':' + statusValve;
							}

						} else { // no thermostat in zone
							if( withBattery > 1 && battNotNormal.length === 1){ // multiple valves, one batt not NORMAL
								txt2 = '1' + Homey.__('Valve') + ': ' + statusValve;

							} else if(( withBattery === 2 && battNotNormal.length === 2) || ( withBattery === 2 && battNotNormal.length === 0)){ // two valves, both batt same value
								txt2 = Homey.__('Both') + ' ' + statusValve;

							} else if((withBattery > 2 && battNotNormal.length === withBattery) || (withBattery > 2 && battNotNormal.length === 0)){ // multiple valves, all batt same value
								txt2 = Homey.__('All') + ' ' + statusValve;

							} else if(withBattery > 2 && battNotNormal.length < withBattery){ // multiple valves, multiple batt not NORMAL
								txt2 = battNotNormal.length + ' ' + Homey.__('Valves') + ' ' + statusValve;

							} else { // single valve
								txt2 = statusValve;
							}

						}
					}

					if( statusTherm === 'OK' && statusValve !== 'OK' && statusValve !== '' ){ // thermostat + valve(s), valve(s) not NORMAL
						txtBat = txt2;
					} else if( statusTherm !== 'OK' && statusTherm !== '' && statusValve === 'OK' ){ // thermostat + valve(s), thermostat not NORMAL
						txtBat = txt1;
					} else if( statusTherm === statusValve && statusTherm !== ''){ // thermostat + valve(s), both have equal value
						if( withBattery === 2){ // 2 battery powered devices
							txtBat = Homey.__('Both') + ' ' + statusTherm;
						} else { // more than 2 battery powered devices
							txtBat = Homey.__('All') + ' ' + statusTherm;
						}
					} else { // thermostat and/or valve(s), and different/no value
						txtBat = txt1;
						if(statusValve !== '' && statusTherm !== ''){txtBat += ', ';}
						txtBat += txt2;
					}

				}
			});

			if(this.getCapabilityValue('battery_state') !== txtBat ){
				tadoSub.doLog( 'Flow trigger for ' + this.getName() + ': battery changed to: ' + txtBat + ', Not Ok: ' + tokenNotOkSerial)
				this.triggerFlowBatteryChange( this, {'state': tokenStateOk, 'isOk': tokenOkSerial, 'isNotOk': tokenNotOkSerial } )
				this.setCapabilityValue('battery_state', txtBat ).catch( this.error );
			}

		}

	}

	_onBatteryBlink(){
		if(this.hasCapability('measure_battery') && this.hasCapability('battery_state')){
			if(this.getCapabilityValue('battery_state') !== null ){

				var valueBatt = this.getCapabilityValue('measure_battery')
				if(this.getCapabilityValue('battery_state').toLowerCase().indexOf('low') >= 0 ){ // batt Low
					if( valueBatt !== 0){
						valueBatt = 0
					} else {
						valueBatt = 30
					}
				} else { // batt OK
					valueBatt = 100
				}
				if( valueBatt !== this.getCapabilityValue('measure_battery') ){
					this.setCapabilityValue('measure_battery', valueBatt ).catch( this.error );
				}
			}
		}
		return true;
	}


	async onFlowActionSetSmart() {
		return this.oAuth2Client.unsetOverlay( this._homeId, this._zoneId);
	}

	async onFlowActionSetOn() {
		// - On Until user intervention, for dev without thermostat
		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"setting": {
				"type": this._type,
				"power": "ON"
			},
			"termination": {
				"type": "MANUAL"
			}
		});
	}

	async onFlowActionSetOnUntilTimer(args) {
		// - On Until set timer ends, for dev without thermostat
		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"setting": {
				"type": this._type,
				"power": "ON"
			},
			"termination": {
				"type": "TIMER",
				"durationInSeconds": Number((args.timer_off).substr(0,2)) * 3600 + Number((args.timer_off).substr(3,2)) * 60
			}
		});
	}

	async onFlowActionSetOnUntilSmart() {
		// - On Until next Smart Schedule change, for dev without thermostat
		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"setting": {
				"type": this._type,
				"power": "ON"
			},
			"termination": {
				"type": "TADO_MODE"
			}
		});
	}

	async onFlowActionSetOff() {
		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"setting": {
				"type": this._type,
				"power": "OFF"
			},
			"termination": {
				"type": "MANUAL"
			}
		});
	}

	async onFlowActionSetOffUntilTimer(args) {
		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"setting": {
				"type": this._type,
				"power": "OFF"
			},
			"termination": {
				"type": "TIMER",
				"durationInSeconds": Number((args.timer_off).substr(0,2)) * 3600 + Number((args.timer_off).substr(3,2)) * 60
			}
		});
	}

	async onFlowActionSetOffUntilSmart() {
		// - Off Until next Smart Schedule change
		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"setting": {
				"type": this._type,
				"power": "OFF"
			},
			"termination": {
				"type": "TADO_MODE"
			}
		});
	}

	async onFlowActionTemperatureUntilTimer(args) {
		var tCelsius = Number(args.temperature.celsius);

		switch( this._type ){
		case 'HOT_WATER':
			if( this._zoneCapabilities.canSetTemperature ){
				var	tadoOverlaySetting = {
					"type": this._type,
					"power": "ON",
					"temperature": { "celsius": tCelsius }
				}

			} else {
				if( tCelsius === 0 ){
					var	tadoOverlaySetting = {
						"type": this._type,
						"power": "OFF"
					}
				} else {
					var	tadoOverlaySetting = {
						"type": this._type,
						"power": "ON",
						"temperature": null
					}
				}

			}
			break;

		case 'HEATING':
			var	tadoOverlaySetting = {
				"type": this._type,
				"power": "ON",
				"temperature": { "celsius": tCelsius }
			}
			break;
		}

		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"type": "MANUAL",
			"setting": tadoOverlaySetting,
			"termination": {
				"type": "TIMER",
				"durationInSeconds": Number((args.timer_off).substr(0,2)) * 3600 + Number((args.timer_off).substr(3,2)) * 60
			}
		})
	}

	async onFlowActionTemperatureAircoUntilTimer(args) {
		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"type": "MANUAL",
			"setting": {
				"type": "AIR_CONDITIONING",
				"power": "ON",
				"mode": (args.airco_mode.mode).toUpperCase(),
				"temperature": { "celsius": Number(args.temperature.celsius) }
			},
			"termination": {
				"type": "TIMER",
				"durationInSeconds": Number((args.timer_off).substr(0,2)) * 3600 + Number((args.timer_off).substr(3,2)) * 60
			}
		})
	}

	async onFlowActionTemperatureUntilSmart(args) {
		var tCelsius = Number(args.temperature.celsius);

		switch( this._type ){
		case 'HOT_WATER':
			if( this._zoneCapabilities.canSetTemperature ){
				var	tadoOverlaySetting = {
					"type": this._type,
					"power": "ON",
					"temperature": { "celsius": tCelsius }
				}
			} else { // has no thermostat. on/off only
				if( tCelsius === 0 ){
					var xPower = 'OFF'
				} else {
					var xPower = 'ON'
				}
				var	tadoOverlaySetting = {
					"type": this._type,
					"power": xPower,
					"temperature": null
				}
			}
			break;

		case 'HEATING':
			var	tadoOverlaySetting = {
				"type": this._type,
				"power": "ON",
				"temperature": { "celsius": tCelsius }
			}
			break;
		}

		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"type": "MANUAL",
			"setting": tadoOverlaySetting,
			"termination": { "type": "TADO_MODE" }
		});
	}

	async onFlowActionTemperatureAircoUntilSmart(args) {
		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"type": "MANUAL",
			"setting": {
				"type": "AIR_CONDITIONING",
				"power": "ON",
				"mode": (args.airco_mode.mode).toUpperCase(),
				"temperature": { "celsius": Number(args.temperature.celsius) }
			},
			"termination": { "type": "TADO_MODE" }
		});
	}


	async _onCapabilityTargetTemperature( value ) {
		switch(this._type){
			case 'AIR_CONDITIONING':
				var modeNow = this.getCapabilityValue('airco_mode').toUpperCase();
				if(modeNow.indexOf(' ') > 0){
					modeNow = modeNow.substr(0, modeNow.indexOf(' '))
				}
				if(modeNow !== 'HEAT'){
					modeNow = 'COOL'
				}
				var objSetting = {
					"type": this._type,
					"power": "ON",
					"mode": modeNow,
					"temperature": {
						"celsius": value
					}
				}
				break;

			case 'HOT_WATER':
			case 'HEATING':
				var objSetting = {
					"type": this._type,
					"power": "ON",
					"temperature": {
						"celsius": value
					}
				}
				break;
		}

		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, {
			"setting": objSetting,
			"termination": {
				"type": "MANUAL"
			}
		}).then(() => {
			return this.getState();
		})
	}

	async _onCapabilityTargetOnOff( value ) {
		if(value){ var xPower = 'ON' } else { var xPower = 'OFF' }

		var objOverlay = {
			"setting": {
				"type": this._type,
				"power": xPower,
				"temperature": null
			},
			"termination": {
				"type": "MANUAL"
			}
		}

		return this.oAuth2Client.setOverlay( this._homeId, this._zoneId, objOverlay ).then(() => {
			return this.getState();
		})
	}

	async _onCapabilityTadoAuto( value ) {
		if( !this.getCapabilityValue('smart_heating') ){ // smart_heating false -> true
			return this.oAuth2Client.unsetOverlay( this._homeId, this._zoneId ).then(() => {
				return this.getState();
			});
		} else { // smart_heating was true already
				return this.getState();
		}
	}

}

module.exports = TadoDeviceThermostat;
