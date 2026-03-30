import { FormEvent, useCallback, useEffect, useState } from "react";
import Modal from "@/components/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import MapaInteractivo from "../Campos/MapaInteractivo"; // Reusing the map component
import type { Coord, LoteCard, LoteDraft, StatusColor } from "./types";
import { X } from "lucide-react";
import api from "@/lib/api";

interface FormularioLoteProps {
    show: boolean;
    onClose: () => void;
    // Pass campoId to onSubmit for associating the lote with a specific campo
    onSubmit: (lote: LoteDraft, campoId: number | string) => Promise<boolean>;
    initialData?: LoteCard | null;
    campoId: number | string; // The ID of the parent field
}

const STATUS_OPTIONS: { label: string; value: string; color: StatusColor }[] = [
    { label: "En Producción", value: "produccion", color: "verde" },
    { label: "En Preparación", value: "preparacion", color: "amarillo" },
    { label: "En Barbecho", value: "barbecho", color: "rojo" },
    { label: "Disponible", value: "disponible", color: "verde-claro" },
];

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400";

export default function FormularioLote({
    show,
    onClose,
    onSubmit,
    initialData,
    campoId,
}: FormularioLoteProps) {
    // --- Estado del formulario ---
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
            setStatusColor("verde"); // temporal
            setLastCrop("falta implementar");
            setLatitude(initialData.latitude);
            setLongitude(initialData.longitude);
            setCaracteristicas(initialData.caracteristicas);
            setPh(initialData.ph);
            setNapa(initialData.napa);
            setHectareas(initialData.hectareas ?? 0);
            setPolygon(initialData.polygon || []);
            setCampoSeleccionado(initialData.id_campo);
        } else if (show && !initialData) {
            resetForm();
        }
    }, [show, initialData]);

    // --- Handlers del mapa ---
    const handleCenterChange = useCallback((lat: number, lng: number) => {
        if (lat !== 0 || lng !== 0) {
            setLatitude(parseFloat(lat.toFixed(6)));
            setLongitude(parseFloat(lng.toFixed(6)));
        }
    }, []);

    const handleAreaChange = useCallback((ha: number) => {
        if (ha > 0) {
            setHectareas(ha);
        }
    }, []);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        const match = STATUS_OPTIONS.find((o) => o.value === value);
        if (match) setStatusColor(match.color);
    };

    // --- Reset ---
    const resetForm = () => {
        setName("");
        setStatus(STATUS_OPTIONS[0].value);
        setStatusColor(STATUS_OPTIONS[0].color);
        setCaracteristicas("");
        setPh(7);
        setNapa(0);
        setLastCrop("");
        //setLatitude(0);
        //setLongitude(0);
        setHectareas(0);
        setPolygon([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // --- Submit ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const nuevoLote: LoteDraft = {
            name,
            caracteristicas,
            hectareas,
            status,
            lastCrop,
            statusColor,
            imageUrl: PLACEHOLDER_IMAGE,
            latitude,
            longitude,
            ph,
            napa,
            polygon,
        };

        const created = await onSubmit(nuevoLote, campoSeleccionado); // Pass campoId here
        if (created) {
            resetForm();
            onClose();
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="2xl">
            <div className="flex max-h-[90vh] flex-col bg-white rounded-2xl">
                {/* HEADER */}
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

                {/* CONTENIDO */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto px-6 pb-6 space-y-5"
                >
                    {/* Nombre */}
                    <div>
                        <InputLabel value="Nombre del lote" />
                        <TextInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                            required
                        />
                    </div>
                    {/* Campo al que pertenece */}
                    <div>
                        <InputLabel value="Campo" />
                        <select
                            value={campoSeleccionado}
                            onChange={(e) =>
                                setCampoSeleccionado(Number(e.target.value))
                            }
                            className="mt-1 w-full rounded-md border-green-700 focus:border-green-800 focus:ring-green-800"
                            required
                        >
                            <option value="">Seleccione un campo</option>
                            {campos.map((campo) => (
                                <option key={campo.id} value={campo.id}>
                                    {campo.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Estado */}
                    <div>
                        <InputLabel value="Estado" />
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="mt-1 w-full rounded-md border-green-700 focus:border-green-800 focus:ring-green-800"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Características */}
                    <div>
                        <InputLabel value="Características" />
                        <textarea
                            value={caracteristicas}
                            onChange={(e) => setCaracteristicas(e.target.value)}
                            className="mt-1 w-full rounded-md border-green-700 shadow-sm focus:border-green-800 focus:ring-green-800"
                            rows={4}
                        />
                    </div>

                    {/* PH */}
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
                            onChange={(e) => setPh(parseFloat(e.target.value))}
                            className="w-full accent-green-700"
                        />
                    </div>

                    {/* NAPA */}
                    <div className="rounded-xl border border-green-700 p-4 shadow-sm bg-white">
                        <InputLabel value="Profundidad de napa (m)" />
                        <TextInput
                            type="number"
                            value={napa}
                            onChange={(e) =>
                                setNapa(parseFloat(e.target.value) || 0)
                            }
                            className="mt-2 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                        />
                    </div>

                    {/* MAPA */}
                    <div>
                        <InputLabel value="Ubicación" />
                        <div className="rounded-xl overflow-hidden">
                            <MapaInteractivo
                                polygon={polygon}
                                onPolygonChange={setPolygon}
                                onCenterChange={handleCenterChange}
                                onAreaChange={handleAreaChange}
                            />
                        </div>
                    </div>

                    {/* SUPERFICIE */}
                    <div>
                        <InputLabel value="Superficie (Ha)" />
                        <TextInput
                            type="number"
                            value={hectareas}
                            onChange={(e) =>
                                setHectareas(parseFloat(e.target.value) || 0)
                            }
                            className="border-green-700 focus:border-green-800 focus:ring-green-800"
                        />
                    </div>
                </form>

                {/* FOOTER */}
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
                        onClick={handleSubmit}
                        className="bg-green-700 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-800 hover:shadow-lg transition-all"
                    >
                        {initialData ? "Guardar cambios" : "Registrar"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
