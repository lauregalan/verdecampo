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
}

interface BackendCampania {
    id: number;
    nombre: string;
}

interface BackendCampo {
    id: number;
    nombre: string;
}

const toCampaniaCard = (campania: BackendCampania): CampaniaCard => ({
    id: campania.id,
    name: campania.nombre,
});

const CampaniaCardItem = ({ id, name }: CampaniaCard) => {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => router.visit(`/campania/${id}`)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.visit(`/campania/${id}`);
                }
            }}
            className="cursor-pointer rounded-2xl border border-stone-200 bg-[#fdf8f0] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={`Abrir detalle de ${name}`}
        >
            <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        </div>
    );
};

export default function Campania() {
    const [campanias, setCampanias] = useState<CampaniaCard[]>([]);
    const [campos, setCampos] = useState<BackendCampo[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newCampaniaName, setNewCampaniaName] = useState("");
    const [newFechaInicio, setNewFechaInicio] = useState("");
    const [newFechaFin, setNewFechaFin] = useState("");
    const [selectedCampoId, setSelectedCampoId] = useState<number | null>(null);
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

    useEffect(() => {
        void cargarCampanias();
        void cargarCampos();
    }, [cargarCampanias, cargarCampos]);

    const resetForm = () => {
        setNewCampaniaName("");
        setNewFechaInicio("");
        setNewFechaFin("");
        setFormError(null);
    };

    const openModal = () => {
        setShowModal(true);
        setFormError(null);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
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

        try {
            const response = await fetch("/api/campanias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    campo_id: selectedCampoId,
                    nombre: newCampaniaName,
                    fecha_inicio: newFechaInicio,
                    fecha_fin: newFechaFin || null,
                    estado: "Planificada",
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                const msg = data?.message || "Error al crear la campaña.";
                throw new Error(msg);
            }

            await cargarCampanias();
            closeModal();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error al crear la campaña.");
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
                        onClick={openModal}
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
                                <CampaniaCardItem key={campania.id} {...campania} />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-gray-900">Crear nueva campaña</h2>
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
                            {saving ? "Guardando..." : "Crear campaña"}
                        </button>
                    </div>
                </form>
            </Modal>
        </Body>
    );
}
