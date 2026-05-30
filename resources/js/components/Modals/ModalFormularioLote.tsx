import { FormEvent, useCallback, useEffect, useState } from "react";
import Modal from "@/components/Modals/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import MapaInteractivo from "@/Pages/Campos/MapaInteractivo";
import type {
    Coord,
    LoteCard,
    LoteDraft,
    StatusColor,
} from "@/Pages/Lotes/types";
import { X } from "lucide-react";
import api from "@/lib/api";

interface ModalFormularioLoteProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (
        lote: LoteDraft,
        campoId: number | string,
    ) => Promise<Record<string, string> | null>;
    initialData?: LoteCard | null;
    campoId: number | string;
}

const STATUS_OPTIONS: { label: string; value: string; color: StatusColor }[] = [
    { label: "En Producción", value: "produccion", color: "verde" },
    { label: "En Preparación", value: "preparacion", color: "amarillo" },
    { label: "En Barbecho", value: "barbecho", color: "rojo" },
    { label: "Disponible", value: "disponible", color: "verde-claro" },
];

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400";

export default function ModalFormularioLote({
    show,
    onClose,
    onSubmit,
    initialData,
    campoId,
}: ModalFormularioLoteProps) {
    const [name, setName] = useState("");
    const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
    const [statusColor, setStatusColor] = useState<StatusColor>(
        STATUS_OPTIONS[0].color,
    );
    const [lastCrop, setLastCrop] = useState("");
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [hectareas, setHectareas] = useState<number>(0);
    const [polygon, setPolygon] = useState<Coord[]>([]);
    const [caracteristicas, setCaracteristicas] = useState("");
    const [ph, setPh] = useState(0);
    const [napa, setNapa] = useState(0);
    const [campos, setCampos] = useState<{ id: number; nombre: string }[]>([]);
    const [campoSeleccionado, setCampoSeleccionado] = useState<number | string>(
        campoId,
    );
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const HECTAREAS_MIN = 0;
    const HECTAREAS_MAX = 999999.99;

    useEffect(() => {
        const fetchCampos = async () => {
            try {
                const res = await api.get("/api/campos");
                if (!res.ok) throw new Error();
                const data = await res.json();
                setCampos(data);
            } catch {
                console.error("Error al cargar campos");
            }
        };
        if (show) fetchCampos();
    }, [show]);

    useEffect(() => {
        if (show && initialData) {
            setName(initialData.name);
            setStatus(initialData.status);
            setStatusColor("verde");
            setLastCrop("falta implementar");
            setLatitude(initialData.latitude);
            setLongitude(initialData.longitude);
            setHectareas(initialData.hectareas ?? 0);
            setPolygon(initialData.polygon || []);
            setCaracteristicas(initialData.caracteristicas);
            setPh(initialData.ph);
            setNapa(initialData.napa);
            setCampoSeleccionado(initialData.campo_id);
        } else if (show && !initialData) {
            resetForm();
        }
    }, [show, initialData]);

    const handleCenterChange = useCallback((lat: number, lng: number) => {
        if (lat !== 0 || lng !== 0) {
            setLatitude(parseFloat(lat.toFixed(6)));
            setLongitude(parseFloat(lng.toFixed(6)));
        }
    }, []);

    const handleAreaChange = useCallback((ha: number) => {
        const normalized = Math.min(Math.max(ha, HECTAREAS_MIN), HECTAREAS_MAX);
        setHectareas(normalized);
    }, []);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        const match = STATUS_OPTIONS.find((o) => o.value === value);
        if (match) setStatusColor(match.color);
    };

    const resetForm = () => {
        setName("");
        setStatus(STATUS_OPTIONS[0].value);
        setStatusColor(STATUS_OPTIONS[0].color);
        setCaracteristicas("");
        setPh(7);
        setNapa(0);
        setLastCrop("");
        setCampoSeleccionado(campoId || "");
        setHectareas(0);
        setPolygon([]);
        setFieldErrors({});
        setAttemptedSubmit(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setAttemptedSubmit(true);
        const nextErrors: Record<string, string> = {};

        if (!name.trim()) {
            nextErrors.name = "El nombre del lote es obligatorio.";
        }

        if (!campoSeleccionado) {
            nextErrors.campo = "Selecciona un campo antes de guardar el lote.";
        }

        if (!caracteristicas.trim()) {
            nextErrors.caracteristicas =
                "Las caracteristicas del lote son obligatorias.";
        }

        if (hectareas < HECTAREAS_MIN || hectareas > HECTAREAS_MAX) {
            nextErrors.hectareas = `La superficie debe estar entre ${HECTAREAS_MIN} y ${HECTAREAS_MAX} hectáreas.`;
        }

        if (napa < 0) {
            nextErrors.napa = "La napa no puede ser negativa.";
        }

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            return;
        }

        const nuevoLote: LoteDraft = {
            name: name.trim(),
            caracteristicas: caracteristicas.trim(),
            hectareas,
            status,
            lastCrop,
            statusColor,
            imageUrl: PLACEHOLDER_IMAGE,
            latitude,
            longitude,
            polygon,
            ph,
            napa,
        };
        const submitError = await onSubmit(nuevoLote, campoSeleccionado);
        if (!submitError) {
            resetForm();
            onClose();
        } else {
            setFieldErrors(submitError);
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="2xl">
            <div className="flex max-h-[90vh] flex-col bg-white rounded-2xl">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {initialData ? "Editar lote" : "Registrar nuevo lote"}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    id="lote-form"
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto px-6 pb-6 space-y-5"
                >
                    <div>
                        <InputLabel value="Nombre del lote" />
                        <TextInput
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setFieldErrors((current) => ({
                                    ...current,
                                    name: "",
                                }));
                            }}
                            className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                            required
                        />
                        {fieldErrors.name && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <InputLabel value="Campo" />
                        <select
                            value={campoSeleccionado}
                            onChange={(e) => {
                                setCampoSeleccionado(e.target.value);
                                setFieldErrors((current) => ({
                                    ...current,
                                    campo: "",
                                }));
                            }}
                            className="mt-1 w-full rounded-md border-green-700 focus:border-green-800 focus:ring-green-800"
                        >
                            <option value="">Seleccione un campo</option>
                            {campos.map((campo) => (
                                <option key={campo.id} value={campo.id}>
                                    {campo.nombre}
                                </option>
                            ))}
                        </select>
                        {campos.length === 0 && (
                            <p className="mt-1 text-xs text-amber-600">
                                Primero registra un campo para crear lotes.
                            </p>
                        )}
                        {fieldErrors.campo && attemptedSubmit && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.campo}
                            </p>
                        )}
                    </div>
                    <div>
                        <InputLabel value="Estado" />
                        <select
                            value={status}
                            onChange={(e) => {
                                handleStatusChange(e.target.value);
                                setFieldErrors((current) => ({
                                    ...current,
                                    status: "",
                                }));
                            }}
                            className="mt-1 w-full rounded-md border-green-700 focus:border-green-800 focus:ring-green-800"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.status && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.status}
                            </p>
                        )}
                    </div>
                    <div>
                        <InputLabel value="Características" />
                        <textarea
                            value={caracteristicas}
                            onChange={(e) => {
                                setCaracteristicas(e.target.value);
                                setFieldErrors((current) => ({
                                    ...current,
                                    caracteristicas: "",
                                }));
                            }}
                            className="mt-1 w-full rounded-md border-green-700 shadow-sm focus:border-green-800 focus:ring-green-800"
                            rows={4}
                            required
                        />
                        {fieldErrors.caracteristicas && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.caracteristicas}
                            </p>
                        )}
                    </div>
                    <div className="rounded-xl border border-green-700 p-4 shadow-sm bg-white">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-700">pH del suelo</span>
                            <span className="text-green-600 font-semibold">
                                {ph.toFixed(1)}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="14"
                            step="0.1"
                            value={ph}
                            onChange={(e) => {
                                setPh(parseFloat(e.target.value));
                                setFieldErrors((current) => ({
                                    ...current,
                                    ph: "",
                                }));
                            }}
                            className="w-full accent-green-700"
                        />
                        {fieldErrors.ph && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.ph}
                            </p>
                        )}
                    </div>
                    <div className="rounded-xl border border-green-700 p-4 shadow-sm bg-white">
                        <InputLabel value="Profundidad de napa (m)" />
                        <TextInput
                            type="number"
                            value={napa}
                            onChange={(e) => {
                                setNapa(parseFloat(e.target.value) || 0);
                                setFieldErrors((current) => ({
                                    ...current,
                                    napa: "",
                                }));
                            }}
                            className="mt-2 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                        />
                        {fieldErrors.napa && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.napa}
                            </p>
                        )}
                    </div>
                    <div>
                        <InputLabel value="Ubicación" />
                        <div className="rounded-xl overflow-hidden">
                            <MapaInteractivo
                                polygon={polygon}
                                onPolygonChange={(value) => {
                                    setPolygon(value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        polygon: "",
                                    }));
                                }}
                                onCenterChange={handleCenterChange}
                                onAreaChange={handleAreaChange}
                            />
                        </div>
                        {fieldErrors.polygon && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.polygon}
                            </p>
                        )}
                    </div>
                    <div>
                        <InputLabel value="Superficie (Ha)" />
                        <TextInput
                            type="number"
                            step="0.01"
                            min={HECTAREAS_MIN}
                            max={HECTAREAS_MAX}
                            value={hectareas}
                            onChange={(e) => {
                                const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                const normalized = Math.min(Math.max(value, HECTAREAS_MIN), HECTAREAS_MAX);
                                setHectareas(normalized);
                                setFieldErrors((current) => ({
                                    ...current,
                                    hectareas: "",
                                }));
                            }}
                            className="border-green-700 focus:border-green-800 focus:ring-green-800"
                        />
                        {fieldErrors.hectareas && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.hectareas}
                            </p>
                        )}
                    </div>
                </form>

                <div className="flex justify-end gap-3 px-6 pb-5 pt-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="border border-green-700 px-5 py-2 rounded-lg text-green-700 hover:bg-green-50 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="lote-form"
                        className="bg-green-700 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-800 hover:shadow-lg transition-all"
                    >
                        {initialData ? "Guardar cambios" : "Registrar"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
