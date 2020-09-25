import {findByIds, InEndpoint, Interface, Device} from 'usb'
import { StringSet, excludeFromSet } from './string-set';
import {typeString, keyTap} from 'robotjs'


//TODO: Change to fs read from cwd for release
const bindings: {readonly [key: string]: string} = require('../../bindings.json')
const actionCodeMap: {readonly [key: string]: string} = require('../../action-codes.json')

const keyboardProtocol = 1
const datOffset = 2;

const actionByteMap :{readonly [key: number]: string} = Object.keys(
  actionCodeMap
).reduce((agg, current) => {
  agg[Number.parseInt(current, 16)] = actionCodeMap[current]
  return agg
}, {} as {[key: number]: string})

const getDevice = (): Device => {
  const deviceId = process.env.DEVICE_ID
  if(!deviceId){
    throw 'specify DEVICE_ID in .env'
  }
  
  const parts = deviceId.split('-')
  if(parts.length != 2){
    throw 'invalid device id. expected "vendorId-productId" hex values'
  }

  const vendorId = Number.parseInt(parts[0], 16);
  const productId = Number.parseInt(parts[1], 16);
  const device = findByIds(vendorId, productId)
  if(!device){
    throw `could not locate device`
  }

  return device
}

interface InpointResult {
 readonly claimed: Interface
 readonly inPoint: InEndpoint
}
const getInPoint = (device: Device): InpointResult => {
  let claimed: Interface|undefined
  let inPoint: InEndpoint|undefined
  device.interfaces.forEach((face) => {
    if(face.descriptor.bInterfaceProtocol !== keyboardProtocol){
      return
    }

    face.endpoints.forEach(endpoint => {
      if(endpoint.direction !== "in" || claimed){
        return
      }
      
      face.claim();
      claimed = face
      inPoint = endpoint as InEndpoint
    })
  })
  if(!inPoint || !claimed){
    throw 'could not locate device input'
  }
  return {claimed, inPoint}
}

const run = () => {
  let keyState: StringSet = {}
  const device = getDevice()
  device.open()
  
  const inPointResult = getInPoint(device)
  const inPoint = inPointResult.inPoint
  const packetSize = inPoint.descriptor.wMaxPacketSize
  inPoint.on('data', (data: Buffer) => {
    if(data.length !== packetSize || data.length < datOffset) {
      console.error(`invalid packet size: ${data.length}`)
      return
    }
    const newState: StringSet = {}
    for(let i = datOffset; i < packetSize; i++){
      const code = data[i]
       if (!code) {
         break
       }
       const key = actionByteMap[code]
       if (key == undefined) {
         continue
       }
       newState[key] = true
    }
    const oldState = keyState
    keyState = newState

    if(!oldState){
      return
    }
    const released = excludeFromSet(oldState, newState)
    Object.keys(released).forEach(key => {
      const binding = bindings[key]
      if(!binding){
        return
      }
      binding.split(" ").forEach(key => {
        const moded = key.split("+")
        if(moded.length <= 1) {
          keyTap(moded[0])
          return
        }
        if(moded.length > 1) {
          console.log(moded[moded.length-1],  moded.slice(0, moded.length-1))
          keyTap(moded[moded.length-1],  moded.slice(0, moded.length-1))
          return
        }
      })
    })
  })
  inPoint.startPoll(1, inPoint.descriptor.wMaxPacketSize)
  console.log("emulating keystrokes...")
  
}
run()