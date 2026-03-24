export type StatusColor = 'verde' | 'amarillo' | 'rojo' | 'verde-claro';

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
            id_campo: number;
            name: string;
            caracteristicas: string;
            hectarea: number;
            status: string;
            lastCrop;
            statusColor;
            imageUrl: PLACEHOLDER_IMAGE;
            latitude,
            longitude,
            ph: number;
            napa: number;
            polygon: { lat: number; lng: number }[];
        }


    /*name: string;
    surface: string;
    status: string;
    lastCrop: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    polygon: { lat: number; lng: number }[];
}*/
