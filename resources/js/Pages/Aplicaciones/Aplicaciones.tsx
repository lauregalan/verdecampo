import { Head, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    CalendarDays,
    DollarSign,
    Eye,
    Filter,
    Layers,
    Package,
    Pencil,
    Plus,
    Search,
    Sprout,
    Trash2,
} from "lucide-react";
import Body from "@/components/ui/Tabs/Body";
import { ScrollArea } from "@/components/ui/scroll-area";
import Modal from "@/components/Modals/Modal";
import ModalConfirmacion from "@/components/Modals/ModalConfirmacion";
import ModalFormularioAplicacion from "@/components/Modals/ModalFormularioAplicacion";
import api from "@/lib/api";
import type {
    AplicacionDraft,
    AplicacionRecord,
    BackendAplicacion,
} from "@/Pages/Aplicaciones/types";

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatMoney = (amount: number, currency: string) => {
    if (currency === "ARS" || currency === "USD") {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(amount);
    }

    return `${amount.toLocaleString("es-AR")} ${currency}`;
};

const toAplicacionRecord = (
    aplicacion: BackendAplicacion,
): AplicacionRecord => ({
    id: aplicacion.id,
    producto: aplicacion.producto_aplicacion?.nombre ?? "Sin producto",
    tipo: aplicacion.tipo_aplicacion?.nombre ?? "Sin tipo",
    campania: aplicacion.campania?.nombre ?? "Sin campaña",
    lote: aplicacion.lote?.nombre ?? "Sin lote",
    cantidad: Number(aplicacion.cantidad) || 0,
    unidad: aplicacion.unidad ?? "",
    fecha: aplicacion.fecha,
    precioLabor: Number(aplicacion.precio_labor) || 0,
    moneda: aplicacion.moneda_precio_labor ?? "ARS",
    observaciones: aplicacion.observaciones ?? "",
    productoId: aplicacion.producto_aplicacion?.id ?? null,
    tipoId: aplicacion.tipo_aplicacion?.id ?? null,
    campaniaId: aplicacion.campania?.id ?? null,
    loteId: aplicacion.lote?.id ?? null,
});

const getApiErrorMessage = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    const payload = (await response.json().catch(() => null)) as
        | {
              message?: string;
              errors?: Record<string, string[]>;
          }
        | null;

    const validationMessage = payload?.errors
        ? Object.values(payload.errors).flat()[0]
        : null;

    return validationMessage ?? payload?.message ?? fallback;
};

function AplicacionCard({
    aplicacion,
    onView,
    onEdit,
    onDelete,
    isProductor,
}: {
    aplicacion: AplicacionRecord;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isProductor: boolean;
}) {
    return (
        <article className="group flex h-full flex-col rounded-3xl border border-stone-200/80 bg-[#FCFBF8]/78 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                        Aplicación
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-xl font-black tracking-tight text-stone-900">
                        {aplicacion.producto}
                    </h3>
                    <p className="mt-2 text-sm text-stone-500">
                        Campaña:{" "}
                        <span className="font-semibold text-stone-800">
                            {aplicacion.campania}
                        </span>
                    </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                    {aplicacion.tipo}
                </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50/80 p-4 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 text-stone-500">
                        <Package size={16} />
                        <span className="text-xs font-bold uppercase tracking-wide">
                            Dosis
                        </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-stone-900">
                        {aplicacion.cantidad.toLocaleString("es-AR")}{" "}
                        {aplicacion.unidad}
                    </div>
                </div>
                <div className="rounded-2xl bg-stone-50/80 p-4 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 text-stone-500">
                        <CalendarDays size={16} />
                        <span className="text-xs font-bold uppercase tracking-wide">
                            Fecha
                        </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-stone-900">
                        {formatDate(aplicacion.fecha)}
                    </div>
                </div>
            </div>

            <div className="mt-4 rounded-2xl border border-stone-200/80 bg-[#f7f2e9]/78 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                            Lote asociado
                        </div>
                        <div className="mt-1 text-sm font-semibold text-stone-900">
                            {aplicacion.lote}
                        </div>
                    </div>
                    <Layers className="size-5 text-stone-400" />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white/55 px-4 py-3 backdrop-blur-sm">
                <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                        Costo de labor
                    </div>
                    <div className="mt-1 text-sm font-semibold text-stone-900">
                        {formatMoney(aplicacion.precioLabor, aplicacion.moneda)}
                    </div>
                </div>
                <DollarSign className="size-5 text-stone-400" />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-stone-200 pt-4">
                <button
                    type="button"
                    onClick={onView}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                    <Eye size={16} />
                    Ver
                </button>
                {isProductor && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        <Pencil size={16} />
                        Editar
                    </button>
                )}
                {isProductor && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                        <Trash2 size={16} />
                        Eliminar
                    </button>
                )}
            </div>
        </article>
    );
}

