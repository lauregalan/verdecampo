import { Lote } from "./types";
import {
    Maximize2,
    Pencil,
    Sprout,
    Trash2,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { statusStyles } from "../Campos/mockCampos";

const LOTE_IMAGES = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=1200&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?q=80&w=1200&auto=format&fit=crop",
];

interface LoteCardProps {
    lote: Lote;
    fieldName: string;
    onOpenDetail: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isProductor: boolean;
}

export default function LoteCard({
    lote,
    onOpenDetail,
    onEdit,
    onDelete,
    isProductor,
}: LoteCardProps) {
    const config = statusStyles["verde"];
    const { className, Icon } = config;
    const imageUrl = LOTE_IMAGES[Math.abs(lote.id) % LOTE_IMAGES.length];

    const getCultivoActual = () => {
        const siembrasEnCurso =
            [...(lote.siembras ?? [])].filter(
                (siembra) =>
                    siembra.campania?.estado?.toLowerCase() === "en curso",
            ) ?? [];

        if (siembrasEnCurso.length === 0) {
            return "Sin siembras";
        }

        const siembraReciente = siembrasEnCurso.sort(
            (a, b) =>
                new Date(b.fecha_siembra).getTime() -
                new Date(a.fecha_siembra).getTime(),
        )[0];

        return siembraReciente.cultivo?.tipo || "Sin siembras";
    };

    return (
        <Card
            role="button"
            tabIndex={0}
            onClick={onOpenDetail}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenDetail();
                }
            }}
            className="group flex h-full cursor-pointer flex-col overflow-hidden border-stone-300 bg-[#FCFBF8] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/50"
            aria-label={`Abrir detalle de ${lote.nombre}`}
            data-lote-id={lote.id}
        >
            <div className="h-60 w-full shrink-0 overflow-hidden border-b border-stone-200 bg-stone-100">
                <img
                    src={imageUrl}
                    alt={`Vista agricola de ${lote.nombre}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 pb-2 space-y-0">
                <CardTitle className="text-base font-bold uppercase tracking-wide text-stone-800 line-clamp-1">
                    {lote.nombre}
                </CardTitle>
                <span
                    className={`shrink-0 inline-flex items-center rounded-full gap-1 px-1 py-1 text-[10px] font-bold uppercase tracking-wider ${className}`}
                >
                    <Icon className="size-3.5" aria-hidden="true" />
                    <span>{lote.estado}</span>
                </span>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col justify-center gap-1.5 p-4 pt-1">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Maximize2
                            className="size-4 text-stone-400"
                            aria-hidden="true"
                        />
                        <span className="font-semibold text-stone-800">
                            Superficie:
                        </span>
                    </div>
                    <span className="font-normal text-stone-600">
                        {lote.hectareas}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Sprout
                            className="size-4 text-stone-400"
                            aria-hidden="true"
                        />
                        <span className="font-semibold text-stone-800">
                            Cultivo:
                        </span>
                    </div>
                    <span className="font-normal truncate text-stone-600 ml-2">
                        {getCultivoActual()}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-1 border-t border-stone-200 bg-stone-50/50 p-2.5 text-stone-600">
                {isProductor && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="rounded bg-transparent p-1.5 transition-colors hover:bg-stone-100 hover:text-stone-900"
                        title="Editar"
                    >
                        <Pencil strokeWidth={1.5} size={16} />
                    </button>
                )}

                {isProductor && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="rounded bg-transparent p-1.5 transition-colors hover:bg-red-50 hover:text-red-700"
                        title="Eliminar"
                    >
                        <Trash2 strokeWidth={1.5} size={16} />
                    </button>
                )}
            </CardFooter>
        </Card>
    );
}
