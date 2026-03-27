export type StatusColor = "verde" | "amarillo" | "rojo" | "verde-claro";

export type Coord = {
    lat: number;
    lng: number;
};

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

export interface Lote {
    id: number;
    nombre: string;
    caracteristicas: string;
    estado: string;
    longitud: number;
    latitud: number;
    hectareas: number;
    idCampo: number;
    ph: number;
    napa: number;
}

export interface Campo {
    id: number;
    nombre: string;
}

export interface CampoDB {
    id: number;
    nombre: string;
    latitud: string;
    longitud: string;
    hectareas: number;
}

export interface Cultivo {
    id: number;
    nombre: string;
}

export interface Campania {
    id: number;
    nombre: string;
}

export interface Estado {
    nombre: string;
}