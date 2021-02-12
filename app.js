'use strict';

const Homey = require('homey');
const { OAuth2App } = require('homey-oauth2app');
const TadoOAuth2Client = require('./lib/TadoOAuth2Client');

const SCOPES = [
  'identity:read',
  'home.details:read',
  'home.operation:read',
  'home.operation:write',
  'home.webhooks',
  'home.mobile.devices.details:read',
  'home.mobile.devices.location:read',
];

class TadoApp extends OAuth2App {

  onOAuth2Init() {
    this.enableOAuth2Debug();
    this.setOAuth2Config({
      client: TadoOAuth2Client,
      apiUrl: 'https://my.tado.com/api/v2',
      tokenUrl: 'https://auth.tado.com/oauth/token',
      authorizationUrl: 'https://auth.tado.com/oauth/authorize',
      scopes: SCOPES,
    });

    if (!Homey.ManagerSettings.get('minTemp')) {
      Homey.ManagerSettings.set('minTemp', 5);
    }

    if (!Homey.ManagerSettings.get('defaultTemp')) {
      Homey.ManagerSettings.set('defaultTemp', 20);
    }

    if (!Homey.ManagerSettings.get('hotwaterTemp')) {
      Homey.ManagerSettings.set('hotwaterTemp', 30);
    }

    this.log('TadoApp is running...');
  }

}

module.exports = TadoApp;
