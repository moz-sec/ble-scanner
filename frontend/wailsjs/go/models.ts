export namespace main {
	
	export class DeviceRSSI {
	    uuid: string;
	    rssi: number;
	
	    static createFrom(source: any = {}) {
	        return new DeviceRSSI(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.rssi = source["rssi"];
	    }
	}

}

