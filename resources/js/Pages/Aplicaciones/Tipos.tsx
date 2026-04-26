import { Head, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Filter, Layers3, Plus, Search, Sparkles } from "lucide-react";
import Body from "@/components/ui/Tabs/Body";
import { ScrollArea } from "@/components/ui/scroll-area";
import Modal from "@/components/Modals/Modal";
import ModalConfirmacion from "@/components/Modals/ModalConfirmacion";
import ModalFormularioCatalogoAplicacion from "@/components/Modals/ModalFormularioCatalogoAplicacion";
import CatalogItemCard from "@/Pages/Aplicaciones/components/CatalogItemCard";
import api from "@/lib/api";
import type { BackendAplicacion, TipoAplicacion } from "@/Pages/Aplicaciones/types";
import { formatDate, getApiErrorMessage } from "@/Pages/Aplicaciones/utils";

const FORM_FIELDS = [
    {
        name: "nombre",
        label: "Nombre *",
        placeholder: "Ej: Pulverización foliar",
    },
];

export default function Tipos() {
    const authUser = usePage().props.auth?.user as { roles?: string[] } | undefined;
    const isProductor = authUser?.roles?.includes('Productor') ?? false;

    const [tipos, setTipos] = useState<TipoAplicacion[]>([]);
    const [applications, setApplications] = useState<BackendAplicacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [estadoFilter, setEstadoFilter] = useState<
        "Todos" | "En uso" | "Sin uso"
    >("Todos");
    const [showFormulario, setShowFormulario] = useState(false);
    const [tipoEditando, setTipoEditando] = useState<TipoAplicacion | null>(null);
    const [tipoDetalle, setTipoDetalle] = useState<TipoAplicacion | null>(null);
    const [tipoAEliminar, setTipoAEliminar] = useState<TipoAplicacion | null>(null);

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            const [tiposResponse, aplicacionesResponse] = await Promise.all([
                api.get("/api/tipos-aplicaciones"),
                api.get("/api/aplicaciones"),
            ]);

            if (!tiposResponse.ok || !aplicacionesResponse.ok) {
                throw new Error("No se pudieron cargar los tipos de aplicación.");
            }

            const [tiposData, aplicacionesData] = await Promise.all([
                tiposResponse.json(),
                aplicacionesResponse.json(),
            ]);

            setTipos(Array.isArray(tiposData) ? (tiposData as TipoAplicacion[]) : []);
            setApplications(
                Array.isArray(aplicacionesData)
                    ? (aplicacionesData as BackendAplicacion[])
                    : [],
            );
            setError(null);
        } catch (loadError) {
            setTipos([]);
            setApplications([]);
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "No se pudieron cargar los tipos de aplicación.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void cargarDatos();
    }, [cargarDatos]);

    const usageCountByType = useMemo(() => {
        const result = new Map<number, number>();

        applications.forEach((application) => {
            const typeId = application.tipo_aplicacion?.id;
            if (!typeId) return;

            result.set(typeId, (result.get(typeId) ?? 0) + 1);
        });

        return result;
    }, [applications]);

    const resumen = useMemo(() => {
        const enUso = tipos.filter(
            (tipo) => (usageCountByType.get(tipo.id) ?? 0) > 0,
        ).length;
        const sinUso = tipos.length - enUso;
        const topTipo = [...tipos].sort(
            (left, right) =>
                (usageCountByType.get(right.id) ?? 0) -
                (usageCountByType.get(left.id) ?? 0),
        )[0];

        return {
            total: tipos.length,
            enUso,
            sinUso,
            destacado: topTipo
                ? `${topTipo.nombre} (${usageCountByType.get(topTipo.id) ?? 0})`
                : "Sin datos",
        };
    }, [tipos, usageCountByType]);

    const tiposFiltrados = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return tipos.filter((tipo) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                tipo.nombre.toLowerCase().includes(normalizedSearch);

            const usageCount = usageCountByType.get(tipo.id) ?? 0;
            const matchesEstado =
                estadoFilter === "Todos" ||
                (estadoFilter === "En uso" && usageCount > 0) ||
                (estadoFilter === "Sin uso" && usageCount === 0);

            return matchesSearch && matchesEstado;
        });
    }, [estadoFilter, search, tipos, usageCountByType]);

    const abrirCreacion = () => {
        setTipoEditando(null);
        setShowFormulario(true);
    };

    const abrirEdicion = (tipo: TipoAplicacion) => {
        setTipoEditando(tipo);
        setShowFormulario(true);
    };

    const guardarTipo = async (
        values: Record<string, string>,
    ): Promise<string | null> => {
        const payload = { nombre: values.nombre?.trim() ?? "" };

        if (!payload.nombre) {
            return "Completá el nombre del tipo.";
        }

        try {
            const response = tipoEditando
                ? await api.put(`/api/tipos-aplicaciones/${tipoEditando.id}`, payload)
                : await api.post("/api/tipos-aplicaciones", payload);

            if (!response.ok) {
                return await getApiErrorMessage(
                    response,
                    tipoEditando
                        ? "No se pudo actualizar el tipo."
                        : "No se pudo crear el tipo.",
                );
            }

            await cargarDatos();
            setShowFormulario(false);
            setTipoEditando(null);
            setError(null);
            return null;
        } catch (saveError) {
            return saveError instanceof Error
                ? saveError.message
                : "No se pudo guardar el tipo.";
        }
    };

    const handleEliminar = async () => {
        if (!tipoAEliminar) return;

        try {
            const response = await api.delete(
                `/api/tipos-aplicaciones/${tipoAEliminar.id}`,
            );

            if (!response.ok) {
                throw new Error(
                    await getApiErrorMessage(
                        response,
                        "No se pudo eliminar el tipo.",
                    ),
                );
            }

            setTipos((current) => current.filter((tipo) => tipo.id !== tipoAEliminar.id));
            setTipoDetalle((current) =>
                current?.id === tipoAEliminar.id ? null : current,
            );
            setTipoAEliminar(null);
            setError(null);
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "No se pudo eliminar el tipo.",
            );
        }
    };

    const tipoActual = tipoDetalle
        ? {
              ...tipoDetalle,
              usos: usageCountByType.get(tipoDetalle.id) ?? 0,
          }
        : null;

    return (
        <Body>
            <Head title="Tipos de Aplicación" />
            <div className="flex h-full min-h-0 flex-col p-8 font-sans">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Tipos de Aplicación
                            </h1>
                            <p className="mt-2 text-sm text-stone-500">
                                Ordená las categorías operativas para que el registro de
                                aplicaciones quede consistente.
                            </p>
                        </div>
                        {isProductor && (
                            <button
                                type="button"
                                onClick={abrirCreacion}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                            >
                                <Plus size={20} />
                                Nuevo tipo
                            </button>
                        )}
                    </div>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: "Total",
                                value: resumen.total,
                                detail: "Tipos registrados",
                            },
                            {
                                label: "En uso",
                                value: resumen.enUso,
                                detail: "Con aplicaciones cargadas",
                            },
                            {
                                label: "Sin uso",
                                value: resumen.sinUso,
                                detail: "Todavía sin vincular",
                            },
                            {
                                label: "Más usado",
                                value: resumen.destacado,
                                detail: "Según las aplicaciones actuales",
                            },
                        ].map((item) => (
                            <article
                                key={item.label}
                                className="rounded-2xl border border-stone-200/70 bg-[#FCFBF8]/78 p-5 shadow-sm backdrop-blur-sm"
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

                    <section className="rounded-2xl border border-stone-200/70 bg-white/55 p-5 shadow-sm backdrop-blur-sm md:p-6">
                        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_auto]">
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
                                        placeholder="Nombre del tipo..."
                                        className="w-full rounded-2xl border border-stone-200/70 bg-stone-50/80 py-3 pl-10 pr-4 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white/90"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Filter size={14} />
                                    Estado
                                </span>
                                <select
                                    value={estadoFilter}
                                    onChange={(event) =>
                                        setEstadoFilter(
                                            event.target.value as
                                                | "Todos"
                                                | "En uso"
                                                | "Sin uso",
                                        )
                                    }
                                    className="w-full rounded-2xl border border-stone-200/70 bg-stone-50/80 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white/90"
                                >
                                    <option value="Todos">Todos</option>
                                    <option value="En uso">En uso</option>
                                    <option value="Sin uso">Sin uso</option>
                                </select>
                            </label>

                            <div className="flex items-end">
                                <div className="w-full rounded-2xl border border-stone-200/70 bg-stone-50/80 px-4 py-3 text-sm font-semibold text-stone-600 backdrop-blur-sm">
                                    {tiposFiltrados.length} visibles
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
                                <div className="col-span-full rounded-2xl border border-dashed border-stone-300/70 bg-white/55 px-6 py-12 text-center text-sm text-stone-500 backdrop-blur-sm">
                                    Cargando tipos...
                                </div>
                            ) : tiposFiltrados.length === 0 ? (
                                <div className="col-span-full rounded-2xl border border-dashed border-stone-300/70 bg-white/55 px-6 py-14 text-center backdrop-blur-sm">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100/65 text-stone-500">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h2 className="mt-4 text-xl font-bold text-stone-900">
                                        No hay tipos para mostrar
                                    </h2>
                                    <p className="mt-2 text-sm text-stone-500">
                                        Ajustá los filtros o registrá un nuevo tipo para empezar.
                                    </p>
                                </div>
                            ) : (
                                tiposFiltrados.map((tipo) => {
                                    const usageCount = usageCountByType.get(tipo.id) ?? 0;

                                    return (
                                        <CatalogItemCard
                                            key={tipo.id}
                                            eyebrow="Tipo"
                                            title={tipo.nombre}
                                            badge={{
                                                label: usageCount > 0 ? "En uso" : "Disponible",
                                                className:
                                                    usageCount > 0
                                                        ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                                                        : "bg-stone-100 text-stone-700 ring-stone-200",
                                            }}
                                            stats={[
                                                {
                                                    label: "Aplicaciones",
                                                    value: String(usageCount),
                                                },
                                                {
                                                    label: "Estado",
                                                    value: usageCount > 0 ? "Activo" : "Sin uso",
                                                },
                                            ]}
                                            footer={{
                                                label: "Alta en catálogo",
                                                value: formatDate(tipo.created_at),
                                            }}
                                            note="Disponible para clasificar nuevas labores dentro del módulo."
                                            onView={() => setTipoDetalle(tipo)}
                                            onEdit={isProductor ? () => abrirEdicion(tipo) : undefined}
                                            onDelete={isProductor ? () => setTipoAEliminar(tipo) : undefined}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <ModalFormularioCatalogoAplicacion
                show={showFormulario}
                onClose={() => {
                    setShowFormulario(false);
                    setTipoEditando(null);
                }}
                onSubmit={guardarTipo}
                initialValues={{
                    nombre: tipoEditando?.nombre ?? "",
                }}
                fields={FORM_FIELDS}
                title={
                    tipoEditando
                        ? "Editar tipo de aplicación"
                        : "Registrar tipo de aplicación"
                }
                description="Definí la categoría operativa que se usará al registrar aplicaciones."
                submitLabel={tipoEditando ? "Guardar cambios" : "Registrar tipo"}
            />

            <ModalConfirmacion
                show={tipoAEliminar !== null}
                titulo="Eliminar tipo"
                mensaje={`¿Seguro que querés eliminar "${tipoAEliminar?.nombre ?? ""}"?`}
                onConfirmar={handleEliminar}
                onCancelar={() => setTipoAEliminar(null)}
            />

            <Modal show={tipoActual !== null} onClose={() => setTipoDetalle(null)} maxWidth="lg">
                {tipoActual && (
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                                    Detalle de tipo
                                </p>
                                <h2 className="mt-2 text-2xl font-black text-stone-900">
                                    {tipoActual.nombre}
                                </h2>
                                <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                                    {tipoActual.usos > 0 ? "En uso" : "Disponible"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTipoDetalle(null)}
                                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-stone-50/80 p-4">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Aplicaciones vinculadas
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {tipoActual.usos}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-stone-50/80 p-4">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Estado actual
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {tipoActual.usos > 0 ? "Activo" : "Sin uso"}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-stone-50/80 p-4 sm:col-span-2">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Alta en catálogo
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {formatDate(tipoActual.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </Body>
    );
}
