import { FormEvent, useEffect, useState } from "react";
import Modal from "@/components/Modals/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import { X } from "lucide-react";
import api from "@/lib/api";

interface Campania {
    id: number;
    nombre: string;
}

interface Lote {
    id: number;
    nombre: string;
}

interface Cosecha {
    id: number;
    campania_id: number;
    lote_id: number;
    fecha: string | null;
    rinde: number;
    humedad: number;
    observaciones: string | null;
}

interface CosechaForm {
    campania_id: number | "";
    lote_id: number | "";
    fecha: string;
    rinde: string;
    humedad: string;
    observaciones: string;
}

interface ModalFormularioCosechaProps {
    show: boolean;
    onClose: () => void;
    cosechaEditando: Cosecha | null;
    onSaved: (cosecha: Cosecha) => void;
}

const EMPTY_FORM: CosechaForm = {
    campania_id: "",
    lote_id: "",
    fecha: "",
    rinde: "",
    humedad: "",
    observaciones: "",
};

export default function ModalFormularioCosecha({
    show,
    onClose,
    cosechaEditando,
    onSaved,
}: ModalFormularioCosechaProps) {
    const [form, setForm] = useState<CosechaForm>(EMPTY_FORM);
    const [campanias, setCampanias] = useState<Campania[]>([]);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [loadingLotes, setLoadingLotes] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Cargar campañas al abrir
    useEffect(() => {
        if (!show) return;
        api.get("/api/campanias")
            .then((r) => r.json())
            .then(setCampanias)
            .catch(() => setError("No se pudieron cargar las campañas"));
    }, [show]);

    // Cuando cambia la campaña, cargar los lotes de esa campaña
    useEffect(() => {
        if (!form.campania_id) {
            setLotes([]);
            return;
        }
        setLoadingLotes(true);
        api.get(`/api/campanias/${form.campania_id}/lotes`)
            .then((r) => r.json())
            .then((data) => {
                // El endpoint devuelve los lotes directamente
                setLotes(Array.isArray(data) ? data : data.lotes ?? []);
            })
            .catch(() => setError("No se pudieron cargar los lotes"))
            .finally(() => setLoadingLotes(false));
    }, [form.campania_id]);

    // Prellenar si estamos editando
    useEffect(() => {
        if (show && cosechaEditando) {
            setForm({
                campania_id: cosechaEditando.campania_id,
                lote_id: cosechaEditando.lote_id,
                fecha: cosechaEditando.fecha ?? "",
                rinde: String(cosechaEditando.rinde),
                humedad: String(cosechaEditando.humedad),
                observaciones: cosechaEditando.observaciones ?? "",
            });
        } else if (show && !cosechaEditando) {
            setForm(EMPTY_FORM);
        }
    }, [show, cosechaEditando]);

    const handleClose = () => {
        setForm(EMPTY_FORM);
        setError(null);
        onClose();
    };

    const handleGuardar = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            const payload = {
                campania_id: Number(form.campania_id),
                lote_id: Number(form.lote_id),
                fecha: form.fecha || null,
                rinde: Number(form.rinde),
                humedad: Number(form.humedad),
                observaciones: form.observaciones.trim() || null,
            };

            let response: Response;
            if (cosechaEditando) {
                response = await api.put(`/api/cosechas/${cosechaEditando.id}`, payload);
            } else {
                response = await api.post("/api/cosechas", payload);
            }

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body?.message ?? "Error al guardar");
            }

            const data = await response.json();
            onSaved(data);
            handleClose();
        } catch (err: any) {
            setError(err.message ?? "Error inesperado");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <div className="flex max-h-[90vh] flex-col bg-white rounded-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-100">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {cosechaEditando ? "Editar cosecha" : "Registrar cosecha"}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form
                    onSubmit={handleGuardar}
                    className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-5"
                >
                    {error && (
                        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Campaña */}
                    <div>
                        <InputLabel value="Campaña *" />
                        <select
                            required
                            value={form.campania_id}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    campania_id: e.target.value === "" ? "" : Number(e.target.value),
                                    lote_id: "",
                                })
                            }
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-700 focus:ring-green-700 text-sm"
                        >
                            <option value="">Seleccionar campaña…</option>
                            {campanias.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lote */}
                    <div>
                        <InputLabel value="Lote *" />
                        <select
                            required
                            value={form.lote_id}
                            disabled={!form.campania_id || loadingLotes}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    lote_id: e.target.value === "" ? "" : Number(e.target.value),
                                })
                            }
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-700 focus:ring-green-700 text-sm disabled:opacity-50"
                        >
                            <option value="">
                                {loadingLotes
                                    ? "Cargando lotes…"
                                    : !form.campania_id
                                        ? "Primero elegí una campaña"
                                        : lotes.length === 0
                                            ? "Sin lotes en esta campaña"
                                            : "Seleccionar lote…"}
                            </option>
                            {lotes.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha */}
                    <div>
                        <InputLabel value="Fecha de cosecha" />
                        <TextInput
                            type="date"
                            value={form.fecha}
                            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                            className="mt-1 w-full border-gray-300 focus:border-green-700 focus:ring-green-700"
                        />
                    </div>

                    {/* Rinde y Humedad en fila */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Rinde (kg/ha) *" />
                            <TextInput
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={form.rinde}
                                onChange={(e) => setForm({ ...form, rinde: e.target.value })}
                                placeholder="Ej: 3200.50"
                                className="mt-1 w-full border-gray-300 focus:border-green-700 focus:ring-green-700"
                            />
                        </div>
                        <div>
                            <InputLabel value="Humedad (%) *" />
                            <TextInput
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                required
                                value={form.humedad}
                                onChange={(e) => setForm({ ...form, humedad: e.target.value })}
                                placeholder="Ej: 13.5"
                                className="mt-1 w-full border-gray-300 focus:border-green-700 focus:ring-green-700"
                            />
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <InputLabel value="Observaciones" />
                        <textarea
                            value={form.observaciones}
                            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                            rows={3}
                            placeholder="Notas adicionales…"
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-700 focus:ring-green-700 text-sm"
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-xl border border-green-600 bg-white px-5 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 active:scale-95 disabled:opacity-60"
                        >
                            {saving ? "Guardando…" : cosechaEditando ? "Actualizar" : "Registrar"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
