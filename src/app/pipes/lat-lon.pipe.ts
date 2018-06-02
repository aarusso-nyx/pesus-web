import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'latLon'
})
export class LatLonPipe implements PipeTransform {
    private format_coord = p => {
        let d = Math.floor(p)
        let m0 = (p-d)*60
        let m = Math.floor(m0)
        let s = Math.round( 60*(m0-m) )

        if (s==60) { m++; s=0 }
        if (m==60) { d++; m=0 }
        
        return ("" + d + "" + (m>9 ? "° ": "° 0") + m + (s>9 ? "' ": "' 0") + s + "\" ")
    }    
        
    transform(p: number[]): string {
        const lon = this.format_coord(Math.abs(p[0])) + (p[0] >= 0.0 ? ' N' : ' S');
        const lat = this.format_coord(Math.abs(p[1])) + (p[1] >= 0.0 ? ' E' : ' W');
        return lat + '   ' + lon;
    }

}
