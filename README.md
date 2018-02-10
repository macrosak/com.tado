# tado°
Adds support for tado° thermostats and AC Control.

> Note: If you have a previous version for this app installed, then you need to remove the already added devices and add them again to enable additional or changed functionality.
You will also have to repair all tado-related flows because of that.

# Currently supported:
* All types of Heating zones with matching icons for various thermostat configurations.
* Hot Water zone, with or without thermostat control.
* Smart AC Control zone (Still under development. Thermostatic Control only).
* Home, contains capabilities that relate to the entire tado°-home, like weather and the connected mobile devices.

# Configuration
* Be sure that your tado° equipment is properly installed.
* Go to "Zones & Devices" and add tado° devices. Allow pop-ups if you use a browser instead of Homey Desktop.
* Enter the same login details that you use to access https://my.tado.com.
* Select your desired tado° zones and add them to Homey.
* You can add multiple tado° Homes by repeating device addition and entering different login details.

## How does it work
The app communicates with the online tado-API and does not directly contact your tado° equipment. All data is sent over a secure https connection.

Various capabilities are available for information and Flow control:
* Device/Zone icon: Tap to disable manual mode and set the zone to Smart schedule.
* Thermostat dial, or Zone On/Off _(for Hot Water without thermostat)_
* Sensor displays show:
  * Temperature. _(Heating and Air Conditioning)_
  * Humidity. _(Heating and Air Conditioning)_
  * Heating capacity (%). _(Heating)_
  * Open Window detection. _(Heating)_
  * Air Conditioning mode. _(AC Control)_
  * Smart schedule activity.
  * Battery status icon.  _(Thermostats)_
    - Shows some info for one or more thermostats in a tado° zone.
  * Home/Away status. _(Home)_
    - Someone or Nobody is at home.
  * Weather information provided by tado° and OpenWeatherMap.org. _(Home)_
    - Temperature outside.
    - Solar intensity.
    - Weather condition.

* Home device. This device contains capabilities that relate to the entire tado°-home.
  It provides outside temperature, solar intensity, weather condition, a general Home/Away option and various Flow cards to process information from the individual mobile devices that are logged in to the tado° account. This allows you to create additional flows for each individual family member. Example: Let Smart Schedule do its' work but turn down the heating in the kids' bedroom when they are not at home.

### Flow Triggers:
  _Heating, Air Conditioning and Hot Water with thermostat_
  * The target temperature setting changes.
    - token: 'temperature'
  * Smart schedule changes.
    - token: 'active', true or false

  _Hot Water without thermostat_
  * Hot water is switched on or off.
    - token: 'switched on', true or false

  _Heating and Air Conditioning_
  * The temperature measurement changes.
    - token: 'temperature'
  * The humidity measurement changes.
    - token: 'percentage'

  _Heating_
  * The heating capacity changes.
    - token: 'percentage'
  * Open Window Detection changes.
    - token: 'detection', true or false
  * Battery status changes.
    tokens:
    - 'ok', true or false
    - 'good', tado° serial numbers
    - 'low', tado° serial numbers

  _Air Conditioning_
  * Air Conditioning mode changes to....
    - Select: [Off, Cool, Heat, Fan, Dry, Auto] (not all modes may be available for your AC)

  _Home Zone_
  * General Home/Away status changes.
    - token: 'somebody is at home', true or false
  * Mobile Home/Away status changes. [select mobile device]
    - token: 'at home', true or false
  * Location-based control changes. [select mobile device]
    - token: 'location-based control enabled', true or false
  * Distance changes. [select mobile device]
    tokens:
    - 'kilometers from Home Area', 0 - 4000+
    - 'miles from Home Area', 0 - 2500+
    - 'relative distance from Home Area', 0 - 1, several decimals.
  * Timer expires since last location update [select mobile device, set time, set trigger repeats]
    - token: 'minutes (updated at repeat)'
  * Location validity changes. [select mobile device] (invalid = no location update for a very long time)
    - token: 'valid', true or false
  * Outside temperature changes.
    - token: 'temperature'
  * Solar intensity changes.
    - token: 'percentage'
  * The Weather changes to... [select from 19 weather conditions]
    - Sunny, Cloudy, Mostly cloudy, Partly cloudy, Foggy, Drizzle, Scattered rain, Rain, Hail, Rain / hail, Scattered snow, Snow, Scattered rain / snow, Rain / snow, Clear night, Cloudy night, Freezing, Thunderstorm, Windy

