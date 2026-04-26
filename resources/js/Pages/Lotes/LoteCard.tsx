import { Lote } from "./types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Maximize2, MapPin, Pencil, Sprout, Trash2, Eye, Layers, ClipboardPlus, Timer, Tractor, Check} from "lucide-react";
import { useCallback } from "react";
import { statusStyles } from "../Campos/mockCampos";

interface LoteCardProps {
    lote: Lote;
    onOpenDetail: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isProductor: boolean;
}

export default function LoteCard ({ lote, onOpenDetail, onEdit, onDelete, isProductor }: LoteCardProps) {
    const config = statusStyles["verde"];
    const { className, Icon } = config;

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
                {(() => {
                    switch (lote.estado) {
                        case "produccion":
                            return <div className="h-full w-full bg-cover bg-center bg-green-500 flex items-center justify-center">
                                <Sprout size={48} className="text-white opacity-80" aria-hidden="true" />
                            </div>;
                        case "barbecho":
                            return <div className="h-full w-full bg-cover bg-center bg-red-500 flex items-center justify-center">
                                <Timer size={48} className="text-white opacity-80" aria-hidden="true" />
                            </div>;
                        case "preparacion":
                            return <div className="h-full w-full bg-cover bg-center bg-yellow-500 flex items-center justify-center">
                                <Tractor size={48} className="text-white opacity-80" aria-hidden="true" />
                            </div>;
                        case "disponible":
                            return <div className="h-full w-full bg-cover bg-center bg-green-200 flex items-center justify-center">
                                <Check size={48} className="text-white opacity-80" aria-hidden="true" />
                            </div>;
                        default:
                            return <div className="h-full w-full bg-cover bg-center bg-grey-500"/>;
                    }
                })()}
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
                        <Maximize2 className="size-4 text-stone-400" aria-hidden="true" />
                        <span className="font-semibold text-stone-800">Superficie:</span>
                    </div>
                    <span className="font-normal text-stone-600">{lote.hectareas}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Sprout className="size-4 text-stone-400" aria-hidden="true" />
                        <span className="font-semibold text-stone-800">Cultivo:</span>
                    </div>
                    <span className="font-normal truncate text-stone-600 ml-2">
                        {(() => {
                            const siembrasEnCurso = lote.siembras?.filter(
                                (s) =>
                                    s.campania?.estado?.toLowerCase() ===
                                    "en curso",
                            ) || [];
                            if (siembrasEnCurso.length > 0) {
                                const siembraReciente = siembrasEnCurso.sort(
                                    (a, b) =>
                                        new Date(b.fecha_siembra).getTime() -
                                        new Date(a.fecha_siembra).getTime(),
                                )[0];
                                return siembraReciente.cultivo?.tipo ||
                                    "Sin siembras";
                            }
                            return "Sin siembras";
                        })()}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-1 border-t border-stone-200 bg-stone-50/50 p-2.5 text-stone-600">
                
                {/* NUEVO: Acceso directo a Lotes */}
                {/* NUEVO: Registrar actividad rápida */}
                <button
                    type="button"
                    className="rounded bg-transparent p-1.5 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    title="Registrar labor/actividad"
                >
                    <ClipboardPlus strokeWidth={1.5} size={16} />
                </button>

                {/* Botones actuales mejorados */}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenDetail(); }}
                    className="rounded bg-transparent p-1.5 transition-colors hover:bg-stone-100 hover:text-stone-900"
                    title="Ver detalle completo"
                >
                    <Eye strokeWidth={1.5} size={16} />
                </button>

                {isProductor && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="rounded bg-transparent p-1.5 transition-colors hover:bg-stone-100 hover:text-stone-900"
                        title="Editar"
                    >
                        <Pencil strokeWidth={1.5} size={16} />
                    </button>
                )}

                {isProductor && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="rounded bg-transparent p-1.5 transition-colors hover:bg-red-50 hover:text-red-700"
                        title="Eliminar"
                    >
                        <Trash2 strokeWidth={1.5} size={16} />
                    </button>
                )}
            </CardFooter>
        </Card>
    );
};