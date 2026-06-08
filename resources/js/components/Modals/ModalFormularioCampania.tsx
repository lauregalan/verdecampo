import { useEffect, useState, useMemo } from "react";
import Modal from "@/components/Modals/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import CalendarDatePicker from "@/components/ui/date-picker";
import { X } from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/Pages/Aplicaciones/utils";

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

// Interfaz para manejar los errores de cada campo por separado
interface FormErrors {
    nombre?: string;
    campoId?: string;
    lotes?: string;
    fechaInicio?: string;
    fechaFin?: string;
    general?: string;
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

    // Reemplazamos el string único por un objeto de errores
    const [errors, setErrors] = useState<FormErrors>({});

    const lotesFiltrados = useMemo(() => {
        return lotes.filter((lote) => lote.campo_id === Number(campoId));
    }, [lotes, campoId]);

    const selectedCampoHasNoLotes = Boolean(campoId) && lotesFiltrados.length === 0;

    useEffect(() => {
        if (!fechaInicio) return;

        const todayStr = new Date().toLocaleDateString('en-CA');

        if (estado === "Cancelada") return;

        if (fechaFin && fechaFin < todayStr) {
            setEstado("Finalizada");
        } else if (fechaInicio <= todayStr && (!fechaFin || fechaFin >= todayStr)) {
            setEstado("En Curso");
        } else if (fechaInicio > todayStr) {
            setEstado("Planificada");
        }
    }, [fechaInicio, fechaFin, estado]);

    useEffect(() => {
        if (!show) return;

        // Limpiamos errores al abrir el modal
        setErrors({});

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
                })
                .catch(() => setErrors({ general: "Error al cargar la campaña." }));

