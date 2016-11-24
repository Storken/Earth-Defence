import {log} from './Log.service';

export class ListenerHandler {

    private listeners: any;

    constructor(private element: any) {
        this.listeners = [];
        log("the element", this.element);
    }

    addEventListener(event: string, f: any) {
        this.element.addEventListener(event, f, false);
        console.log("added", [this.element, event]);
        this.listeners.push({ "event": event, "function": f });
    }

    removeListeners() {
        let el = this.element;
        this.listeners.forEach(listener => {
            el.removeEventListener(listener.event, listener.function);
        });
    }
}