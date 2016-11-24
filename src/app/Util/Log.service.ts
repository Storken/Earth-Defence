//import { Injectable } from '@angular/core';


export function log(string, obj){
    console.log(string);
    console.log(obj);
  }



//@Injectable()
export class LogService {
  constructor(){};
  public log(string, obj){
      console.log(string);
      console.log(obj);
    }

}
