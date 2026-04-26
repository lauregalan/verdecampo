import { Head, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Droplets, Filter, Package2, Plus, Search } from "lucide-react";
import Body from "@/components/ui/Tabs/Body";
import { ScrollArea } from "@/components/ui/scroll-area";
import Modal from "@/components/Modals/Modal";
import ModalConfirmacion from "@/components/Modals/ModalConfirmacion";
import ModalFormularioCatalogoAplicacion from "@/components/Modals/ModalFormularioCatalogoAplicacion";
import CatalogItemCard from "@/Pages/Aplicaciones/components/CatalogItemCard";
import api from "@/lib/api";
import type {
    BackendAplicacion,
    ProductoAplicacion,
    ProductoFisico,
} from "@/Pages/Aplicaciones/types";
import { formatDate, getApiErrorMessage } from "@/Pages/Aplicaciones/utils";

const tipoTone: Record<ProductoFisico, string> = {
    GRANULADO: "bg-amber-100 text-amber-700 ring-amber-200",
    LIQUIDO: "bg-sky-100 text-sky-700 ring-sky-200",
};

const FORM_FIELDS = [
    {
        name: "nombre",
        label: "Nombre *",
        placeholder: "Ej: Glifosato Premium",
    },
    {
        name: "concentracion",
        label: "Concentración *",
        placeholder: "Ej: 48%",
    },
    {
        name: "tipo",
        label: "Formato físico *",
        type: "select" as const,
        placeholder: "Seleccioná un formato",
        options: [
            { label: "Granulado", value: "GRANULADO" },
            { label: "Líquido", value: "LIQUIDO" },
        ],
    },
];

