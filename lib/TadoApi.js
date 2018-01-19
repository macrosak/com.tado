'use strict';

const Homey = require('homey');
const rp = require('request-promise-native');

class TadoApi {

	constructor( username, password ) {
		this._clientId = Homey.env.CLIENT_ID || 'tado-web-app';
		this._clientSecret = Homey.env.CLIENT_SECRET || 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc'; // from https://my.tado.com
		this._oAuth2TokenUrl = `https://auth.tado.com/oauth/token`
		this._apiUrl = `https://my.tado.com/api/v2`;
		this._refererUrl = 'https://my.tado.com/';

		this._token = null;

		this._username = username;
		this._password = password;
	}

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
		}).then( result => {
			this._token = result;
			return;
		}).catch( err => {
			if( err.error ) {
				throw new Error( err.error.error || err.error );
			}
			throw err;
		})
	}

	getMe() {
		return this._get('/me');
	}

	getZones( homeId ) {
		return this._get(`/homes/${homeId}/zones`);
	}

	getWeather( homeId ) {
		return this._get(`/homes/${homeId}/weather`);
	}

	getState( homeId, zoneId ) {
		return this._get(`/homes/${homeId}/zones/${zoneId}/state`);
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

	getMobileDevicesForHome( homeId ) {
		return this._get(`/homes/${homeId}/mobileDevices`);
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
				return this.login()
					.then(() => {
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
