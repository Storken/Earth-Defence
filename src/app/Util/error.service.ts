import { Injectable } from '@angular/core';
import {NavController, Toast} from 'ionic-angular';



@Injectable()
export class ErrorService {

    constructor(private nav: NavController) { }

    show(msg: string) {
        let toast = Toast.prototype;
        toast.setMessage(msg);
        toast.present(this.nav);
    }

}
