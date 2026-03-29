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
            [-34.6749, -58.5254],
            [-34.6786, -58.5241],
            [-34.6802, -58.5197],
            [-34.6756, -58.5174],
            [-34.6737, -58.5211],
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
            [-34.9395, -60.0534],
            [-34.9444, -60.0542],
            [-34.9462, -60.0486],
            [-34.9423, -60.0436],
            [-34.9388, -60.0471],
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
            [-33.2937, -62.0941],
            [-33.3008, -62.0948],
            [-33.3035, -62.0882],
            [-33.2999, -62.0822],
            [-33.2945, -62.0837],
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
