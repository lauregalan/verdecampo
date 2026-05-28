import { useEffect, useState, useMemo } from "react";
import Modal from "@/components/Modals/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import { X } from "lucide-react";
import api from "@/lib/api";

type CampaignStatus = "Planificada" | "En Curso" | "Finalizada" | "Cancelada";

const statuses: CampaignStatus[] = [
    "Planificada",
    "En Curso",
    "Finalizada",
    "Cancelada",
];

interface BackendCampo {
    id: number;
    nombre: string;
}

interface BackendCultivo {
    id: number;
    tipo: string;
}

interface BackendLote {
    id: number;
    nombre: string;
    campo_id: number;
}

interface BackendCampania {
    id: number;
    campo_id: number | null;
    cultivo_id: number | null;
    nombre: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    estado: CampaignStatus;
}

interface ModalFormularioCampaniaProps {
    show: boolean;
    onClose: () => void;
    editingCampaniaId: number | null;
    campos: BackendCampo[];
    cultivos: BackendCultivo[];
    lotes: BackendLote[];
    onSaved: () => void;
}

export default function ModalFormularioCampania({
    show,
    onClose,
    editingCampaniaId,
    campos,
    cultivos,
    lotes,
    onSaved,
}: ModalFormularioCampaniaProps) {
    const [nombre, setNombre] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [campoId, setCampoId] = useState("");
    const [cultivoId, setCultivoId] = useState("");
    const [estado, setEstado] = useState<CampaignStatus>("Planificada");
    const [selectedLotes, setSelectedLotes] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const lotesFiltrados = useMemo(() => {
        return lotes.filter((lote) => lote.campo_id === Number(campoId));
    }, [lotes, campoId]);

    useEffect(() => {
        if (!show) return;

        if (editingCampaniaId !== null) {
            api.get(`/api/campanias/${editingCampaniaId}`)
                .then((res) => res.json())
                .then((data: BackendCampania) => {
                    setNombre(data.nombre);
                    setFechaInicio(data.fecha_inicio ?? "");
                    setFechaFin(data.fecha_fin ?? "");
                    setCampoId(
                        data.campo_id !== null ? String(data.campo_id) : "",
                    );
                    setCultivoId(
                        data.cultivo_id !== null ? String(data.cultivo_id) : "",
                    );
                    setEstado(data.estado);
                    setFormError(null);
                })
                .catch(() => setFormError("Error al cargar la campaña."));

            // Cargar lotes asociados
            api.get(`/api/campanias/${editingCampaniaId}/lotes`)
                .then((res) => res.json())
                .then((data: { id: number }[]) => {
                    setSelectedLotes(data.map((l) => l.id));
                })
                .catch(() =>
                    setFormError("Error al cargar los lotes asociados."),
                );
        } else {
            setNombre("");
            setFechaInicio("");
            setFechaFin("");
            setCampoId(campos[0] ? String(campos[0].id) : "");
            setCultivoId("");
            setEstado("Planificada");
            setSelectedLotes([]);
            setFormError(null);
        }
    }, [show, editingCampaniaId, campos]);

    const handleClose = () => {
        setFormError(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!nombre.trim() || !fechaInicio.trim()) {
            setFormError("El nombre y la fecha de inicio son obligatorios.");
            return;
        }
        if (!campoId) {
            setFormError("Debes seleccionar un campo para crear la campaña.");
            return;
        }
        if (fechaFin && fechaFin < fechaInicio) {
            setFormError(
                "La fecha de fin no puede ser anterior a la fecha de inicio.",
            );
            return;
        }

        setSaving(true);
        setFormError(null);

        const payload = {
            campo_id: Number(campoId),
            cultivo_id: cultivoId ? Number(cultivoId) : null,
            nombre: nombre.trim(),
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin || null,
            estado,
            lote_ids: selectedLotes,
        };

        try {
            const response = editingCampaniaId
                ? await api.put(`/api/campanias/${editingCampaniaId}`, payload)
                : await api.post("/api/campanias", payload);

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(
                    data?.message ??
                        (editingCampaniaId
                            ? "Error al actualizar la campaña."
                            : "Error al crear la campaña."),
                );
            }

            onSaved();
            handleClose();
        } catch (err) {
            setFormError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar la campaña.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {editingCampaniaId
                            ? "Editar campaña"
                            : "Crear nueva campaña"}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <InputLabel
                            htmlFor="campania-nombre"
                            value="Nombre de la campaña"
                        />
                        <TextInput
                            id="campania-nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: campaña fina 2026"
                            className="mt-2 w-full rounded-2xl border-stone-300 bg-stone-50"
                            required
                        />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="campania-campo"
                            value="Campo asociado"
                        />
                        <select
                            id="campania-campo"
                            value={campoId}
                            onChange={(e) => setCampoId(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                        >
                            <option value="">Selecciona un campo</option>
                            {campos.map((field) => (
                                <option key={field.id} value={String(field.id)}>
                                    {field.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="campania-cultivo"
                            value="Cultivo asociado"
                        />
                        <select
                            id="campania-cultivo"
                            value={cultivoId}
                            onChange={(e) => setCultivoId(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                        >
                            <option value="">Selecciona un cultivo</option>
                            {cultivos.map((cultivo) => (
                                <option
                                    key={cultivo.id}
                                    value={String(cultivo.id)}
                                >
                                    {cultivo.tipo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Lotes asociados" />
                        <div className="mt-2 max-h-32 overflow-y-auto rounded-2xl border border-stone-300 bg-stone-50 p-4">
                            {lotesFiltrados.length === 0 ? (
                                <p className="text-sm text-stone-500">
                                    No hay lotes disponibles para este campo.
                                </p>
                            ) : (
                                lotesFiltrados.map((lote) => (
                                    <label
                                        key={lote.id}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedLotes.includes(
                                                lote.id,
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedLotes((prev) => [
                                                        ...prev,
                                                        lote.id,
                                                    ]);
                                                } else {
                                                    setSelectedLotes((prev) =>
                                                        prev.filter(
                                                            (id) =>
                                                                id !== lote.id,
                                                        ),
                                                    );
                                                }
                                            }}
                                            className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-stone-800">
                                            {lote.nombre}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel
                                htmlFor="campania-fecha-inicio"
                                value="Fecha de inicio"
                            />
                            <TextInput
                                id="campania-fecha-inicio"
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="mt-2 w-full rounded-2xl border-stone-300 bg-stone-50"
                                required
                            />
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="campania-fecha-fin"
                                value="Fecha de fin"
                            />
                            <TextInput
                                id="campania-fecha-fin"
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="mt-2 w-full rounded-2xl border-stone-300 bg-stone-50"
                            />
                        </div>
                    </div>
                    <div>
                        <InputLabel htmlFor="campania-estado" value="Estado" />
                        <select
                            id="campania-estado"
                            value={estado}
                            onChange={(e) =>
                                setEstado(e.target.value as CampaignStatus)
                            }
                            className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                        >
                            {statuses.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {formError && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {formError}
                    </div>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving || campos.length === 0}
                        className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                        {saving
                            ? "Guardando..."
                            : editingCampaniaId
                              ? "Actualizar campaña"
                              : "Crear campaña"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