export default function Aplicaciones() {
    const authUser = usePage().props.auth?.user as { roles?: string[] } | undefined;
    const isProductor = authUser?.roles?.includes('Productor') ?? false;

    const [aplicaciones, setAplicaciones] = useState<AplicacionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [tipoFilter, setTipoFilter] = useState("Todos");
    const [campaniaFilter, setCampaniaFilter] = useState("Todos");
    const [showFormulario, setShowFormulario] = useState(false);
    const [aplicacionEditando, setAplicacionEditando] =
        useState<AplicacionRecord | null>(null);
    const [aplicacionDetalle, setAplicacionDetalle] =
        useState<AplicacionRecord | null>(null);
    const [aplicacionAEliminar, setAplicacionAEliminar] =
        useState<AplicacionRecord | null>(null);

    const cargarAplicaciones = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/aplicaciones");

            if (!response.ok) {
                throw new Error("No se pudieron obtener las aplicaciones.");
            }

            const payload = (await response.json()) as BackendAplicacion[];
            setAplicaciones(
                Array.isArray(payload) ? payload.map(toAplicacionRecord) : [],
            );
            setError(null);
        } catch (loadError) {
            setAplicaciones([]);
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Error al cargar aplicaciones desde el backend.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void cargarAplicaciones();
    }, [cargarAplicaciones]);

    const resumen = useMemo(
        () => ({
            total: aplicaciones.length,
            productos: new Set(
                aplicaciones
                    .map((aplicacion) => aplicacion.productoId)
                    .filter((id): id is number => id !== null),
            ).size,
            campanias: new Set(
                aplicaciones
                    .map((aplicacion) => aplicacion.campaniaId)
                    .filter((id): id is number => id !== null),
            ).size,
            lotes: new Set(
                aplicaciones
                    .map((aplicacion) => aplicacion.loteId)
                    .filter((id): id is number => id !== null),
            ).size,
        }),
        [aplicaciones],
    );

    const tiposDisponibles = useMemo(
        () =>
            Array.from(new Set(aplicaciones.map((aplicacion) => aplicacion.tipo))).sort(
                (left, right) => left.localeCompare(right, "es"),
            ),
        [aplicaciones],
    );

    const campaniasDisponibles = useMemo(
        () =>
            Array.from(
                new Set(aplicaciones.map((aplicacion) => aplicacion.campania)),
            ).sort((left, right) => left.localeCompare(right, "es")),
        [aplicaciones],
    );

    const aplicacionesFiltradas = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return aplicaciones.filter((aplicacion) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                [
                    aplicacion.producto,
                    aplicacion.tipo,
                    aplicacion.campania,
                    aplicacion.lote,
                    aplicacion.observaciones,
                ].some((value) => value.toLowerCase().includes(normalizedSearch));

            const matchesTipo =
                tipoFilter === "Todos" || aplicacion.tipo === tipoFilter;
            const matchesCampania =
                campaniaFilter === "Todos" ||
                aplicacion.campania === campaniaFilter;

            return matchesSearch && matchesTipo && matchesCampania;
        });
    }, [aplicaciones, campaniaFilter, search, tipoFilter]);

    const abrirCreacion = () => {
        setAplicacionEditando(null);
        setShowFormulario(true);
    };

    const abrirEdicion = (aplicacion: AplicacionRecord) => {
        setAplicacionEditando(aplicacion);
        setShowFormulario(true);
    };

    const cerrarFormulario = () => {
        setShowFormulario(false);
        setAplicacionEditando(null);
    };

    const guardarAplicacion = async (
        nuevaAplicacion: AplicacionDraft,
    ): Promise<string | null> => {
        try {
            const response = aplicacionEditando
                ? await api.put(
                      `/api/aplicaciones/${aplicacionEditando.id}`,
                      nuevaAplicacion,
                  )
                : await api.post("/api/aplicaciones", nuevaAplicacion);

            if (!response.ok) {
                throw new Error(
                    await getApiErrorMessage(
                        response,
                        aplicacionEditando
                            ? "No se pudo actualizar la aplicación."
                            : "No se pudo crear la aplicación.",
                    ),
                );
            }

            await cargarAplicaciones();
            setError(null);
            setShowFormulario(false);
            setAplicacionEditando(null);
            return null;
        } catch (saveError) {
            return (
                saveError instanceof Error
                    ? saveError.message
                    : "No se pudo guardar la aplicación."
            );
        }
    };

    const handleEliminar = async () => {
        if (!aplicacionAEliminar) return;

        try {
            const response = await api.delete(
                `/api/aplicaciones/${aplicacionAEliminar.id}`,
            );

            if (!response.ok) {
                throw new Error(
                    await getApiErrorMessage(
                        response,
                        "No se pudo eliminar la aplicación.",
                    ),
                );
            }

            setAplicaciones((current) =>
                current.filter(
                    (aplicacion) => aplicacion.id !== aplicacionAEliminar.id,
                ),
            );
            setAplicacionDetalle((current) =>
                current?.id === aplicacionAEliminar.id ? null : current,
            );
            setAplicacionAEliminar(null);
            setError(null);
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "No se pudo eliminar la aplicación.",
            );
        }
    };

    return (
        <Body>
            <Head title="Aplicaciones" />
            <div className="flex h-full min-h-0 flex-col p-8 font-sans">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestión de Aplicaciones
                            </h1>
                            <p className="mt-2 text-sm text-stone-500">
                                Registrá productos aplicados, campaña, lote y costo operativo
                                con el mismo flujo del resto del tablero.
                            </p>
                        </div>
                        {isProductor && (
                            <button
                                type="button"
                                onClick={abrirCreacion}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                            >
                                <Plus size={20} />
                                Nueva aplicación
                            </button>
                        )}
                    </div>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: "Total",
                                value: resumen.total,
                                detail: "Aplicaciones registradas",
                            },
                            {
                                label: "Productos",
                                value: resumen.productos,
                                detail: "Insumos distintos utilizados",
                            },
                            {
                                label: "Campañas",
                                value: resumen.campanias,
                                detail: "Con aplicaciones activas",
                            },
                            {
                                label: "Lotes",
                                value: resumen.lotes,
                                detail: "Impactados por aplicaciones",
                            },
                        ].map((item) => (
                            <article
                                key={item.label}
                                className="rounded-2xl border border-stone-200/80 bg-[#FCFBF8]/78 p-5 shadow-sm backdrop-blur-sm"
                            >
                                <div className="text-sm font-semibold text-stone-500">
                                    {item.label}
                                </div>
                                <div className="mt-4 text-3xl font-black tracking-tight text-stone-900 xl:text-4xl">
                                    {item.value}
                                </div>
                                <p className="mt-2 text-sm text-stone-500">{item.detail}</p>
                            </article>
                        ))}
                    </section>

                    <section className="rounded-2xl border border-stone-200/80 bg-white/55 p-5 shadow-sm backdrop-blur-sm md:p-6">
                        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Search size={14} />
                                    Buscar
                                </span>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Producto, lote, campaña..."
                                        className="w-full rounded-2xl border border-stone-200/80 bg-stone-50/80 py-3 pl-10 pr-4 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white/90"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Filter size={14} />
                                    Tipo
                                </span>
                                <select
                                    value={tipoFilter}
                                    onChange={(event) => setTipoFilter(event.target.value)}
                                    className="w-full rounded-2xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white/90"
                                >
                                    <option value="Todos">Todos los tipos</option>
                                    {tiposDisponibles.map((tipo) => (
                                        <option key={tipo} value={tipo}>
                                            {tipo}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Sprout size={14} />
                                    Campaña
                                </span>
                                <select
                                    value={campaniaFilter}
                                    onChange={(event) =>
                                        setCampaniaFilter(event.target.value)
                                    }
                                    className="w-full rounded-2xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white/90"
                                >
                                    <option value="Todos">Todas las campañas</option>
                                    {campaniasDisponibles.map((campania) => (
                                        <option key={campania} value={campania}>
                                            {campania}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="flex items-end">
                                <div className="w-full rounded-2xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm font-semibold text-stone-600 backdrop-blur-sm">
                                    {aplicacionesFiltradas.length} visibles
                                </div>
                            </div>
                        </div>
                    </section>

                    <ScrollArea className="min-h-0 flex-1 w-full">
                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 xl:grid-cols-3">
                            {loading ? (
                                <div className="col-span-full rounded-2xl border border-dashed border-stone-300/80 bg-white/55 px-6 py-12 text-center text-sm text-stone-500 backdrop-blur-sm">
                                    Cargando aplicaciones...
                                </div>
                            ) : aplicacionesFiltradas.length === 0 ? (
                                <div className="col-span-full rounded-2xl border border-dashed border-stone-300/80 bg-white/55 px-6 py-14 text-center backdrop-blur-sm">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100/80 text-stone-500">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h2 className="mt-4 text-xl font-bold text-stone-900">
                                        No hay aplicaciones para mostrar
                                    </h2>
                                    <p className="mt-2 text-sm text-stone-500">
                                        Ajustá los filtros o registrá una nueva aplicación para
                                        empezar.
                                    </p>
                                </div>
                            ) : (
                                aplicacionesFiltradas.map((aplicacion) => (
                                    <AplicacionCard
                                        key={aplicacion.id}
                                        aplicacion={aplicacion}
                                        isProductor={isProductor}
                                        onView={() => setAplicacionDetalle(aplicacion)}
                                        onEdit={() => abrirEdicion(aplicacion)}
                                        onDelete={() => setAplicacionAEliminar(aplicacion)}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <ModalFormularioAplicacion
                show={showFormulario}
                onClose={cerrarFormulario}
                onSubmit={guardarAplicacion}
                aplicacion={aplicacionEditando}
            />

            <ModalConfirmacion
                show={aplicacionAEliminar !== null}
                titulo="Eliminar aplicación"
                mensaje={`¿Seguro que querés eliminar la aplicación de "${aplicacionAEliminar?.producto ?? ""}"? Esta acción no se puede deshacer.`}
                onConfirmar={handleEliminar}
                onCancelar={() => setAplicacionAEliminar(null)}
            />

            <Modal
                show={aplicacionDetalle !== null}
                onClose={() => setAplicacionDetalle(null)}
                maxWidth="lg"
            >
                {aplicacionDetalle && (
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                                    Detalle de aplicación
                                </p>
                                <h2 className="mt-2 text-2xl font-black text-stone-900">
                                    {aplicacionDetalle.producto}
                                </h2>
                                <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                                    {aplicacionDetalle.tipo}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAplicacionDetalle(null)}
                                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-stone-50/80 p-4">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Cantidad aplicada
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {aplicacionDetalle.cantidad.toLocaleString("es-AR")}{" "}
                                    {aplicacionDetalle.unidad}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-stone-50/80 p-4">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Fecha
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {formatDate(aplicacionDetalle.fecha)}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-stone-50/80 p-4">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Campaña
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {aplicacionDetalle.campania}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-stone-50/80 p-4">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Lote
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {aplicacionDetalle.lote}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-stone-50/80 p-4 sm:col-span-2">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Precio de labor
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {formatMoney(
                                        aplicacionDetalle.precioLabor,
                                        aplicacionDetalle.moneda,
                                    )}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-stone-50/80 p-4 sm:col-span-2">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Observaciones
                                </div>
                                <div className="mt-2 text-sm leading-6 text-stone-700">
                                    {aplicacionDetalle.observaciones || "Sin observaciones cargadas."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </Body>
    );
}