### Flow Conditions:
  _Heating, Air Conditioning and Hot Water_
  * Temperature setting is / is not between... [set two temperature values]
  * Smart schedule is / is not active.

  _Heating and Air Conditioning_
  * Temperature is / is not between... [set two temperature values]
  * Humidity is / is not between... [set two percentage values]

  _Heating_
  * Heating capacity is / is not between... [set two percentage values]
  * Open window detection is / is not active.

  _Air Conditioning zones_
  * Air conditioning mode is / is not... [Select from available modes]

  _Home Zone_
  * Someone / Nobody is at home
  * Is at home / away [Select mobile device]
  * Location-based control is on / off for... [Select mobile device]
  * Distance in kilometers is between / not between [Select mobile device and set values]
  * Relative distance is between / not between [Select mobile device and set values]
  * Location updated / not updated in the past time [Select mobile device and set time]
  * Location is valid / invalid for... [Select mobile device]
  * Outside temperature is / is not between... [set values]
  * Solar intensity is / is not between... [set values]
  * Weather condition is / is not... [select from 19 weather conditions]

### Flow Actions:
  _Heating, Air Conditioning and Hot Water with thermostat_
  * Set temperature for a zone (Activates manual mode).
  * Set temperature until time expires (and Smart Schedule takes control).
  * Set temperature until Smart Schedule changes (and takes control).

  _Hot Water zone without thermostat_
  * Enable the zone (Activates manual mode).
  * Zone enabled until time expires (and Smart Schedule takes control).
  * Zone enabled until Smart Schedule changes (and takes control).

  _All zone types_
  * Disable zone (Activates manual mode).
  * Disable zone until time expires (and Smart Schedule takes control).
  * Disable zone until Smart Schedule changes (and takes control).
  * Activate Smart schedule.

----------------------------------------

# History
### 2.0.0
  * New: Smart AC Control. (under development)
  * New: Home device. This device contains all capabilities that relate to the entire tado°-home.
    In addition to outside temperature, solar intensity, weather condition and a general presence option, this device offers various Flow cards for mobile devices that are logged in to the tado account.
  * New: Zone/device icon: Smart Thermostat + 2 or more Smart Radiator Thermostats.
  * New: Battery status icon for Thermostats. (including some flow cards)
  * Additional weather conditions:
    - 'Hail', 'Rain / Hail', 'Scattered snow', 'Scattered rain / snow', 'Rain / snow', 'Freezing'
  * Changed: outside temperature, solar intensity, weather condition and the general presence options are removed from the 'Heating' devices. They are now available from the 'Home' device.
  * Optimized: Significantly reduced network traffic
  * Fixed: Home / Away status.
  * Fixed: Hot Water was only available with thermostat control. Now it is also available for boilers with only on / off control for the Hot Water zone.
  * Several small optimizations.

  * New Flow Triggers:
    - Battery status changes.
    - AC Controller mode changes.
    - Zone is switched on or off. _(for Hot Water without thermostat)_
    - Location-based control changes. [select mobile device] _(for Home zone)_
    - Location validity changes. [select mobile device] _(for Home zone)_
    - Distance changes. [select mobile device] _(for Home zone)_
    - Mobile Home/Away status changes. [select mobile device] _(for Home zone)_

    - Replaced Flow Trigger 'The weather changed' by 'The weather changes to...' [select condition]
      _(was: The weather changes + tokens for condition and id)_

  * New Flow Conditions:
    - Temperature setting is / is not between... [values]
    - Temperature is / is not between... [values]
    - Humidity is / is not between... [values]
    - Heating capacity is / is not between... [values]
    - Air conditioning mode is / is not... [Select mode]
    - Outside temperature is / is not between... [values]
    - Solar intensity is / is not between... [values]
    - Location control is on / off for... [mobile device] _(for Home zone)_
    - Is at home / away... [mobile device] _(for Home zone)_
    - Location is valid / invalid... [mobile device] _(for Home zone)_
    - Distance in kilometers is / is not between... [mobile device, values] _(for Home zone)_
    - Relative distance (0...1) is / is not between... [mobile device, values] _(for Home zone)_

  * New Flow Actions:
    - Switch zone off until Timer stops.
    - Switch zone off until Smart Schedule changes.
    - Set temperature until time expires.
      _(or: Enable zone until time expires, for Hot Water without thermostat)_
    - Set temperature until Smart Schedule changes.
      _(or: Enable zone until Smart Schedule changes, for Hot Water without thermostat)_

### 1.2.1
  * Fix for OAuth2 Authorization

### 1.2.0
  * OAuth2 Authorization

### 1.1.2
  * Different zone icons for:
    - Smart Thermostat only
    - One Smart Radiator Thermostat
    - Multiple Smart Radiator Thermostats
    - Thermostat + one or more Smart Radiator Thermostat(s)
    - Hot water control
  * Bug fix: For each device there were 2 tags & 2 insight logs called `Smart schedule` showing opposite values. Now there's one indicating the actual activity status for `Smart schedule`.

### 1.1.1
  * Bug fix for Weather condition flow card.

### 1.1.0
  * Upgrade bij Alex van den Berg (OpenMind_NL).
  * New: various mobile display items.
  * Removed _Manual control_ switch.
    * Manual mode is enabled when the thermostat is operated.
    * Tap the device icon to enable Smart schedule.
  * New: various flow cards.
  * Small changes.
  * Updated capability icons and app-store images.

### 1.0.0 (November 2017)
  * Initial release by Athom.
  * Basic functionality.
