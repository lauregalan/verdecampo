import type { CampoCard, StatusColor } from "./types";
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const camposIniciales: CampoCard[] = [
    {
        id: 1,
        name: "La Aurora - Lote 1",
        surface: "80 Ha",
        status: "En Produccion",
        lastCrop: "Maiz",
        statusColor: "verde",
        imageUrl:
            "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=1000",
        latitude: -34.6767,
        longitude: -58.5215,
        polygon: [
            { lat: -34.6749, lng: -58.5254 },
            { lat: -34.6786, lng: -58.5241 },
            { lat: -34.6802, lng: -58.5197 },
            { lat: -34.6756, lng: -58.5174 },
            { lat: -34.6737, lng: -58.5211 },
        ],
    },
    {
        id: 2,
        name: "Campo Verde - Lote 2",
        surface: "120 Ha",
        status: "En Preparacion",
        lastCrop: "Trigo",
        statusColor: "naranja",
        imageUrl:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000",
        latitude: -34.942,
        longitude: -60.049,
        polygon: [
            { lat: -34.9395, lng: -60.0534 },
            { lat: -34.9444, lng: -60.0542 },
            { lat: -34.9462, lng: -60.0486 },
            { lat: -34.9423, lng: -60.0436 },
            { lat: -34.9388, lng: -60.0471 },
        ],
    },
    {
        id: 3,
        name: "El Retiro - Lote 3",
        surface: "150 Ha",
        status: "En Barbecho",
        lastCrop: "Girasol",
        statusColor: "violeta",
        imageUrl:
            "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1000",
        latitude: -33.2975,
        longitude: -62.0888,
        polygon: [
            { lat: -33.2937, lng: -62.0941 },
            { lat: -33.3008, lng: -62.0948 },
            { lat: -33.3035, lng: -62.0882 },
            { lat: -33.2999, lng: -62.0822 },
            { lat: -33.2945, lng: -62.0837 },
        ],
    },
];

export const statusStyles = {
    verde: {
        className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        Icon: CheckCircle2,
    },
    naranja: {
        className: "bg-orange-100 text-orange-700 border border-orange-200",
        Icon: AlertTriangle,
    },
    violeta: {
        className: "bg-purple-100 text-purple-700 border border-purple-200",
        Icon: Clock,
    },
};