            api.get(`/api/campanias/${editingCampaniaId}/lotes`)
                .then((res) => res.json())
                .then((data: { id: number }[]) => {
                    setSelectedLotes(data.map((l) => l.id));
                })
                .catch(() =>
                    setErrors({ general: "Error al cargar los lotes asociados." }),
                );
        } else {
            setNombre("");
            setFechaInicio("");
            setFechaFin("");
            setCampoId(campos[0] ? String(campos[0].id) : "");
            setCultivoId("");
            setEstado("Planificada");
            setSelectedLotes([]);
        }
    }, [show, editingCampaniaId, campos]);

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    // Validadores dinámicos que se ejecutan al escribir/seleccionar
    const handleNombreChange = (val: string) => {
        setNombre(val);
        if (val.trim()) setErrors(prev => ({ ...prev, nombre: undefined }));
        else setErrors(prev => ({ ...prev, nombre: "El nombre es obligatorio." }));
    };

    const handleCampoChange = (val: string) => {
        setCampoId(val);
        setSelectedLotes([]);
        if (!val) {
            setErrors(prev => ({ ...prev, campoId: "Debes seleccionar un campo." }));
        } else {
            const hasLotes = lotes.some(l => l.campo_id === Number(val));
            setErrors(prev => ({
                ...prev,
                campoId: undefined,
                lotes: !hasLotes ? "Antes de crear una campaña, registra al menos un lote para el campo seleccionado." : "Selecciona al menos un lote."
            }));
        }
    };

    const handleLoteToggle = (loteId: number, checked: boolean) => {
        const nextLotes = checked
            ? [...selectedLotes, loteId]
            : selectedLotes.filter((id) => id !== loteId);

        setSelectedLotes(nextLotes);

        if (nextLotes.length === 0) {
            setErrors(prev => ({ ...prev, lotes: "Selecciona al menos un lote asociado a la campania." }));
        } else {
            setErrors(prev => ({ ...prev, lotes: undefined }));
        }
    };

    const handleFechaInicioChange = (val: string) => {
        setFechaInicio(val);
        if (!val) {
            setErrors(prev => ({ ...prev, fechaInicio: "La fecha de inicio es obligatoria." }));
        } else {
            setErrors(prev => ({
                ...prev,
                fechaInicio: undefined,
                fechaFin: fechaFin && fechaFin < val ? "La fecha de fin no puede ser anterior a la de inicio." : undefined
            }));
        }
    };

    const handleFechaFinChange = (val: string) => {
        setFechaFin(val);
        if (val && val < fechaInicio) {
            setErrors(prev => ({ ...prev, fechaFin: "La fecha de fin no puede ser anterior a la de inicio." }));
        } else {
            setErrors(prev => ({ ...prev, fechaFin: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let hasErrors = false;
        const newErrors: FormErrors = {};

        // Validación de seguridad antes del envío por si no tocaron los campos
        if (!nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio.";
            hasErrors = true;
        }
        if (!campoId) {
            newErrors.campoId = "Debes seleccionar un campo para crear la campaña.";
            hasErrors = true;
        }
        if (selectedCampoHasNoLotes) {
            newErrors.lotes = "Antes de crear una campania, registra al menos un lote para el campo seleccionado.";
            hasErrors = true;
        } else if (selectedLotes.length === 0) {
            newErrors.lotes = "Selecciona al menos un lote asociado a la campania.";
            hasErrors = true;
        }
        if (!fechaInicio.trim()) {
            newErrors.fechaInicio = "La fecha de inicio es obligatoria.";
            hasErrors = true;
        }
        if (fechaFin && fechaFin < fechaInicio) {
            newErrors.fechaFin = "La fecha de fin no puede ser anterior a la de inicio.";
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);
        setErrors({});

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
                throw new Error(
                    await getApiErrorMessage(
                        response,
                        editingCampaniaId
                            ? "Error al actualizar la campania."
                            : "Error al crear la campania.",
                    ),
                );
            }

            onSaved();
            handleClose();
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : "No se pudo guardar la campaña." });
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
                            onChange={(e) => handleNombreChange(e.target.value)}
                            onBlur={(e) => {
                                if (!e.target.value.trim()) setErrors(prev => ({ ...prev, nombre: "El nombre es obligatorio." }));
                            }}
                            placeholder="Ej: campaña fina 2026"
                            className={`mt-2 w-full rounded-2xl bg-stone-50 transition ${
                                errors.nombre
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-stone-300'
                            }`}
                            required
                        />
                        {errors.nombre && <p className="mt-1 text-xs font-medium text-red-600">{errors.nombre}</p>}
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="campania-campo"
                            value="Campo asociado"
                        />
                        <select
                            id="campania-campo"
                            value={campoId}
                            onChange={(e) => handleCampoChange(e.target.value)}
                            className={`mt-2 w-full rounded-2xl border bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:bg-white ${
                                errors.campoId
                                ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500'
                                : 'border-stone-300 focus:border-emerald-500'
                            }`}
                        >
                            <option value="">Selecciona un campo</option>
                            {campos.map((field) => (
                                <option key={field.id} value={String(field.id)}>
                                    {field.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.campoId && <p className="mt-1 text-xs font-medium text-red-600">{errors.campoId}</p>}
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
                        <div className={`mt-2 max-h-32 overflow-y-auto rounded-2xl border bg-stone-50 p-4 transition ${
                            errors.lotes ? 'border-red-500' : 'border-stone-300'
                        }`}>
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
                                            onChange={(e) => handleLoteToggle(lote.id, e.target.checked)}
                                            className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-stone-800">
                                            {lote.nombre}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                        {errors.lotes && <p className="mt-1 text-xs font-medium text-red-600">{errors.lotes}</p>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel
                                htmlFor="campania-fecha-inicio"
                                value="Fecha de inicio"
                            />
                            <div className={errors.fechaInicio ? "rounded-md ring-1 ring-red-500" : ""}>
                                <CalendarDatePicker
                                    value={fechaInicio}
                                    maxDate={fechaFin || undefined}
                                    disableOutOfRange={false}
                                    onChange={handleFechaInicioChange}
                                />
                            </div>
                            {errors.fechaInicio && <p className="mt-1 text-xs font-medium text-red-600">{errors.fechaInicio}</p>}
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="campania-fecha-fin"
                                value="Fecha de fin"
                            />
                            <div className={errors.fechaFin ? "rounded-md ring-1 ring-red-500" : ""}>
                                <CalendarDatePicker
                                    value={fechaFin}
                                    minDate={fechaInicio || undefined}
                                    disableOutOfRange={false}
                                    onChange={handleFechaFinChange}
                                />
                            </div>
                            {errors.fechaFin && <p className="mt-1 text-xs font-medium text-red-600">{errors.fechaFin}</p>}
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

                {/* Error general devuelto por la API (Ej: Campaña Duplicada / Solapamiento) */}
                {errors.general && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errors.general}
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
