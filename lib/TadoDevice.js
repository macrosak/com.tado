'use strict';

const Homey = require('homey');
const TadoApi = require('./TadoApi');

const POLL_INTERVAL = 5000;
const WEATHER_INTERVAL = 30000;

class TadoDevice extends Homey.Device {

	onInit() {

		let data = this.getData();
		this._homeId = data.homeId;
		this._zoneId = data.zoneId;
		this._type = data.type;

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
			throw new Error('No authorization method found!');
		}

		this._pollInterval = setInterval(this._onPoll.bind(this), POLL_INTERVAL);
		this._weatherInterval = setInterval(this._onWeatherPoll.bind(this), WEATHER_INTERVAL);
	}
	
	_onToken( token ) {
		this._token = token;
		this.setStoreValue('token', token)
			.catch( this.error );
	}
	
	getAll() {
		return Promise.all([
			this.getState(),
			this.getWeather(),
			this.getPresence()
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

	getWeather() {
		return this._api.getWeather( this._homeId )
			.then( state => {
				this._onWeather( state );
			})
	}

	getPresence() {
		return this._api.getMobileDevicesForHome( this._homeId )
			.then( state => {
				this.setAvailable();
				this._onPresence( state );
			})
			.catch( err => {
				this.error( err );
				this.setUnavailable( err );
				throw err;
			})
	}

	onDeleted() {
		if( this._pollInterval ) clearInterval(this._pollInterval);
		if( this._weatherInterval ) clearInterval(this._weatherInterval);
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

	_onPresence( state ) {

	}

	_onPoll() {
		this.getState()
			.catch( this.error );
			
		this.getPresence()
			.catch( this.error );
	}

	_onWeatherPoll() {
		this.getWeather()
			.catch( this.error );
	}

}

module.exports = TadoDevice;
