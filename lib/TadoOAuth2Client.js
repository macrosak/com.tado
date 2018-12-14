'use strict';

const querystring = require('querystring');
const { fetch, OAuth2Client, OAuth2Token } = require('homey-oauth2app');

module.exports = class TadoOAuth2Client extends OAuth2Client {
  
  onHandleAuthorizationURLScopes({ scopes }) {
    return scopes.join(' ')
  }
  
  async onGetTokenByCode({ code }) {
    const query = querystring.stringify({
      code,
      grant_type: 'authorization_code',
      client_id: this._clientId,
      client_secret: this._clientSecret,
      redirect_uri: this._redirectUrl,      
    });
    
    const res = await fetch(`${this._tokenUrl}?${query}`, {
      method: 'POST',
    });
    
    const body = await res.json();
    return new OAuth2Token(body);
  }
  
  async getMe() {
		return this.get({
  		path: '/me',
    });    
  }
  
  async getHome( homeId ) {
		// .awayRadiusInMeters
		return this.get({
  		path: `/homes/${homeId}`,
    });
	}

	async getZones( homeId ) {
		return this.get({
  		path: `/homes/${homeId}/zones`,
    });
	}

	async getZoneCapabilities( homeId, zoneId ) {
		return this.get({
  		path: `/homes/${homeId}/zones/${zoneId}/capabilities`,
    });
	}

	async getWeather( homeId ) {
		return this.get({
  		path: `/homes/${homeId}/weather`,
    });
	}

	async getState( homeId, zoneId ) {
		return this.get({
  		path: `/homes/${homeId}/zones/${zoneId}/state`,
    });
	}

	async getMobileDevices( homeId ) {
		return this.get({
  		path: `/homes/${homeId}/mobileDevices`,
    });
	}

	async getZoneControl( homeId, zoneId, parameter ) {
		// parameter is optional. Can be: 'drivers' (only for AIR_CONDITIONING)
		if(parameter === undefined || parameter === null || parameter.trim() === '' ) {
			parameter = '';
		} else {
			parameter = '/' + parameter.trim();
		}
		return this.get({
  		path: `/homes/${homeId}/zones/${zoneId}/control${parameter}`,
    });
	}

	async getOverlay( homeId, zoneId ) {
		return this.get({
  		path: `/homes/${homeId}/zones/${zoneId}/overlay`,
    });
	}

	async setOverlay( homeId, zoneId, data ) {
		return this.put({
  		path: `/homes/${homeId}/zones/${zoneId}/overlay`,
  		json: data,
    });
	}

	async unsetOverlay( homeId, zoneId ) {
		return this.delete({
  		path: `/homes/${homeId}/zones/${zoneId}/overlay`,
    });
	}
  
}