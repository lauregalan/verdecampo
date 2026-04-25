import { FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/Modals/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import api from "@/lib/api";
import type {
    AplicacionDraft,
    AplicacionRecord,
    CatalogOption,
    LoteOption,
} from "@/Pages/Aplicaciones/types";

interface ModalFormularioAplicacionProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (aplicacion: AplicacionDraft) => Promise<string | null>;
    aplicacion: AplicacionRecord | null;
}

interface FormState {
    producto_aplicacion_id: string;
    tipo_aplicacion_id: string;
    campania_id: string;
    lote_id: string;
    cantidad: string;
    unidad: string;
    fecha: string;
    precio_labor: string;
    moneda_precio_labor: string;
    observaciones: string;
}

const EMPTY_FORM: FormState = {
    producto_aplicacion_id: "",
    tipo_aplicacion_id: "",
    campania_id: "",
    lote_id: "",
    cantidad: "",
    unidad: "l/ha",
    fecha: "",
    precio_labor: "",
    moneda_precio_labor: "ARS",
    observaciones: "",
};

const normalizeDateInput = (value: string) => value.slice(0, 10);

export default function ModalFormularioAplicacion({
    show,
    onClose,
    onSubmit,
    aplicacion,
}: ModalFormularioAplicacionProps) {
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [productos, setProductos] = useState<CatalogOption[]>([]);
    const [tipos, setTipos] = useState<CatalogOption[]>([]);
    const [campanias, setCampanias] = useState<CatalogOption[]>([]);
    const [lotes, setLotes] = useState<LoteOption[]>([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(false);
    const [loadingLotes, setLoadingLotes] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedCampaniaId = useMemo(
        () => Number(form.campania_id) || null,
        [form.campania_id],
    );

    useEffect(() => {
        if (!show) return;

        setForm(
            aplicacion
                ? {
                      producto_aplicacion_id: String(
                          aplicacion.productoId ?? "",
                      ),
                      tipo_aplicacion_id: String(aplicacion.tipoId ?? ""),
                      campania_id: String(aplicacion.campaniaId ?? ""),
                      lote_id: String(aplicacion.loteId ?? ""),
                      cantidad: String(aplicacion.cantidad),
                      unidad: aplicacion.unidad,
                      fecha: normalizeDateInput(aplicacion.fecha),
                      precio_labor: String(aplicacion.precioLabor),
                      moneda_precio_labor: aplicacion.moneda || "ARS",
                      observaciones: aplicacion.observaciones,
                  }
                : EMPTY_FORM,
        );
        setError(null);
    }, [show, aplicacion]);

    useEffect(() => {
        if (!show) return;

        let isMounted = true;

        const loadCatalogs = async () => {
            try {
                setLoadingCatalogs(true);

                const [productosResponse, tiposResponse, campaniasResponse] =
                    await Promise.all([
                        api.get("/api/productos-aplicaciones"),
                        api.get("/api/tipos-aplicaciones"),
                        api.get("/api/campanias"),
                    ]);

                if (
                    !productosResponse.ok ||
                    !tiposResponse.ok ||
                    !campaniasResponse.ok
                ) {
                    throw new Error(
                        "No se pudieron cargar los datos del formulario.",
                    );
                }

                const [productosData, tiposData, campaniasData] =
                    await Promise.all([
                        productosResponse.json(),
                        tiposResponse.json(),
                        campaniasResponse.json(),
                    ]);

                if (!isMounted) return;

                setProductos(
                    Array.isArray(productosData)
                        ? (productosData as CatalogOption[])
                        : [],
                );
                setTipos(
                    Array.isArray(tiposData)
                        ? (tiposData as CatalogOption[])
                        : [],
                );
                setCampanias(
                    Array.isArray(campaniasData)
                        ? (campaniasData as CatalogOption[])
                        : [],
                );
            } catch (err) {
                if (!isMounted) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar los datos del formulario.",
                );
                setProductos([]);
                setTipos([]);
                setCampanias([]);
            } finally {
                if (isMounted) {
                    setLoadingCatalogs(false);
                }
            }
        };

        void loadCatalogs();

        return () => {
            isMounted = false;
        };
    }, [show]);

    useEffect(() => {
        if (!show) return;

        if (!selectedCampaniaId) {
            setLotes([]);
            setForm((current) => ({ ...current, lote_id: "" }));
            return;
        }

        let isMounted = true;

        const loadLotes = async () => {
            try {
                setLoadingLotes(true);
                const response = await api.get(
                    `/api/campanias/${selectedCampaniaId}/lotes`,
                );

                if (!response.ok) {
                    throw new Error(
                        "No se pudieron cargar los lotes de la campaña.",
                    );
                }

                const payload = await response.json();
                if (!isMounted) return;

                const nextLotes = Array.isArray(payload)
                    ? (payload as LoteOption[])
                    : [];
                setLotes(nextLotes);
                setForm((current) => ({
                    ...current,
                    lote_id: nextLotes.some(
                        (lote) => String(lote.id) === current.lote_id,
                    )
                        ? current.lote_id
                        : "",
                }));
            } catch (err) {
                if (!isMounted) return;
                setLotes([]);
                setError(
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar los lotes de la campaña.",
                );
            } finally {
                if (isMounted) {
                    setLoadingLotes(false);
                }
            }
        };

        void loadLotes();

        return () => {
            isMounted = false;
        };
    }, [show, selectedCampaniaId]);

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const updateField = (field: keyof FormState, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (
            !form.producto_aplicacion_id ||
            !form.tipo_aplicacion_id ||
            !form.campania_id ||
            !form.lote_id ||
            !form.cantidad ||
            !form.unidad.trim() ||
            !form.fecha ||
            !form.precio_labor ||
            !form.moneda_precio_labor
        ) {
            setError("Completá todos los campos obligatorios.");
            return;
        }

        if (Number(form.cantidad) <= 0) {
            setError("La cantidad debe ser mayor a cero.");
            return;
        }

        if (Number(form.precio_labor) < 0) {
            setError("El precio de labor no puede ser negativo.");
            return;
        }

        setSaving(true);
        setError(null);

        const payload: AplicacionDraft = {
            producto_aplicacion_id: Number(form.producto_aplicacion_id),
            tipo_aplicacion_id: Number(form.tipo_aplicacion_id),
            campania_id: Number(form.campania_id),
            lote_id: Number(form.lote_id),
            cantidad: Number(form.cantidad),
            unidad: form.unidad.trim(),
            fecha: form.fecha,
            precio_labor: Number(form.precio_labor),
            moneda_precio_labor: form.moneda_precio_labor,
            observaciones: form.observaciones.trim(),
        };

        const errorMessage = await onSubmit(payload);
        if (!errorMessage) {
            handleClose();
        } else {
            setError(errorMessage);
        }

        setSaving(false);
    };

    const canSubmit =
        !saving &&
        !loadingCatalogs &&
        !error &&
        productos.length > 0 &&
        tipos.length > 0 &&
        campanias.length > 0;

    return (
        <Modal show={show} onClose={handleClose} maxWidth="2xl">
            <div className="flex max-h-[90vh] flex-col bg-white rounded-2xl">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {aplicacion
                            ? "Editar aplicación"
                            : "Registrar nueva aplicación"}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    id="aplicacion-form"
                    onSubmit={handleSubmit}
                    className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
                >
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel
                                htmlFor="aplicacion-producto"
                                value="Producto *"
                            />
                            <select
                                id="aplicacion-producto"
                                value={form.producto_aplicacion_id}
                                onChange={(event) =>
                                    updateField(
                                        "producto_aplicacion_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                                disabled={loadingCatalogs}
                                required
                            >
                                <option value="">Seleccioná un producto</option>
                                {productos.map((producto) => (
                                    <option
                                        key={producto.id}
                                        value={String(producto.id)}
                                    >
                                        {producto.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="aplicacion-tipo"
                                value="Tipo *"
                            />
                            <select
                                id="aplicacion-tipo"
                                value={form.tipo_aplicacion_id}
                                onChange={(event) =>
                                    updateField(
                                        "tipo_aplicacion_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                                disabled={loadingCatalogs}
                                required
                            >
                                <option value="">Seleccioná un tipo</option>
                                {tipos.map((tipo) => (
                                    <option
                                        key={tipo.id}
                                        value={String(tipo.id)}
                                    >
                                        {tipo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="aplicacion-campania"
                                value="Campaña *"
                            />
                            <select
                                id="aplicacion-campania"
                                value={form.campania_id}
                                onChange={(event) =>
                                    updateField(
                                        "campania_id",
                                        event.target.value,
                                    )
                                }
                                className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                                disabled={loadingCatalogs}
                                required
                            >
                                <option value="">Seleccioná una campaña</option>
                                {campanias.map((campania) => (
                                    <option
                                        key={campania.id}
                                        value={String(campania.id)}
                                    >
                                        {campania.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="aplicacion-lote"
                                value="Lote *"
                            />
                            <select
                                id="aplicacion-lote"
                                value={form.lote_id}
                                onChange={(event) =>
                                    updateField("lote_id", event.target.value)
                                }
                                className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                                disabled={!selectedCampaniaId || loadingLotes}
                                required
                            >
                                <option value="">
                                    {!selectedCampaniaId
                                        ? "Primero seleccioná una campaña"
                                        : loadingLotes
                                          ? "Cargando lotes..."
                                          : "Seleccioná un lote"}
                                </option>
                                {lotes.map((lote) => (
                                    <option
                                        key={lote.id}
                                        value={String(lote.id)}
                                    >
                                        {lote.nombre}
                                    </option>
                                ))}
                            </select>
                            {selectedCampaniaId &&
                                !loadingLotes &&
                                lotes.length === 0 && (
                                    <p className="mt-1 text-xs text-amber-600">
                                        La campaña seleccionada no tiene lotes
                                        asociados.
                                    </p>
                                )}
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="aplicacion-cantidad"
                                value="Cantidad *"
                            />
                            <TextInput
                                id="aplicacion-cantidad"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.cantidad}
                                onChange={(event) =>
                                    updateField("cantidad", event.target.value)
                                }
                                className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="aplicacion-unidad"
                                value="Unidad *"
                            />
                            <TextInput
                                id="aplicacion-unidad"
                                value={form.unidad}
                                onChange={(event) =>
                                    updateField("unidad", event.target.value)
                                }
                                placeholder="Ej: l/ha"
                                className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="aplicacion-fecha"
                                value="Fecha *"
                            />
                            <TextInput
                                id="aplicacion-fecha"
                                type="date"
                                value={form.fecha}
                                onChange={(event) =>
                                    updateField("fecha", event.target.value)
                                }
                                className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                                required
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                            <div>
                                <InputLabel
                                    htmlFor="aplicacion-precio-labor"
                                    value="Precio de labor *"
                                />
                                <TextInput
                                    id="aplicacion-precio-labor"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.precio_labor}
                                    onChange={(event) =>
                                        updateField(
                                            "precio_labor",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="aplicacion-moneda"
                                    value="Moneda *"
                                />
                                <select
                                    id="aplicacion-moneda"
                                    value={form.moneda_precio_labor}
                                    onChange={(event) =>
                                        updateField(
                                            "moneda_precio_labor",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800"
                                    required
                                >
                                    <option value="ARS">ARS</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="aplicacion-observaciones"
                            value="Observaciones"
                        />
                        <textarea
                            id="aplicacion-observaciones"
                            value={form.observaciones}
                            onChange={(event) =>
                                updateField("observaciones", event.target.value)
                            }
                            rows={4}
                            placeholder="Detalle operativo, condiciones o notas relevantes..."
                            className="mt-1 w-full rounded-md border border-green-700 px-3 py-2 text-sm shadow-sm focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800"
                        />
                    </div>
                </form>

                <div className="flex justify-end gap-3 px-6 pb-5 pt-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        className="border border-green-700 px-5 py-2 rounded-lg text-green-700 hover:bg-green-50 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="aplicacion-form"
                        disabled={!canSubmit}
                        className="bg-green-700 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving
                            ? "Guardando..."
                            : aplicacion
                              ? "Guardar cambios"
                              : "Registrar aplicación"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
