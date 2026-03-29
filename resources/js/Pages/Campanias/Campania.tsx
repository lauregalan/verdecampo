import Body from "@/components/ui/Tabs/Body";
import { ScrollArea } from "@/components/ui/scroll-area";
import Modal from "@/components/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import { router } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

interface CampaniaCard {
    id: number;
    name: string;
    onEdit?: () => void;
    onView?: () => void;
}

interface BackendCampania {
    id: number;
    nombre: string;
    campo_id?: number;
    cultivo_id?: number;
    fecha_inicio?: string;
    fecha_fin?: string | null;
    estado?: string;
}

interface BackendCampo {
    id: number;
    nombre: string;
}

interface BackendCultivo {
    id: number;
    tipo: string;
}

const toCampaniaCard = (campania: BackendCampania): CampaniaCard => ({
    id: campania.id,
    name: campania.nombre,
});

const CampaniaCardItem = ({ id, name, onEdit, onView }: CampaniaCard) => {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onView?.()}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onView?.();
                }
            }}
            className="relative cursor-pointer rounded-2xl border border-stone-200 bg-[#fdf8f0] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={`Abrir detalle de ${name}`}
        >
            <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        </div>
    );
};

export default function Campania() {
    const [campanias, setCampanias] = useState<CampaniaCard[]>([]);
    const [campos, setCampos] = useState<BackendCampo[]>([]);
    const [cultivos, setCultivos] = useState<BackendCultivo[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailCampania, setDetailCampania] = useState<BackendCampania | null>(null);
    const [editingCampaniaId, setEditingCampaniaId] = useState<number | null>(null);
    const [newCampaniaName, setNewCampaniaName] = useState("");
    const [newFechaInicio, setNewFechaInicio] = useState("");
    const [newFechaFin, setNewFechaFin] = useState("");
    const [selectedCultivoId, setSelectedCultivoId] = useState<number | null>(null);
    const [selectedCampoId, setSelectedCampoId] = useState<number | null>(null);
    const [selectedEstado, setSelectedEstado] = useState("Planificada");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const cargarCampanias = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/campanias", {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("No se pudieron obtener las campañas.");
            }

            const payload = (await response.json()) as BackendCampania[];
            const list = Array.isArray(payload) ? payload.map(toCampaniaCard) : [];
            setCampanias(list);
            setError(null);
        } catch {
            setError("Error al cargar campañas desde el backend.");
            setCampanias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarCampos = useCallback(async () => {
        try {
            const response = await fetch("/api/campos", {
                headers: {
                    Accept: "application/json",
                },
            });
            if (!response.ok) throw new Error("No se pudieron obtener los campos.");
            const payload = (await response.json()) as BackendCampo[];
            setCampos(Array.isArray(payload) ? payload : []);
            if (payload.length > 0) {
                setSelectedCampoId(payload[0].id);
            } else {
                setSelectedCampoId(null);
            }
        } catch {
            setCampos([]);
            setSelectedCampoId(null);
        }
    }, []);

    const cargarCultivos = useCallback(async () => {
        try {
            const response = await fetch("/api/cultivos", {
                headers: {
                    Accept: "application/json",
                },
            });
            if (!response.ok) throw new Error("No se pudieron obtener los cultivos.");
            const payload = (await response.json()) as BackendCultivo[];
            setCultivos(Array.isArray(payload) ? payload : []);
            if (payload.length > 0) {
                setSelectedCultivoId(payload[0].id);
            } else {
                setSelectedCultivoId(null);
            }
        } catch {
            setCultivos([]);
            setSelectedCultivoId(null);
        }
    }
    , []);

    useEffect(() => {
        void cargarCampanias();
        void cargarCampos();
        void cargarCultivos();
    }, [cargarCampanias, cargarCampos, cargarCultivos]);

    const resetForm = () => {
        setEditingCampaniaId(null);
        setNewCampaniaName("");
        setNewFechaInicio("");
        setNewFechaFin("");
        setSelectedCampoId(campos.length > 0 ? campos[0].id : null);
        setSelectedCultivoId(cultivos.length > 0 ? cultivos[0].id : null);
        setSelectedEstado("Planificada");
        setFormError(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = async (campaniaId: number) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/campanias/${campaniaId}`, {
                headers: { Accept: "application/json" },
            });
            if (!response.ok) throw new Error("No se pudo obtener la campaña.");
            const data = await response.json();

            setEditingCampaniaId(campaniaId);
            setNewCampaniaName(data.nombre || "");
            setNewFechaInicio(data.fecha_inicio || "");
            setNewFechaFin(data.fecha_fin || "");
            setSelectedCampoId(data.campo_id ?? null);
            setSelectedCultivoId(data.cultivo_id ?? null);
            setSelectedEstado(data.estado ?? "Planificada");
            setFormError(null);
            setShowModal(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar la campaña.");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const openDetailModal = async (campaniaId: number) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/campanias/${campaniaId}`, {
                headers: { Accept: "application/json" },
            });
            if (!response.ok) throw new Error("No se pudo obtener la campaña.");
            const data = (await response.json()) as BackendCampania;
            setDetailCampania(data);
            setShowDetailModal(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar la campaña.");
        } finally {
            setLoading(false);
        }
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setDetailCampania(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!newCampaniaName.trim() || !newFechaInicio.trim()) {
            setFormError("El nombre y la fecha de inicio son obligatorios.");
            return;
        }
        if (!selectedCampoId) {
            setFormError("Debe seleccionar un campo primero.");
            return;
        }

        setSaving(true);
        setFormError(null);

        const payload = {
            campo_id: selectedCampoId,
            nombre: newCampaniaName,
            fecha_inicio: newFechaInicio,
            fecha_fin: newFechaFin || null,
            estado: selectedEstado,
            cultivo_id: selectedCultivoId,
        };

        const url = editingCampaniaId ? `/api/campanias/${editingCampaniaId}` : "/api/campanias";
        const method = editingCampaniaId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                const msg = data?.message || (editingCampaniaId ? "Error al actualizar la campaña." : "Error al crear la campaña.");
                throw new Error(msg);
            }

            await cargarCampanias();
            closeModal();
        } catch (err) {
            setFormError(
                err instanceof Error
                    ? err.message
                    : editingCampaniaId
                    ? "Error al actualizar la campaña."
                    : "Error al crear la campaña."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Body>
            <div className="flex h-full min-h-0 flex-col bg-[#f9f4ea] p-8 font-sans">
                <div className="mx-auto mb-6 flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Campañas</h1>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex w-fit self-end items-center gap-2 rounded-lg bg-[#1d4ed8] px-5 py-2 font-medium text-white shadow-md transition-all hover:bg-blue-700 sm:self-auto"
                    >
                        <Plus size={20} />
                        Nueva Campaña
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
                            <p className="col-span-full text-sm text-gray-600">Cargando campañas...</p>
                        ) : campanias.length === 0 ? (
                            <p className="col-span-full text-sm text-gray-600">No hay campañas registradas.</p>
                        ) : (
                            campanias.map((campania) => (
                                <CampaniaCardItem
                                    key={campania.id}
                                    {...campania}
                                    onView={() => void openDetailModal(campania.id)}
                                    onEdit={() => void openEditModal(campania.id)}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>


            {/*Modal para ver datos de campaña */}
            <Modal show={showDetailModal} onClose={closeDetailModal} maxWidth="lg">
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-gray-900">Detalle de campaña</h2>
                        <button
                            type="button"
                            onClick={closeDetailModal}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {detailCampania ? (
                        <div className="space-y-3">
                            <p><strong>Nombre:</strong> {detailCampania.nombre}</p>
                            <p>
                                <strong>Campo:</strong>{" "}
                                {detailCampania.campo_id
                                    ? campos.find((campo) => campo.id === detailCampania.campo_id)?.nombre ?? "Campo desconocido"
                                    : "N/A"}
                            </p>
                            <p>
                                <strong>Cultivo:</strong>{" "}
                                {detailCampania.cultivo_id
                                    ? cultivos.find((cultivo) => cultivo.id === detailCampania.cultivo_id)?.tipo ?? "Cultivo desconocido"
                                    : "N/A"}
                            </p>
                            <p><strong>Fecha inicio:</strong> {detailCampania.fecha_inicio ?? "N/A"}</p>
                            <p><strong>Fecha fin:</strong> {detailCampania.fecha_fin ?? "N/A"}</p>
                            <p><strong>Estado:</strong> {detailCampania.estado ?? "N/A"}</p>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        closeDetailModal();
                                        void openEditModal(detailCampania.id);
                                    }}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>Cargando datos de la campaña...</p>
                    )}
                </div>
            </Modal>

            {/*Modal para crear nueva campaña */}
            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {editingCampaniaId ? "Editar campaña" : "Crear nueva campaña"}
                        </h2>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {campos.length === 0 && (
                        <p className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
                            Necesitas crear al menos un campo antes de crear campañas.
                        </p>
                    )}

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="campania-nombre" value="Nombre de la campaña" />
                            <TextInput
                                id="campania-nombre"
                                value={newCampaniaName}
                                onChange={(e) => setNewCampaniaName(e.target.value)}
                                placeholder="Ej: Campaña Primavera"
                                className="mt-1 w-full"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="campania-fecha-inicio" value="Fecha de inicio" />
                                <TextInput
                                    id="campania-fecha-inicio"
                                    type="date"
                                    value={newFechaInicio}
                                    onChange={(e) => setNewFechaInicio(e.target.value)}
                                    className="mt-1 w-full"
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="campania-fecha-fin" value="Fecha de fin" />
                                <TextInput
                                    id="campania-fecha-fin"
                                    type="date"
                                    value={newFechaFin}
                                    onChange={(e) => setNewFechaFin(e.target.value)}
                                    className="mt-1 w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="campania-estado" value="Estado" />
                            <select
                                id="campania-estado"
                                value={selectedEstado}
                                onChange={(e) => setSelectedEstado(e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="Planificada">Planificada</option>
                                <option value="En Curso">En Curso</option>
                                <option value="Finalizada">Finalizada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>
                        <div>
                                <InputLabel htmlFor="campania-cultivo" value="Cultivo asociado" />
                                <select
                                    id="campania-cultivo"
                                    value={selectedCultivoId ?? ""}
                                    onChange={(e) => setSelectedCultivoId(Number(e.target.value) || null)}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    {cultivos.map((cultivo) => (
                                        <option key={cultivo.id} value={cultivo.id}>
                                            {cultivo.tipo}
                                        </option>
                                    ))}
                                </select>
                        </div>
                            
                        {campos.length > 0 && (
                            <div>
                                <InputLabel htmlFor="campania-campo" value="Campo asociado" />
                                <select
                                    id="campania-campo"
                                    value={selectedCampoId ?? ""}
                                    onChange={(e) => setSelectedCampoId(Number(e.target.value) || null)}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    {campos.map((campo) => (
                                        <option key={campo.id} value={campo.id}>
                                            {campo.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {formError && (
                        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {formError}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving || campos.length === 0}
                            className="rounded-lg bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? "Guardando..." : editingCampaniaId ? "Actualizar campaña" : "Crear campaña"}
                        </button>
                    </div>
                </form>
            </Modal>
        </Body>
    );
}
