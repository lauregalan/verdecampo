export type StatusColor = 'verde' | 'naranja' | 'violeta';

export interface LoteCard {
    id: number;
    name: string;
    surface: string;
    status: string;
    statusColor: StatusColor;
    lastCrop: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    polygon: { lat: number; lng: number }[];
}

export interface LoteDraft {
    name: string;
    surface: string;
    status: string;
    statusColor: StatusColor;
    lastCrop: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    polygon: { lat: number; lng: number }[];
}
