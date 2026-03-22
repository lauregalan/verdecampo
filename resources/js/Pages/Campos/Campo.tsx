import Body from "@/components/ui/Tabs/Body";
import { ScrollArea } from "@/components/ui/scroll-area";
import { router } from "@inertiajs/react";
import { ClipboardPlus, Eye, Layers, MapPin, Pencil, Plus, Trash2} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import FormularioCampo from "./FormularioCampo";
import { statusStyles } from "./mockCampos";
import type { CampoCard, CampoDraft } from "./types";
import { Maximize2, Sprout } from 'lucide-react';
import { ProductoSumary } from './ProductoSumary';
interface FieldCardProps extends CampoCard {
    onOpenDetail: () => void;
    onDelete: () => void;
    onEdit: () => void;
}

interface BackendCampo {
    id: number;
    nombre: string;
    latitud: string;
    longitud: string;
    hectareas: number;
}

const PLACEHOLDER_IMAGE =
    "https://plus.unsplash.com/premium_photo-1661899405263-a0bee333068e?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const toCampoCard = (campo: BackendCampo): CampoCard => ({
    id: campo.id,
    name: campo.nombre,
    surface: `${campo.hectareas} Ha`,
    status: "En Produccion",
    lastCrop: "Sin dato",
    statusColor: "verde",
    imageUrl: PLACEHOLDER_IMAGE,
    latitude: Number.parseFloat(campo.latitud) || 0,
    longitude: Number.parseFloat(campo.longitud) || 0,
    polygon: [],
});

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";


