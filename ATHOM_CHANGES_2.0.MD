v2.0.0 RELEVANT CODE CHANGES / ADDITIONS TO v1.2.1

* additional files:
- drivers/thermostat/tadoAdditional.js
  - getWeatherConditions() returns array with known tado weather condition ids
  - getAutocompleteWeatherCondition(args) returns weather conditions with icons.
  - getAutocompleteTemperature(args) returns temperatures from [min] to [max] in [step] steps
  - getAutocompleteAircoMode(args) returns available Air Conditioning modes with icons.
  - getAutocompleteMobileDevices(args) returns mobile devices connected to tado-account + icon for their current Location-based Control status.
  - getAutocompleteMobileDevicesLocationBased(args) returns Location-based Control mobile devices + current status icon.
  - convertRelativeToKilometer(relativeDistanceFromHomeFence) returns kilometers.
  - convertKilometerToRelative(kilometers) returns relativeDistanceFromHomeFence related number (0-1).
  - convertKilometerToMile(kilometers) returns miles.

- drivers/thermostat/tadoMobileInsights.js
  - createInitialMobileInsights(status) creates initial data for all Insights for status.id
  - mobileInsightsEntry(status, dataName) enters data for Insight dataName_status.id
  - cleanMobileInsights(mobileDevices) removes Insights for not (anymore) connected Mobile devices
  - deleteMobileLog(logName) removes Insight logName
  - mobileTokenEntry( status, dataName ) enters data for FlowToken dataName_status.id
  - cleanMobileTokens( mobileDevices ) removes FlowTokens for not (anymore) connected Mobile devices
  - deleteMobileLog(tokenName) removes FlowToken tokenName

* TadoApi.js additions:
  - getHome( homeId ) for awayRadiusInMeters (radius of Home Area) (not used yet)
  - getZoneControl( homeId, zoneId, parameter ) for AirCo hysteresis and minOnOffTimeInSeconds
  - getZoneCapabilities( homeId, zoneId ) for:
    - temperature min/max/step. Needed for AIR_CONDITIONING, and now also used for other devices like HEATING and HOT_WATER
    - canSetTemperature added to zoneCapabilities for HOT_WATER, to detect whether Thermostat or on/off is available.

* TadoApi.js changes:
  - getMobileDevicesForHome( homeId ) changed to...
    getMobileDevices( homeId ) for mobile devices connected to tado-account

* Additional Device/Zone Maps (driver.js):
  - AIR_CONDITIONING
  - HOT_WATER_ONOFF for HOT_WATER with on/off instead of thermostat.
  - TADO_HOME for detailed mobile device data.

* various changes/additions:
- zoneCapabilities added to devices (TadoDriver.js)
- ZONES_INFO_INTERVAL (60000) added for battery status (TadoDevice.js)
- POLL_INTERVAL set to 7000 instead of 5000 (tado's own web interface uses 10000)
- BATTERY_BLINK_INTERVAL = 1000. for measure_battery indicator.
  100% green = OK, Blink 0%/30% red/yellow = almost empty
- drivers.name changed from 'Thermostat' / 'Thermostaat'  to 'tado° zones'.
- drivers.pair.options.singular set to false (app.json).
  Never showed any problem when adding 5 devices at once (several times).
- replaced Flow card dropdowns with autocompletes. (app.json / driver.js)

* added to device-store:
  - mobileDevices = array containing objects for tado-connected mobile equipment
  - hysteresis (for airco) (not used yet)
  - minOnOffTimeInSeconds (for airco) (not used yet)
