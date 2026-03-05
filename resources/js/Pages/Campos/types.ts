export type StatusColor = "verde" | "naranja" | "violeta";
export type Coord = [number, number];

export interface CampoCard {
    id: number;
    name: string;
    surface: string;
    status: string;
    lastCrop: string;
    statusColor: StatusColor;
    imageUrl: string;
    latitude: number;
    longitude: number;
    polygon: Coord[];
}

export type CampoDraft = Omit<CampoCard, "id">;