const FieldCard = ({
    id,
    name,
    surface,
    status,
    lastCrop,
    imageUrl,
    statusColor,
    onOpenDetail,
    onDelete,
    onEdit,
}: FieldCardProps) => {
    const config = statusStyles[statusColor];
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
            aria-label={`Abrir detalle de ${name}`}
            data-campo-id={id}
        >
            <div className="h-60 w-full shrink-0 overflow-hidden border-b border-stone-200 bg-stone-100">
                <img
                    src={imageUrl}
                    alt={`Vista de ${name}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 pb-2 space-y-0">
                <CardTitle className="text-base font-bold uppercase tracking-wide text-stone-800 line-clamp-1">
                    {name}
                </CardTitle>
                <span
                    className={`shrink-0 inline-flex items-center rounded-full gap-1 px-1 py-1 text-[10px] font-bold uppercase tracking-wider ${className}`}
                >
                    <Icon className="size-3.5" aria-hidden="true" />
                    <span>{status}</span>                
            </span>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col justify-center gap-1.5 p-4 pt-1">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Maximize2 className="size-4 text-stone-400" aria-hidden="true" />
                        <span className="font-semibold text-stone-800">Superficie:</span>
                    </div>
                    <span className="font-normal text-stone-600">{surface}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Sprout className="size-4 text-stone-400" aria-hidden="true" />
                        <span className="font-semibold text-stone-800">Cultivo:</span>
                    </div>
                    <span className="font-normal truncate text-stone-600 ml-2">{lastCrop}</span>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-1 border-t border-stone-200 bg-stone-50/50 p-2.5 text-stone-600">
                
                {/* NUEVO: Acceso directo a Lotes */}
                <button
                    type="button"
                    className="mr-auto rounded bg-transparent p-1.5 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                    title="Ver lotes de este campo"
                >
                    <Layers strokeWidth={1.5} size={16} />
                </button>

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

                <button
                    type="button"
                    className="rounded bg-transparent p-1.5 transition-colors hover:bg-stone-100 hover:text-stone-900"
                    title="Ver en mapa"
                >
                    <MapPin strokeWidth={1.5} size={16} />
                </button>

                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="rounded bg-transparent p-1.5 transition-colors hover:bg-stone-100 hover:text-stone-900"
                    title="Editar"
                >
                    <Pencil strokeWidth={1.5} size={16} />
                </button>

                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="rounded bg-transparent p-1.5 transition-colors hover:bg-red-50 hover:text-red-700"
                    title="Eliminar"
                >
                    <Trash2 strokeWidth={1.5} size={16} />
                </button>
            </CardFooter>
        </Card>
    );
};
;export default function Campo() {
    const [campos, setCampos] = useState<CampoCard[]>([]);
    const [showFormulario, setShowFormulario] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [campoEditando, setCampoEditando] = useState<CampoCard | null>(null);

    const handleAbrirCreacion = () => {
        setCampoEditando(null);
        setShowFormulario(true);
    };

    const handleAbrirEdicion = (campo: CampoCard) => {
        setCampoEditando(campo);
        setShowFormulario(true);
    };

    const handleCerrarFormulario = () => {
        setShowFormulario(false);
        setCampoEditando(null);
    };

    const cargarCampos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/campos", {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("No se pudieron obtener los campos.");
            }

            const payload = (await response.json()) as BackendCampo[];
            const list = Array.isArray(payload) ? payload.map(toCampoCard) : [];
            setCampos(list);
            setError(null);
        } catch {
            setError("Error al cargar campos desde el backend.");
            setCampos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void cargarCampos();
    }, [cargarCampos]);

    const handleAgregar = async (nuevoCampo: CampoDraft): Promise<boolean> => {
        try {
            const hectareas = Number.isFinite(Number.parseFloat(nuevoCampo.surface))
                ? Math.round(Number.parseFloat(nuevoCampo.surface))
                : 0;

            if (campoEditando) {
                const response = await fetch(`/api/campos/${campoEditando.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        nombre: nuevoCampo.name,
                        latitud: String(nuevoCampo.latitude),
                        longitud: String(nuevoCampo.longitude),
                        hectareas,
                    }),
                });

                if (!response.ok) {
                    throw new Error("No se pudo actualizar el campo.");
                }

                const updatedCampo = (await response.json()) as BackendCampo;
                const updatedCard = toCampoCard(updatedCampo);

                setCampos((prev) =>
                    prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
                );
                setShowFormulario(false);
                setCampoEditando(null);
                setError(null);
                return true;
            }

            const response = await fetch("/api/campos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    nombre: nuevoCampo.name,
                    latitud: String(nuevoCampo.latitude),
                    longitud: String(nuevoCampo.longitude),
                    hectareas,
                }),
            });

            if (!response.ok) {
                throw new Error("No se pudo crear el campo.");
            }

            const createdCampo = (await response.json()) as BackendCampo;
            setCampos((prev) => [toCampoCard(createdCampo), ...prev]);
            setShowFormulario(false);
            setError(null);
            return true;
        } catch {
            setError(campoEditando ? "Error al actualizar el campo." : "Error al crear el campo.");
            return false;
        }
    };

    const handleEliminar = async (id: number) => {
        try {
            const response = await fetch(`/api/campos/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("No se pudo eliminar el campo.");
            }

            setCampos((prev) => prev.filter((campo) => campo.id !== id));
            setError(null);
        } catch {
            setError("Error al eliminar el campo.");
        }
    };


return (
    <Body>
        {/* Eliminamos el p-2 si Body ya tiene padding, o usamos px-6 para balancear */}
        <div className="flex h-full min-h-0 flex-col px-4 py-6 font-sans lg:px-8">
            
            {/* Expandimos el ancho máximo para aprovechar pantallas grandes */}
            <div className="mx-auto mb-8 flex w-full max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Gestión de Campos
                </h1>
                <button
                    type="button"
                    onClick={handleAbrirCreacion}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    Nuevo Campo
                </button>
            </div>

            {/* El Summary también debe seguir el ancho máximo */}
            <div className="mx-auto w-full max-w-[1600px] mb-8">
                <ProductoSumary />
            </div>

            {/* Quitamos pr-4 para que la grid esté centrada perfectamente */}
            <ScrollArea className="mx-auto min-h-0 flex-1 w-full max-w-[1600px]">
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Ajustamos el gap a 6 para que las cards no estén pegadas pero tampoco perdidas */}
                <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {loading ? (
                        <p className="col-span-full text-center py-10 text-stone-500">Cargando campos...</p>
                    ) : campos.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center py-20 text-stone-400">
                            <p>No hay campos registrados aún.</p>
                        </div>
                    ) : (
                        campos.map((campo) => (
                            <FieldCard
                                key={campo.id}
                                {...campo}
                                onOpenDetail={() => router.visit(`/campo/${campo.id}`)}
                                onEdit={() => handleAbrirEdicion(campo)}
                                onDelete={() => handleEliminar(campo.id)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>

        <FormularioCampo
            show={showFormulario}
            onClose={handleCerrarFormulario}
            onSubmit={handleAgregar}
            initialData={campoEditando}
        />
    </Body>
);
}
