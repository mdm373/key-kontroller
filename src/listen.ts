import {on, Device, getDeviceList} from 'usb'

type DeviceMap = {[key:string]: boolean}

const pollRate = parseInt(process.env.pollRate || '5000')
console.log(`polling device status every ${pollRate}ms`)

let deviceState: DeviceMap|undefined = undefined

const getUsbId = (device: Device): string => {
  if (!device){
    return ''
  }
  const desc = device.deviceDescriptor
  if(!desc) {
    return ''
  }
  return `${desc.idVendor.toString(16)}-${desc.idProduct.toString(16)}`
}
const aExclusiveOfB = (a: DeviceMap, b: DeviceMap): DeviceMap => Object.keys(a).reduce((agg, current) => {
  if(!b[current]){
    agg[current] = true
  }
  return agg
}, {} as DeviceMap)

const logDeltas = (desc: string, delta: DeviceMap) => {
  if(Object.keys(delta).length <= 0){
    return
  }
  console.log(`Devices ${desc}: ${Object.keys(delta).join(',')}`)
}

const update = () => {
  const newDevices = getDeviceList().reduce((agg, device) => {
    agg[getUsbId(device)] = true
    return agg
  }, {} as DeviceMap)
  const oldDevices = deviceState
  deviceState = newDevices
  if (oldDevices == undefined) {
    return
  }
  
  logDeltas("Dropped", aExclusiveOfB(oldDevices, newDevices))
  logDeltas("Added", aExclusiveOfB(newDevices, oldDevices))
}
setInterval(update, pollRate)

