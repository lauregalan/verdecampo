import { FormEvent, useCallback, useEffect, useState } from "react";
import Modal from "@/components/Modals/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import { X, Sprout } from "lucide-react";
import api from "@/lib/api";

interface Campania {
    id: number;
    nombre: string;
}

interface Lote {
    id: number;
    nombre: string;
}

interface Cultivo {
    id: number;
    tipo: string;
    variedad: string;
}

interface SiembraDraft {
    campania_id: number;
    lote_id: number;
    cultivo_id: number;
    fecha_siembra: string;
    observaciones: string;
}

interface SiembraDB {
    id: number;
    campania_id: number;
    lote_id: number;
    cultivo_id: number;
    fecha: string;
    observaciones: string | null;
}

interface ModalFormularioSiembraProps {
    show: boolean;
    onClose: () => void;
    onSaved: (siembra: SiembraDB) => void;
    siembraEditando?: SiembraDB | null;
}

export default function ModalFormularioSiembra({
    show,
    onClose,
    onSaved,
    siembraEditando,
}: ModalFormularioSiembraProps) {
    const [campanias, setCampanias] = useState<Campania[]>([]);
    const [lotesDisponibles, setLotesDisponibles] = useState<Lote[]>([]);
    const [cultivos, setCultivos] = useState<Cultivo[]>([]);

    const [campaniaId, setCampaniaId] = useState<number | "">("");
    const [loteId, setLoteId] = useState<number | "">("");
    const [cultivoId, setCultivoId] = useState<number | "">("");
    const [fecha, setFecha] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const [loadingLotes, setLoadingLotes] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar campañas y cultivos al abrir
    useEffect(() => {
        if (!show) return;

        const fetchData = async () => {
            try {
                const [resCampanias, resCultivos] = await Promise.all([
                    api.get("/api/campanias"),
                    api.get("/api/cultivos"),
                ]);
                const dataCampanias = await resCampanias.json();
                const dataCultivos = await resCultivos.json();
                setCampanias(dataCampanias);
                setCultivos(dataCultivos);
            } catch {
                setError("Error al cargar los datos");
            }
        };

        fetchData();
    }, [show]);

    // Cargar los lotes de la campaña seleccionada
    useEffect(() => {
        if (!campaniaId) {
            setLotesDisponibles([]);
            setLoteId("");
            return;
        }

        const fetchLotesDeCampania = async () => {
            setLoadingLotes(true);
            try {
                const res = await api.get(`/api/campanias/${campaniaId}/lotes`);
                const data = await res.json();
                setLotesDisponibles(data);
            } catch {
                setError("Error al cargar los lotes de la campaña");
            } finally {
                setLoadingLotes(false);
            }
        };

        fetchLotesDeCampania();
    }, [campaniaId]);

    // Poblar formulario al editar
    useEffect(() => {
        if (show && siembraEditando) {
            setCampaniaId(siembraEditando.campania_id);
            setLoteId(siembraEditando.lote_id);
            setCultivoId(siembraEditando.cultivo_id);
            setFecha(siembraEditando.fecha);
            setObservaciones(siembraEditando.observaciones ?? "");
        } else if (show && !siembraEditando) {
            resetForm();
        }
    }, [show, siembraEditando]);

    const resetForm = () => {
        setCampaniaId("");
        setLoteId("");
        setCultivoId("");
        setFecha("");
        setObservaciones("");
        setLotesDisponibles([]);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!campaniaId || !loteId || !cultivoId || !fecha) {
            setError("Por favor completá todos los campos obligatorios.");
            return;
        }

        const payload = {
            campania_id: Number(campaniaId),
            lote_id: Number(loteId),
            cultivo_id: Number(cultivoId),
            fecha_siembra: fecha,
            observaciones: observaciones || null,
        };

        setSubmitting(true);
        setError(null);

        try {
            let response;
            if (siembraEditando) {
                response = await api.put(
                    `/api/siembras/${siembraEditando.id}`,
                    payload,
                );
            } else {
                response = await api.post("/api/siembras", payload);
            }

            if (!response.ok) throw new Error();
            const data = await response.json();
            onSaved(data);
            resetForm();
            onClose();
        } catch {
            setError("Error al guardar la siembra. Intentá nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <div className="flex max-h-[90vh] flex-col bg-white rounded-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
                            <Sprout size={18} className="text-green-700" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {siembraEditando
                                ? "Editar siembra"
                                : "Registrar nueva siembra"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form
                    id="siembra-form"
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
                >
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Campaña */}
                    <div>
                        <InputLabel value="Campaña *" />
                        <select
                            value={campaniaId}
                            onChange={(e) => {
                                setCampaniaId(
                                    e.target.value ? Number(e.target.value) : "",
                                );
                                setLoteId("");
                            }}
                            className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800"
                            required
                        >
                            <option value="">Seleccione una campaña</option>
                            {campanias.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lote (solo lotes de la campaña) */}
                    <div>
                        <InputLabel value="Lote *" />
                        <select
                            value={loteId}
                            onChange={(e) =>
                                setLoteId(
                                    e.target.value ? Number(e.target.value) : "",
                                )
                            }
                            className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                            required
                            disabled={!campaniaId || loadingLotes}
                        >
                            <option value="">
                                {!campaniaId
                                    ? "Primero seleccioná una campaña"
                                    : loadingLotes
                                    ? "Cargando lotes..."
                                    : lotesDisponibles.length === 0
                                        ? "No hay lotes en esta campaña"
                                        : "Seleccione un lote"}
                            </option>
                            {lotesDisponibles.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.nombre}
                                </option>
                            ))}
                        </select>
                        {campaniaId && !loadingLotes && lotesDisponibles.length === 0 && (
                            <p className="mt-1 text-xs text-amber-600">
                                Esta campaña no tiene lotes asignados.
                            </p>
                        )}
                    </div>

                    {/* Cultivo */}
                    <div>
                        <InputLabel value="Cultivo *" />
                        <select
                            value={cultivoId}
                            onChange={(e) =>
                                setCultivoId(
                                    e.target.value ? Number(e.target.value) : "",
                                )
                            }
                            className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800"
                            required
                        >
                            <option value="">Seleccione un cultivo</option>
                            {cultivos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.tipo} — {c.variedad}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha */}
                    <div>
                        <InputLabel value="Fecha de siembra *" />
                        <TextInput
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                            required
                        />
                    </div>

                    {/* Observaciones */}
                    <div>
                        <InputLabel value="Observaciones" />
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Notas adicionales sobre la siembra..."
                            className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800"
                            rows={3}
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 pb-5 pt-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="border border-green-700 px-5 py-2 rounded-lg text-green-700 hover:bg-green-50 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="siembra-form"
                        disabled={submitting}
                        className="bg-green-700 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting
                            ? "Guardando..."
                            : siembraEditando
                            ? "Guardar cambios"
                            : "Registrar siembra"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
