[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
![npm](https://img.shields.io/npm/v/homebridge-prusa-link)
![npm](https://img.shields.io/npm/dt/homebridge-prusa-link)

# homebridge-prusa-link

## Homebridge plugin for Prusa Link

This [Homebridge](https://github.com/homebridge/homebridge) plugin allows you to monitor your 3D printer connected via Prusa Link directly from HomeKit.

### Features
* Motion sensor: Triggered when printer finishes.
* Battery state: Shows current print progress in percent.

![image](https://user-images.githubusercontent.com/52078523/183643597-d88ae5ba-5a06-4d70-9f89-fadc638ef1a7.png)

## Installation

If you are new to homebridge, please read the [documentation](https://github.com/homebridge/homebridge) first to set up your own server.

Install homebridge-prusa-link:
```sh
sudo npm install -g homebridge-prusa-link
```

## Configuration

For each printer you want to monitor add a `PrusaLinkDevice` accessory in your homebridge configuration file `config.json`.

Set the required configuration values as follows:
* accessory: "PrusaLinkDevice"
* name: How the printer should be named in your Home App
* ip: The IP adress under which Prusa Link can be reached
* user: The username used to connect to  Prusa Link
* password: The password used to connect to  Prusa Link

### Example
```sh
"accessories": [
{
  "accessory": "PrusaLinkDevice",
  "name": "Prusa Mini",
  "ip": "192.168.1.25",
  "user": "maker",
  "password": "password123"
}
```