export default function Productos() {
    const authUser = usePage().props.auth?.user as { roles?: string[] } | undefined;
    const isProductor = authUser?.roles?.includes('Productor') ?? false;

    const [productos, setProductos] = useState<ProductoAplicacion[]>([]);
    const [applications, setApplications] = useState<BackendAplicacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [tipoFilter, setTipoFilter] = useState<ProductoFisico | "Todos">(
        "Todos",
    );
    const [showFormulario, setShowFormulario] = useState(false);
    const [productoEditando, setProductoEditando] =
        useState<ProductoAplicacion | null>(null);
    const [productoDetalle, setProductoDetalle] =
        useState<ProductoAplicacion | null>(null);
    const [productoAEliminar, setProductoAEliminar] =
        useState<ProductoAplicacion | null>(null);

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            const [productosResponse, aplicacionesResponse] = await Promise.all([
                api.get("/api/productos-aplicaciones"),
                api.get("/api/aplicaciones"),
            ]);

            if (!productosResponse.ok || !aplicacionesResponse.ok) {
                throw new Error("No se pudieron cargar los productos de aplicación.");
            }

            const [productosData, aplicacionesData] = await Promise.all([
                productosResponse.json(),
                aplicacionesResponse.json(),
            ]);

            setProductos(
                Array.isArray(productosData)
                    ? (productosData as ProductoAplicacion[])
                    : [],
            );
            setApplications(
                Array.isArray(aplicacionesData)
                    ? (aplicacionesData as BackendAplicacion[])
                    : [],
            );
            setError(null);
        } catch (loadError) {
            setProductos([]);
            setApplications([]);
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "No se pudieron cargar los productos de aplicación.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void cargarDatos();
    }, [cargarDatos]);

    const usageCountByProduct = useMemo(() => {
        const result = new Map<number, number>();

        applications.forEach((application) => {
            const productId = application.producto_aplicacion?.id;
            if (!productId) return;

            result.set(productId, (result.get(productId) ?? 0) + 1);
        });

        return result;
    }, [applications]);

    const resumen = useMemo(
        () => ({
            total: productos.length,
            granulados: productos.filter((producto) => producto.tipo === "GRANULADO")
                .length,
            liquidos: productos.filter((producto) => producto.tipo === "LIQUIDO")
                .length,
            enUso: productos.filter(
                (producto) => (usageCountByProduct.get(producto.id) ?? 0) > 0,
            ).length,
        }),
        [productos, usageCountByProduct],
    );

    const productosFiltrados = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return productos.filter((producto) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                [producto.nombre, producto.concentracion, producto.tipo].some((value) =>
                    value.toLowerCase().includes(normalizedSearch),
                );

            const matchesTipo =
                tipoFilter === "Todos" || producto.tipo === tipoFilter;

            return matchesSearch && matchesTipo;
        });
    }, [productos, search, tipoFilter]);

    const abrirCreacion = () => {
        setProductoEditando(null);
        setShowFormulario(true);
    };

    const abrirEdicion = (producto: ProductoAplicacion) => {
        setProductoEditando(producto);
        setShowFormulario(true);
    };

    const guardarProducto = async (
        values: Record<string, string>,
    ): Promise<string | null> => {
        const payload = {
            nombre: values.nombre?.trim() ?? "",
            concentracion: values.concentracion?.trim() ?? "",
            tipo: values.tipo as ProductoFisico,
        };

        if (!payload.nombre || !payload.concentracion || !payload.tipo) {
            return "Completá todos los campos obligatorios.";
        }

        try {
            const response = productoEditando
                ? await api.put(
                      `/api/productos-aplicaciones/${productoEditando.id}`,
                      payload,
                  )
                : await api.post("/api/productos-aplicaciones", payload);

            if (!response.ok) {
                return await getApiErrorMessage(
                    response,
                    productoEditando
                        ? "No se pudo actualizar el producto."
                        : "No se pudo crear el producto.",
                );
            }

            await cargarDatos();
            setShowFormulario(false);
            setProductoEditando(null);
            setError(null);
            return null;
        } catch (saveError) {
            return saveError instanceof Error
                ? saveError.message
                : "No se pudo guardar el producto.";
        }
    };

    const handleEliminar = async () => {
        if (!productoAEliminar) return;

        try {
            const response = await api.delete(
                `/api/productos-aplicaciones/${productoAEliminar.id}`,
            );

            if (!response.ok) {
                throw new Error(
                    await getApiErrorMessage(
                        response,
                        "No se pudo eliminar el producto.",
                    ),
                );
            }

            setProductos((current) =>
                current.filter((producto) => producto.id !== productoAEliminar.id),
            );
            setProductoDetalle((current) =>
                current?.id === productoAEliminar.id ? null : current,
            );
            setProductoAEliminar(null);
            setError(null);
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "No se pudo eliminar el producto.",
            );
        }
    };

    const productoActual = productoDetalle
        ? {
              ...productoDetalle,
              usos: usageCountByProduct.get(productoDetalle.id) ?? 0,
          }
        : null;

    return (
        <Body>
            <Head title="Productos de Aplicación" />
            <div className="flex h-full min-h-0 flex-col p-8 font-sans">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Productos de Aplicación
                            </h1>
                            <p className="mt-2 text-sm text-stone-500">
                                Gestioná el catálogo de insumos reutilizando el mismo flujo
                                visual del módulo de aplicaciones.
                            </p>
                        </div>
                        {isProductor && (
                            <button
                                type="button"
                                onClick={abrirCreacion}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                            >
                                <Plus size={20} />
                                Nuevo producto
                            </button>
                        )}
                    </div>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: "Total",
                                value: resumen.total,
                                detail: "Productos registrados",
                            },
                            {
                                label: "Granulados",
                                value: resumen.granulados,
                                detail: "Formato sólido",
                            },
                            {
                                label: "Líquidos",
                                value: resumen.liquidos,
                                detail: "Formato fluido",
                            },
                            {
                                label: "En uso",
                                value: resumen.enUso,
                                detail: "Con aplicaciones asociadas",
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
                                        placeholder="Nombre, concentración o formato..."
                                        className="w-full rounded-2xl border border-stone-200/70 bg-stone-50/80 py-3 pl-10 pr-4 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white/90"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Filter size={14} />
                                    Formato
                                </span>
                                <select
                                    value={tipoFilter}
                                    onChange={(event) =>
                                        setTipoFilter(
                                            event.target.value as ProductoFisico | "Todos",
                                        )
                                    }
                                    className="w-full rounded-2xl border border-stone-200/70 bg-stone-50/80 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white/90"
                                >
                                    <option value="Todos">Todos los formatos</option>
                                    <option value="GRANULADO">Granulado</option>
                                    <option value="LIQUIDO">Líquido</option>
                                </select>
                            </label>

                            <div className="flex items-end">
                                <div className="w-full rounded-2xl border border-stone-200/70 bg-stone-50/80 px-4 py-3 text-sm font-semibold text-stone-600 backdrop-blur-sm">
                                    {productosFiltrados.length} visibles
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
                                    Cargando productos...
                                </div>
                            ) : productosFiltrados.length === 0 ? (
                                <div className="col-span-full rounded-2xl border border-dashed border-stone-300/70 bg-white/55 px-6 py-14 text-center backdrop-blur-sm">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100/65 text-stone-500">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h2 className="mt-4 text-xl font-bold text-stone-900">
                                        No hay productos para mostrar
                                    </h2>
                                    <p className="mt-2 text-sm text-stone-500">
                                        Ajustá los filtros o cargá un nuevo producto para empezar.
                                    </p>
                                </div>
                            ) : (
                                productosFiltrados.map((producto) => (
                                    <CatalogItemCard
                                        key={producto.id}
                                        eyebrow="Producto"
                                        title={producto.nombre}
                                        badge={{
                                            label:
                                                producto.tipo === "LIQUIDO"
                                                    ? "Líquido"
                                                    : "Granulado",
                                            className: tipoTone[producto.tipo],
                                        }}
                                        stats={[
                                            {
                                                label: "Concentración",
                                                value: producto.concentracion,
                                            },
                                            {
                                                label: "Aplicaciones",
                                                value: String(
                                                    usageCountByProduct.get(producto.id) ?? 0,
                                                ),
                                            },
                                        ]}
                                        footer={{
                                            label: "Alta en catálogo",
                                            value: formatDate(producto.created_at),
                                        }}
                                        note="Disponible para ser seleccionado en nuevas aplicaciones."
                                        onView={() => setProductoDetalle(producto)}
                                        onEdit={isProductor ? () => abrirEdicion(producto) : undefined}
                                        onDelete={isProductor ? () => setProductoAEliminar(producto) : undefined}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <ModalFormularioCatalogoAplicacion
                show={showFormulario}
                onClose={() => {
                    setShowFormulario(false);
                    setProductoEditando(null);
                }}
                onSubmit={guardarProducto}
                initialValues={{
                    nombre: productoEditando?.nombre ?? "",
                    concentracion: productoEditando?.concentracion ?? "",
                    tipo: productoEditando?.tipo ?? "",
                }}
                fields={FORM_FIELDS}
                title={
                    productoEditando
                        ? "Editar producto de aplicación"
                        : "Registrar producto de aplicación"
                }
                description="Definí el nombre comercial, la concentración y el formato físico."
                submitLabel={productoEditando ? "Guardar cambios" : "Registrar producto"}
            />

            <ModalConfirmacion
                show={productoAEliminar !== null}
                titulo="Eliminar producto"
                mensaje={`¿Seguro que querés eliminar "${productoAEliminar?.nombre ?? ""}"?`}
                onConfirmar={handleEliminar}
                onCancelar={() => setProductoAEliminar(null)}
            />

            <Modal
                show={productoActual !== null}
                onClose={() => setProductoDetalle(null)}
                maxWidth="lg"
            >
                {productoActual && (
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                                    Detalle de producto
                                </p>
                                <h2 className="mt-2 text-2xl font-black text-stone-900">
                                    {productoActual.nombre}
                                </h2>
                                <p
                                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${tipoTone[productoActual.tipo]}`}
                                >
                                    {productoActual.tipo === "LIQUIDO"
                                        ? "Líquido"
                                        : "Granulado"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setProductoDetalle(null)}
                                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-stone-50/80 p-4">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Concentración
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {productoActual.concentracion}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-stone-50/80 p-4">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Aplicaciones vinculadas
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {productoActual.usos}
                                </div>
                            </div>
                            <div className="rounded-2xl bg-stone-50/80 p-4 sm:col-span-2">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Alta en catálogo
                                </div>
                                <div className="mt-2 text-base font-semibold text-stone-900">
                                    {formatDate(productoActual.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </Body>
    );
}
