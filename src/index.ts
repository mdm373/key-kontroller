import {findByIds, InEndpoint, Interface} from 'usb'

const PROTO_KEYBOARD = 1

const run = () => {
  const deviceId = process.env.DEVICE_ID
  if(!deviceId){
    console.error("specify DEVICE_ID in .env")
    return
  }
  
  const parts = deviceId.split('-')
  if(parts.length != 2){
    console.error('invalid device id. expected "vendorId-productId" hex values')
    return
  }

  const vendorId = Number.parseInt(parts[0], 16);
  const productId = Number.parseInt(parts[1], 16);
  const device = findByIds(vendorId, productId)
  if(!device){
    console.error(`could not locate device ${deviceId}`)
    return
  }

  let claimed: Interface|undefined
  let inPoint: InEndpoint|undefined
  
  device.open()
  device.interfaces.forEach((face) => {
    if(face.descriptor.bInterfaceProtocol !== PROTO_KEYBOARD){
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
    console.error('could not locate device input')
    device.close()
    return
  }

  inPoint.on('data', (data: Buffer) => {
    console.log(data.length)
    console.log(data)
  })
  console.log(claimed.descriptor)
  console.log(inPoint.descriptor)

  inPoint.startPoll(1, inPoint.descriptor.wMaxPacketSize)
  
}

run()

