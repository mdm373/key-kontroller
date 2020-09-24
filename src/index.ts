import {findByIds} from 'usb'

const device = findByIds(8352, 16941)
console.log(device)
device.open()
device.close()