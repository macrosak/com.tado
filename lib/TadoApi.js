'use strict';

const events = require('events');
const querystring = require('querystring');

const Homey = require('homey');
const rp = require('request-promise-native');

const SCOPES = [
	'identity:read',
	'home.details:read',
	'home.operation:read',
	'home.operation:write',
	'home.webhooks',
	'home.mobile.devices.details:read',
	'home.mobile.devices.location:read'
]

class TadoApi extends events.EventEmitter {

	constructor() {
		super();

		this._clientId = Homey.env.CLIENT_ID;
		this._clientSecret = Homey.env.CLIENT_SECRET;
		this._oAuth2AuthorizationUrl = `https://auth.tado.com/oauth/authorize`
		this._oAuth2TokenUrl = `https://auth.tado.com/oauth/token`
		this._apiUrl = `https://my.tado.com/api/v2`;
		this._refererUrl = 'https://my.tado.com/';
		this._redirectUri = 'https://callback.athom.com/oauth2/callback';

		this._token = null;
		this._username = null; // legacy
		this._password = null; // legacy
	}

	setToken( token ) {
		this._token = token;
	}

	getToken() {
		return this._token;
	}

	// legacy
	setUsernamePassword( username, password ) {
		this._username = username;
		this._password = password;
		this._clientId = 'tado-web-app';
		this._clientSecret = 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc'; // from https://my.tado.com
	}

	// legacy
	login() {
		return rp({
			method: 'POST',
			url: this._oAuth2TokenUrl,
			form: {
				client_id: this._clientId,
				client_secret: this._clientSecret,
				grant_type: 'password',
				scope: 'home.user',
				username: this._username,
				password: this._password,
			},
			json: true
		}).then(token => {
			this._token = token;
		}).catch( err => {
			if( err.error ) {
				throw new Error( err.error.error || err.error );
			}
			throw err;
		})
	}

	getOAuth2Token( code ) {
		return rp({
			method: 'POST',
			url: this._oAuth2TokenUrl,
			qs: {
				client_id: this._clientId,
				client_secret: this._clientSecret,
				grant_type: 'authorization_code',
				code: code,
				redirect_uri: this._redirectUri
			},
			json: true
		}).catch( err => {
			if( err.error ) {
				throw new Error( err.error.error || err.error );
			}
			throw err;
		})
	}

	refreshOAuth2Token() {
		return rp({
			method: 'POST',
			url: this._oAuth2TokenUrl,
			qs: {
				client_id: this._clientId,
				client_secret: this._clientSecret,
				grant_type: 'refresh_token',
				refresh_token: this._token.refresh_token,
			},
			json: true
		}).catch( err => {
			if( err.error ) {
				throw new Error( err.error.error || err.error );
			}
			throw err;
		})
	}

	getAuthorizationUrl() {
		console.log('this._clientId', this._clientId)
		let qs = querystring.stringify({
			'response_type': 'code',
			'client_id': this._clientId,
			'redirect_uri': this._redirectUri,
			'state': 'homey',
			'scope': SCOPES.join(' '),
		});
		return `${this._oAuth2AuthorizationUrl}?${qs}`;
	}

	getMe() {
		return this._get('/me');
	}

	getHome( homeId ) {
		// .awayRadiusInMeters
		return this._get(`/homes/${homeId}`);
	}

	getZones( homeId ) {
		return this._get(`/homes/${homeId}/zones`);
	}

	getZoneCapabilities( homeId, zoneId ) {
		return this._get(`/homes/${homeId}/zones/${zoneId}/capabilities`);
	}

	getWeather( homeId ) {
		return this._get(`/homes/${homeId}/weather`);
	}

	getState( homeId, zoneId ) {
		return this._get(`/homes/${homeId}/zones/${zoneId}/state`);
	}

	getMobileDevices( homeId ) {
		return this._get(`/homes/${homeId}/mobileDevices`);
	}

	getZoneControl( homeId, zoneId, parameter ) {
		// parameter is optional. Can be: 'drivers' (only for AIR_CONDITIONING)
		if(parameter === undefined || parameter === null || parameter.trim() === '' ) {
			parameter = '';
		} else {
			parameter = '/' + parameter.trim();
		}
		return this._get(`/homes/${homeId}/zones/${zoneId}/control${parameter}`);
	}

	getOverlay( homeId, zoneId ) {
		return this._get(`/homes/${homeId}/zones/${zoneId}/overlay`);
	}

	setOverlay( homeId, zoneId, data ) {
		return this._put(`/homes/${homeId}/zones/${zoneId}/overlay`, data);
	}

	unsetOverlay( homeId, zoneId ) {
		return this._delete(`/homes/${homeId}/zones/${zoneId}/overlay`);
	}


	/*
		API Helper methods
	*/
	async _call( method, path, data, isRefreshed ) {

		if( !this._token )
			throw new Error('not_logged_in');

		return rp({
			method: method,
			url: `${this._apiUrl}${path}`,
			json: data || true,
			headers: {
				Authorization: `Bearer ${this._token.access_token}`
			}
		}).catch( err => {

			// check if access_token is expired, try to refresh it
			if( !isRefreshed && err.statusCode === 401 )
				return ( typeof this._username === 'string' ? this.login() : this.refreshOAuth2Token() )
					.then(token => {
						this.setToken(token);
						this.emit('token', token);
						return this._call( method, path, data, true );
					})

			if( err && err.error ) {
				throw new Error( ( err.error.errors && err.error.errors[0] && err.error.errors[0].code ) || err.error )
			} else {
				throw err;
			}
		})
	}

	_get( path ) {
		return this._call( 'GET', path );
	}

	_post( path, data ) {
		return this._call( 'POST', path, data );
	}

	_put( path, data ) {
		return this._call( 'PUT', path, data );
	}

	_delete( path, data ) {
		return this._call( 'DELETE', path, data );
	}

}

module.exports = TadoApi;
