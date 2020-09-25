import {Device, getDeviceList} from 'usb'
import {StringSet, excludeFromSet} from './string-set'


const pollRate = parseInt(process.env.pollRate || '5000')
console.log(`polling device status every ${pollRate}ms`)

let deviceState: StringSet|undefined = undefined

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

const logDeltas = (desc: string, delta: StringSet) => {
  if(Object.keys(delta).length <= 0){
    return
  }
  console.log(`Devices ${desc}: ${Object.keys(delta).join(',')}`)
}

const update = () => {
  const newDevices = getDeviceList().reduce((agg, device) => {
    agg[getUsbId(device)] = true
    return agg
  }, {} as StringSet)
  const oldDevices = deviceState
  deviceState = newDevices
  if (oldDevices == undefined) {
    return
  }
  
  logDeltas("Dropped", excludeFromSet(oldDevices, newDevices))
  logDeltas("Added", excludeFromSet(newDevices, oldDevices))
}
setInterval(update, pollRate)

