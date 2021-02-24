'use strict';

const Homey = require('homey');
const { OAuth2Device, OAuth2Token } = require('homey-oauth2app');

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms
const WEATHER_INTERVAL = 15 * 60 * 1000; // 15 minutes in ms
const ZONES_INFO_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms, for getZonesInfo() (battery status)

class TadoDevice extends OAuth2Device {

	onOAuth2Init() {
  	
  	this._onPoll = this._onPoll.bind(this);
  	this._onZonesInfoPoll = this._onZonesInfoPoll.bind(this);
  	this._onWeatherPoll = this._onWeatherPoll.bind(this);

		const {
  		homeId,
  		zoneId,
  		type,
  		zoneCapabilities,
		} = this.getData();
		
		this._homeId = homeId;
		this._zoneId = zoneId;
		this._type = type;
		this._zoneCapabilities = zoneCapabilities;

    this.getAll().catch( this.error );

		// intervals
		this._pollInterval = setInterval(this._onPoll, POLL_INTERVAL);
		if(this._type === 'HEATING' || this._type === 'HOT_WATER'){
			// battery
			this._zonesInfoInterval = setInterval(this._onZonesInfoPoll, ZONES_INFO_INTERVAL);
		}
		if(this._type === 'TADO_HOME'){
			this._weatherInterval = setInterval(this._onWeatherPoll, WEATHER_INTERVAL);
		}

	}
	
	onOAuth2Migrate() {
		const store = this.getStore();
		if(!store.token )
			throw new Error('Missing Access Token');
			
		const token = new OAuth2Token(store.token);
		const sessionId = store.token.jti;
		const configId = this.getDriver().getOAuth2ConfigId();
		
		return {
			sessionId,
			configId,
			token,
		}
	}
	
	onOAuth2MigrateSuccess() {
    this.unsetStoreValue('token');
	}

	getAll() {
		return Promise.all([
			this.getZonesInfo(),
			this.getState(),
			this.getWeather(),
		]);
	}

	getState() {
		return this.oAuth2Client.getState( this._homeId, this._zoneId )
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

		return this.oAuth2Client.getZoneControl( this._homeId, this._zoneId, controlArg.trim() )
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
		return this.oAuth2Client.getWeather( this._homeId )
			.then( state => {
				this._onWeather( state );
			})
	}

	getZonesInfo() {
		return this.oAuth2Client.getZones( this._homeId )
			.then( state => {
				this._onZonesInfo( state );
			})
	}

	doBatteryBlink() {
		return this._onBatteryBlink();
	}

	onOAuth2Deleted() {
		if( this._pollInterval ) clearInterval(this._pollInterval);
		if( this._weatherInterval ) clearInterval(this._weatherInterval);
		if( this._zonesInfoInterval ) clearInterval(this._zonesInfoInterval);
		if( this._batteryBlinkInterval ) clearInterval(this._batteryBlinkInterval);
	}

	_onState( state ) {

	}

	_onWeather( state ) {

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
