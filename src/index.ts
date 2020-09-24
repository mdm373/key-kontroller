import {findByIds, InEndpoint, Interface, Device} from 'usb'

const keyboardProtocol = 1
const datOffset = 2;

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
      console.log(endpoint.direction)
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
    for(let i = datOffset; i < packetSize; i++){
       
    }
    console.log(data.length)
    console.log(data)
  })
  inPoint.startPoll(1, inPoint.descriptor.wMaxPacketSize)
  
}

run()
