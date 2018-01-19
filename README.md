# tado°
Adds support for tado° thermostats.

> Note: If you have a previous version for this app installed, then you need to remove the already added devices and add them again to enable additional functionality.

# Currently supported:
* tado° Smart Thermostat (Heating & Hot water).
* tado° Smart Radiator Thermostat.
* Combination of Smart Thermostat and Smart Radiator Thermostat(s).


# Configuration
* Go to "Zones & Devices" and add tado° devices.
* Enter the same details that you use to access https://my.tado.com.
* Select the devices and add them to Homey.
* You can add multiple Homes by repeating device addition and entering different log-in details.

## How does it work
The app communicates with the online API at my.tado.com and does not directly contact your tado° devices. All data is sent over a secure https connection.

Various capabilities are available:
* Device icon: Tap to disable manual mode and set the zone to Smart schedule.
* Thermostat dial. _0.5 degree steps_.
* Sensor display:
  * Temperature. _not for hot water_.
  * Humidity. _not for hot water_.
  * Heating capacity (%). _not for hot water_.
  * Open Window detection. _not for hot water_.
  * Smart schedule activity.
  * Someone at home?
  * Temperature outside. _Offered by tado°, from external provider_.
  * Solar intensity. _Offered by tado°, from external provider_.
  * Weather conditions. _Offered by tado°, from external provider_.


### Flow Triggers:
  * The target temperature setting has changed. (temperature token)
  * The temperature measurement has changed (temperature token)
  * The humidity measurement has changed (percentage token)
  * The heating capacity has changed (percentage token)
  * Open Window Detection has changed (detection token: true or false)
  * Smart schedule has changed (active token: true or false)
  * Outside temperature has changed (temperature token)
  * Solar intensity has changed (intensity (%) token)
  * The Weather changes (conditions token: [Sunny, Foggy, Thunderstorms etc.], id token: internally used id for comparisons etc.)

### Flow Conditions:
  * Smart schedule is/is not active.
  * Open window detection is/is not active.
  * Someone is at home / Everyone is out.
  * Weather condition is/is not... [Select from currently known possibilities]

### Flow Actions:
  * Set the target temperature (Enables manual mode. 0.5 degree steps)
  * Activate Smart schedule
  * Turn heating off


# History
### 1.1.2
  * Different device icons for:
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
