import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, Filter, Loader2 } from "lucide-react";
import Body from "@/components/ui/Tabs/Body";
import api from "@/lib/api";

interface Campania {
    id: number;
    nombre: string;
    estado: string;
}

export default function ProductividadCampanias() {
    const [campanias, setCampanias] = useState<Campania[]>([]);
    const [campaniaId, setCampaniaId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getCampanias = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/campanias");
            if (!response.ok) {
                throw new Error();
            }

            const data = await response.json();
            setCampanias(data);
            setError(null);
        } catch {
            setError("No se pudieron cargar las campanas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getCampanias();
    }, [getCampanias]);

    const productividadDownloadUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (campaniaId) {
            params.set("campania_id", campaniaId);
        }

        const query = params.toString();
        return `/reportes/productividad-campanias.pdf${query ? `?${query}` : ""}`;
    }, [campaniaId]);

    const aplicacionesDownloadUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (campaniaId) {
            params.set("campania_id", campaniaId);
        }

        const query = params.toString();
        return `/reportes/aplicaciones.pdf${query ? `?${query}` : ""}`;
    }, [campaniaId]);

    const rendimientoLotesDownloadUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (campaniaId) {
            params.set("campania_id", campaniaId);
        }

        const query = params.toString();
        return `/reportes/rendimiento-lotes.pdf${query ? `?${query}` : ""}`;
    }, [campaniaId]);

    const saludAgronomicaDownloadUrl = "/reportes/salud-agronomica.pdf";


    const catalogoDownloadUrl = "/reportes/productos.pdf";

    const handleDownload = (url: string) => {
        window.location.href = url;
    };

    return (
        <Body>
            <Head title="Reportes" />

            <div className="min-h-full p-8 font-sans">
                <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Reportes
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Generar reportes con estadisticas
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Productividad por campana
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                        Incluye rendimiento promedio, humedad promedio,
                                        mejor y peor resultado, duracion de campana y
                                        comparacion entre campanas.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDownload(productividadDownloadUrl)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                            >
                                <Download size={18} />
                                Descargar PDF
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <Filter size={16} />
                                    Campana
                                </span>
                                <select
                                    value={campaniaId}
                                    onChange={(event) => setCampaniaId(event.target.value)}
                                    disabled={loading}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 disabled:cursor-not-allowed disabled:bg-gray-50"
                                >
                                    <option value="">Todas las campanas</option>
                                    {campanias.map((campania) => (
                                        <option key={campania.id} value={campania.id}>
                                            {campania.nombre} ({campania.estado})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {loading && (
                                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 size={16} className="animate-spin" />
                                    Cargando campanas
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Uso de insumos y aplicaciones
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                        Incluye cantidad de aplicaciones por campana,
                                        lote, producto y tipo; costo operativo total y
                                        costo por campana.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDownload(aplicacionesDownloadUrl)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                            >
                                <Download size={18} />
                                Descargar PDF
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-lime-700">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Rendimiento por lote
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                        Incluye rinde por hectarea, evolucion historica
                                        por lote, lotes mas productivos y lotes con
                                        mayor variabilidad.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDownload(rendimientoLotesDownloadUrl)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                            >
                                <Download size={18} />
                                Descargar PDF
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Salud agronómica del lote
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                        Incluye distribución de lotes por estado, rangos de pH,
                                        cobertura de datos de napa y detalle completo por lote
                                        con hectáreas, pH y características.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDownload(saludAgronomicaDownloadUrl)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                            >
                                <Download size={18} />
                                Descargar PDF
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Catálogo de Productos y Uso
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                        Incluye ranking de productos más aplicados, insumos sin uso (stock inmovilizado),
                                        categorías más demandadas y distribución de inventario por formato físico.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDownload(catalogoDownloadUrl)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                            >
                                <Download size={18} />
                                Descargar PDF
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </Body>
    );
}
