import Body from "@/components/ui/Tabs/Body";
import { ScrollArea } from "@/components/ui/scroll-area";
import { router } from "@inertiajs/react";
import { Eye, MapPin, Pencil, Plus, Trash2} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import FormularioCampo from "./FormularioCampo";
import { statusStyles } from "./mockCampos";
import type { CampoCard, CampoDraft } from "./types";

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
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400";

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
            <div className="h-24 w-full shrink-0 overflow-hidden border-b border-stone-200 bg-stone-100">
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
                    className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[statusColor]}`}
                >
                    {status}
                </span>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col justify-center gap-1.5 p-4 pt-1">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-stone-800">Superficie:</span>
                    <span className="font-normal text-stone-600">{surface}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-stone-800">Cultivo:</span>
                    <span className="font-normal truncate text-stone-600 ml-2">{lastCrop}</span>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-1 border-t border-stone-200 bg-stone-50/50 p-2.5 text-stone-500">
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit();
                    }}
                    className="rounded bg-transparent p-1.5 transition-colors hover:bg-stone-200 hover:text-stone-900"
                    title="Editar campo"
                >
                    <Pencil strokeWidth={1.5} size={16} />
                </button>
                <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    className="rounded bg-transparent p-1.5 transition-colors hover:bg-stone-200 hover:text-stone-900"
                    title="Ver en mapa"
                >
                    <MapPin strokeWidth={1.5} size={16} />
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpenDetail();
                    }}
                    className="rounded bg-transparent p-1.5 transition-colors hover:bg-stone-200 hover:text-stone-900"
                    title="Ver detalle"
                >
                    <Eye strokeWidth={1.5} size={16} />
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete();
                    }}
                    className="rounded bg-transparent p-1.5 transition-colors hover:bg-red-50 hover:text-red-700"
                    title="Eliminar campo"
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
            <div className="flex h-full min-h-0 flex-col bg-[#f9f4ea] p-8 font-sans">
                <div className="mx-auto mb-6 flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gestion de Campos
                    </h1>
                    <button
                        type="button"
                        onClick={handleAbrirCreacion}
                        className="inline-flex w-fit self-end items-center gap-2 rounded-lg bg-[#1d4ed8] px-5 py-2 font-medium text-white shadow-md transition-all hover:bg-blue-700 sm:self-auto"
                    >
                        <Plus size={20} />
                        Nuevo Campo
                    </button>
                </div>

                <ScrollArea className="mx-auto min-h-0 flex-1 w-full max-w-7xl rounded-xl pr-4">
                    {error && (
                        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-8 pb-4 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            <p className="col-span-full text-sm text-gray-600">Cargando campos...</p>
                        ) : campos.length === 0 ? (
                            <p className="col-span-full text-sm text-gray-600">No hay campos registrados.</p>
                        ) : (
                            campos.map((campo) => (
                                <FieldCard
                                    key={campo.id}
                                    {...campo}
                                    onOpenDetail={() => router.visit(`/campo/${campo.id}`)}
                                    onEdit={() => handleAbrirEdicion(campo)}
                                    onDelete={() => {
                                        void handleEliminar(campo.id);
                                    }}
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
