export type StatusColor = 'verde' | 'amarillo' | 'rojo' | 'verde-claro';
export type Coord = [number, number];
export interface LoteCard {
    id: number;
    id_campo: number;
    name: string;
    hectareas: number;
    caracteristicas: string;
    ph: number;
    napa: number;
    status: string;
    latitude: number;
    longitude: number;
    polygon: { lat: number; lng: number }[];
}
export interface LoteDraft {
    name: string;
    caracteristicas: string;
    hectareas: number;
    status: string;
    lastCrop: string;
    statusColor: StatusColor;
    imageUrl: string;
    latitude: number;   
    longitude: number;
    ph: number;
    napa: number;
    polygon: Coord[];
}

/*export interface LoteDraft {
            id_campo: number;id_campo: number;
            name: string;
            caracteristicas: string;
            hectareas: number;
            status: string;
            lastCrop;
            statusColor;
            imageUrl: PLACEHOLDER_IMAGE;
            latitude,
            longitude,
            ph: number;
            napa: number;
            polygon: { lat: number; lng: number }[];
        }*/


    /*name: string;
    surface: string;
    status: string;
    lastCrop: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    polygon: { lat: number; lng: number }[];
}*/
export type Coord = {
    lat: number;
    lng: number;
};
setPolygon(
    initialData.polygon.map(p => ({
        lat: p.latitude,
        lng: p.longitude
    }))
);