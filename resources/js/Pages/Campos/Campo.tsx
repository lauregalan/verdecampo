import Body from "@/components/ui/Tabs/Body";
import { ScrollArea } from "@/components/ui/scroll-area";
import { router } from "@inertiajs/react";
import { Eye, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
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
        <div
            role="button"
            tabIndex={0}
            onClick={onOpenDetail}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenDetail();
                }
            }}
            className="flex h-full cursor-pointer flex-col rounded-2xl border border-stone-200 bg-[#fdf8f0] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={`Abrir detalle de ${name}`}
            data-campo-id={id}
        >
            <h3 className="mb-4 text-xl font-bold text-gray-800">{name}</h3>

            <div className="mb-4 h-32 w-full overflow-hidden rounded-xl">
                <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            </div>

            <div className="flex-grow space-y-3">
                <div>
                    <p className="font-medium text-gray-700">Superficie: {surface}</p>
                    <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[statusColor]}`}
                    >
                        {status}
                    </span>
                </div>

                <p className="pt-2 font-medium text-gray-700">
                    Ultimo Cultivo: <span className="font-normal">{lastCrop}</span>
                </p>
            </div>

            <div className="mt-6 flex justify-end gap-4 text-gray-600">
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit();
                    }}
                    className="transition-colors hover:text-blue-600"
                    title="Editar campo"
                >
                    <Pencil size={20} />
                </button>
                <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    className="transition-colors hover:text-blue-600"
                >
                    <MapPin size={20} />
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpenDetail();
                    }}
                    className="transition-colors hover:text-blue-600"
                    title="Ver detalle"
                >
                    <Eye size={20} />
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete();
                    }}
                    className="transition-colors hover:text-red-600"
                    title="Eliminar campo"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};

export default function Campo() {
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
