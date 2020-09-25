# key-kontroller

> Playing around with custom keyboard macros


## Pre-Requirements

Windows Build Tools
```cmd
# From Admin Escelated Terminal
npm install --global --production windows-build-tools
```

Node Gyp
```cmd
npm install -g node-gyp
```

Set Python Version
```cmd
npm config set python="which python"
```
## Install

```cmd
npm install && npm build
```

See [Node USB](https://github.com/tessel/node-usb) for Windows zadig driver install instructions. The listen script below can help identify the correct USB ID device in zadig.

## Listen

```cmd
npm run listen
```

Used to Identify devices. While running unplug / plug in usb device to see [Zadig](https://zadig.akeo.ie/) usb id of device. Install USB drivers as needed for identified device

## App

Update `DEVICE_ID` in `.env` with identified usb id

Update bindings.json with macros as desired.

> Syntax
> * Keys seperated with single space (IE: h e l l o  w o r l d)
> * Modifiers prefixed with `+` symbol (IE: alt+f4)
> * See [robotjs](https://robotjs.io/docs/syntax#keys) for key modifiers 
> syntax.

```cmd
npm run app
```
