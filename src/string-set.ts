
export type StringSet = {[key:string]: boolean}

export const excludeFromSet = (from: StringSet, exclude: StringSet): StringSet => Object.keys(from).reduce((agg, current) => {
  if(!exclude[current]){
    agg[current] = true
  }
  return agg
}, {} as StringSet)