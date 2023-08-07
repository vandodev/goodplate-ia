import { ItemProps } from "../components/Item";

export function foodContains(items:ItemProps[], foodName:string){
  for(const item of items){
    if(item.name.toLocaleUpperCase() === foodName.toLocaleUpperCase()){
      return true;
    }
  }
  return false
}