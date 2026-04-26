export type StatusColor = "verde" | "amarillo" | "rojo" | "verde-claro";

export type Coord = {
    lat: number;
    lng: number;
};

export interface LoteCard {
    id: number;
    campo_id: number;
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
    polygon: { lat: number; lng: number }[];
    siembras?: Siembra[];
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

export interface CultivoDB {
    id: number;
    tipo: string;
    variedad: string;
    cultivo_antecesor_id: number | null;
    notas: string;
}

export interface Campania {
    id: number;
    nombre: string;
}

export interface CampaniaDB {
    id: number;
    nombre: string;
    cultivo_id: number;
    campo_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
}

export interface Siembra {
    id: number;
    campania_id: number;
    lote_id: number;
    cultivo_id: number;
    fecha_siembra: string;
    observaciones: string | null;
    cultivo: CultivoDB;
    campania: CampaniaDB;
}

export interface Estado {
    nombre: string;
}

export interface IdLotesPorIdCampania {
    campaniaId: number;
    lotesId: number[];
}

export interface IdCultivoPorIdCampania {
    campaniaId: number;
    cultivosId: number;
}
