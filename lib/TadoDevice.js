'use strict';

const Homey = require('homey');
const TadoApi = require('./TadoApi');

const POLL_INTERVAL = 7000;
const WEATHER_INTERVAL = 30000;
const ZONES_INFO_INTERVAL = 60000; // for getZonesInfo() (battery status)

const BATTERY_BLINK_INTERVAL = 1000; // blink when almost empty

class TadoDevice extends Homey.Device {

	onInit() {

		let data = this.getData();
		this._homeId = data.homeId;
		this._zoneId = data.zoneId;
		this._type = data.type;
		this._zoneCapabilities = data.zoneCapabilities;

		let settings = this.getSettings();
		this._username = settings.username;
		this._password = settings.password;

		let store = this.getStore();
		this._token = store.token;

		this._api = new TadoApi();
		if( this._username && this._password ) {

			this._api.setUsernamePassword( this._username, this._password );
			this._api.login().then(() => {
				return this.getAll();
			}).catch( this.error );

		} else if( this._token ) {
			this._api.setToken( this._token );
			this._api.on('token', this._onToken.bind(this))
			this.getAll().catch( this.error );
		} else {
			return this.setUnavailable( new Error('Device has been unauthorized. Please add the device again.') );
		}

		// intervals
		this._pollInterval = setInterval(this._onPoll.bind(this), POLL_INTERVAL);
		if(this._type === 'HEATING' || this._type === 'HOT_WATER'){
			// battery
			this._zonesInfoInterval = setInterval(this._onZonesInfoPoll.bind(this), ZONES_INFO_INTERVAL);
			this._batteryBlinkInterval = setInterval(this._onBatteryBlinkInterval.bind(this), BATTERY_BLINK_INTERVAL);
		}
		if(this._type === 'TADO_HOME'){
			this._weatherInterval = setInterval(this._onWeatherPoll.bind(this), WEATHER_INTERVAL);
		}

	}

	_onToken( token ) {
		this._token = token;
		this.setStoreValue('token', token)
			.catch( this.error );
	}

	getAll() {
		return Promise.all([
			this.getZonesInfo(),
			this.getState(),
			this.getWeather(),
			this.getMobileDevices()
		]);
	}

	getState() {
		return this._api.getState( this._homeId, this._zoneId )
			.then( state => {
				this.setAvailable();
				this._onState( state );
			})
			.catch( err => {
				this.error( err );
				this.setUnavailable( err );
				throw err;
			})
	}

	getZoneControl( controlArg ) {
		// controlArg is optional. Can be 'devices' for AIR_CONDITIONING
		if(controlArg === undefined || controlArg === null || controlArg.trim() === '' ) { controlArg = ''; }

		return this._api.getZoneControl( this._homeId, this._zoneId, controlArg.trim() )
			.then( state => {
				this.setAvailable();
				this._onZoneControl( state );
			})
			.catch( err => {
				this.error( err );
				this.setUnavailable( err );
				throw err;
			})
	}

	getWeather() {
		return this._api.getWeather( this._homeId )
			.then( state => {
				this._onWeather( state );
			})
	}

	getZonesInfo() {
		return this._api.getZones( this._homeId )
			.then( state => {
				this._onZonesInfo( state );
			})
	}

	getMobileDevices() {
		return this._api.getMobileDevices( this._homeId )
			.then( state => {
				this.setAvailable();
				this._onMobileDevices( state );
			})
			.catch( err => {
				this.error( err );
				this.setUnavailable( err );
				throw err;
			})
	}

	doBatteryBlink() {
		return this._onBatteryBlink();
	}


	onDeleted() {
		if( this._pollInterval ) clearInterval(this._pollInterval);
		if( this._weatherInterval ) clearInterval(this._weatherInterval);
		if( this._zonesInfoInterval ) clearInterval(this._zonesInfoInterval);
		if( this._batteryBlinkInterval ) clearInterval(this._batteryBlinkInterval);
	}

	onSettings( oldSettings, newSettings ) {

		let username = newSettings.username;
		let password = newSettings.password;

		let tadoApi = new TadoApi( username, password );
		return tadoApi.login()
			.then(() => {
				this._username = username;
				this._password = password;
				return this.login();
			});
	}

	_onState( state ) {

	}

	_onWeather( state ) {

	}

	_onMobileDevices( state ) {

	}

	_onZoneControl( state ) {

	}

	_onZonesInfo( state ) {

	}

	_onBatteryBlink( state ) {

	}

	_onPoll() {
		if(this._type !== 'TADO_HOME'){ // official tado zone types
			this.getState()
				.catch( this.error );
			if(this._type === 'AIR_CONDITIONING'){
				// hysteresis & minOnOffTimeInSeconds
				this.getZoneControl( 'drivers' )
					.catch( this.error );
			}
		} else { // additional TADO_HOME zone
			this.getMobileDevices()
				.catch( this.error );
		}
	}

	_onWeatherPoll() {
		this.getWeather()
			.catch( this.error );
	}

	_onZonesInfoPoll() {
		this.getZonesInfo()
			.catch( this.error );
	}

	_onBatteryBlinkInterval() {
		this.doBatteryBlink()
	}

}

module.exports = TadoDevice;
