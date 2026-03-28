import Body from "@/components/ui/Tabs/Body";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    Activity,
    ArrowLeft,
    ChartColumnBig,
    Droplets,
    Fingerprint,
    Layers,
    Timer,
} from "lucide-react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface LoteDetallePageProps {
    loteId: number | string;
}

interface BackendLote {
    id: number;
    nombre: string;
    caracteristicas: string;
    estado: string;
    latitud: number | string;
    longitud: number | string;
    hectareas: number;
    id_campo: number;
    ph: number;
    napa: number;
}

const estadoBadgeColors: Record<string, string> = {
    produccion: "bg-green-700 hover:bg-green-800",
    barbecho: "bg-red-600 hover:bg-red-700",
    preparacion: "bg-yellow-600 hover:bg-yellow-700",
    disponible: "bg-emerald-500 hover:bg-emerald-600",
};

export default function LoteDetalle() {
    const { loteId } = usePage().props as unknown as LoteDetallePageProps;
    const [lote, setLote] = useState<BackendLote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadLote = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/lotes/${loteId}`, {
                    headers: { Accept: "application/json" },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setLote(null);
                        setError("Lote no encontrado.");
                        return;
                    }
                    throw new Error("No se pudo obtener el detalle del lote.");
                }

                const payload = (await response.json()) as BackendLote;
                setLote(payload);
                setError(null);
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                setLote(null);
                setError("Error al cargar el detalle del lote.");
            } finally {
                setLoading(false);
            }
        };

        void loadLote();
        return () => controller.abort();
    }, [loteId]);

    if (loading) {
        return (
            <Body>
                <Head title="Cargando lote" />
                <div className="min-h-full p-8 font-sans">
                    <div className="mx-auto max-w-7xl rounded-3xl border border-stone-300 bg-[#fdf8f0] p-8">
                        <p className="text-xl font-semibold text-gray-800">
                            Cargando detalle del lote...
                        </p>
                    </div>
                </div>
            </Body>
        );
    }

    if (!lote) {
        return (
            <Body>
                <Head title="Lote no encontrado" />
                <div className="min-h-full p-8 font-sans">
                    <div className="mx-auto max-w-7xl rounded-3xl border border-stone-300 bg-[#fdf8f0] p-8">
                        <p className="text-xl font-semibold text-gray-800">
                            {error ?? "Lote no disponible"}
                        </p>
                        <Link
                            href="/lotes"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <ArrowLeft size={16} />
                            Volver a lotes
                        </Link>
                    </div>
                </div>
            </Body>
        );
    }

    const latitude = Number(lote.latitud);
    const longitude = Number(lote.longitud);
    const hasValidCoords =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        Math.abs(latitude) <= 90 &&
        Math.abs(longitude) <= 180;

    const centroLote: LatLngExpression = hasValidCoords
        ? [latitude, longitude]
        : [-34.6037, -58.3816];

    const badgeClass =
        estadoBadgeColors[lote.estado] ?? "bg-stone-500 hover:bg-stone-600";

    return (
        <Body>
            <Head title={`Detalle - ${lote.nombre}`} />

            <div className="flex h-full w-full flex-col overflow-hidden p-4 font-sans md:p-6">
                {/* Header */}
                <div className="flex mx-auto mb-4 w-full max-w-8xl shrink-0 justify-start">
                    <div className="flex flex-col gap-6">
                        <Button
                            variant="outline"
                            asChild
                            className="gap-2 border-stone-300 bg-[#fdf8f0] text-stone-700 hover:bg-stone-200 hover:text-stone-900 max-w-[160px]"
                        >
                            <Link href="/lotes">
                                <ArrowLeft size={16} />
                                Volver a Lotes
                            </Link>
                        </Button>

                        <div className="flex flex-row gap-6">
                            <Badge
                                className={`w-fit px-3 py-1 text-xs font-bold uppercase tracking-wider text-white ${badgeClass}`}
                            >
                                {lote.estado}
                            </Badge>
                            <div className="flex flex-col">
                                <div className="flex flex-row gap-2">
                                    <Button asChild variant="default">
                                        <Link href={`/lotes/${lote.id}`}>
                                            <Layers size={16} />
                                            Ver campañas
                                        </Link>
                                    </Button>
                                    <Button className="bg-stone-200 text-stone-400 hover:bg-stone-200 cursor-not-allowed">Ver mapas</Button>
                                    <Button className="bg-stone-200 text-stone-400 hover:bg-stone-200 cursor-not-allowed">Ver informes</Button>
                                    <Button>Ver cultivos</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Map */}
                    <Card className="lg:col-span-3 h-full w-full mx-auto max-w-6xl min-h-[400px] md:min-h-[500px] lg:min-h-[60vh] flex-col overflow-hidden rounded-xl border-stone-300 bg-[#FCFBF8] shadow-sm">
                        <div className="relative h-[100%] w-full shrink-0 border-b border-stone-200">
                            <MapContainer
                                center={centroLote}
                                zoom={13}
                                scrollWheelZoom={true}
                                className="z-[10] h-full w-full"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                />
                                {hasValidCoords && (
                                    <CircleMarker
                                        center={[latitude, longitude]}
                                        radius={8}
                                        pathOptions={{
                                            color: "#16a34a",
                                            fillColor: "#16a34a",
                                            fillOpacity: 0.8,
                                        }}
                                    />
                                )}
                            </MapContainer>
                            <div className="pointer-events-none absolute inset-0 z-[20] bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                    </Card>

                    {/* Right panel */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4 w-full">

                        {/* Info principal */}
                        <Card className="col-span-2 flex min-h-[220px] max-h-[230px] flex-col justify-between border-stone-200 bg-[#FCFBF8] p-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900">
                                        {lote.nombre}
                                    </h2>
                                    <p className="text-sm font-medium text-stone-500">
                                        Superficie:{" "}
                                        <span className="font-bold text-stone-800">
                                            {lote.hectareas.toLocaleString("es-AR")} Ha
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                                >
                                    Cambiar nombre
                                </Button>
                            </div>

                            <div className="hidden mt-6 flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                    Último cultivo registrado
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ej: Soja 2025"
                                        className="border-stone-200 bg-white focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                                        Guardar
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Cultivo actual */}
                        <Card className="flex flex-col justify-start border-stone-100 bg-white/60 p-0 shadow-sm transition-colors hover:bg-white">
                            <CardHeader className="border-b border-stone-100 p-6 pb-4">
                                <h2 className="text-xl font-bold uppercase tracking-tight text-stone-700">
                                    Cultivo actual
                                </h2>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 p-6 pt-4">
                                <span className="text-2xl font-black uppercase text-stone-800">
                                    —
                                </span>
                                <div className="flex items-center gap-2">
                                    <Fingerprint className="size-4 text-stone-500" />
                                    <span className="text-sm text-stone-700">Variedad: </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="size-4 text-stone-500" />
                                    <span className="text-sm text-stone-700">Estado: </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer className="size-4 text-stone-500" />
                                    <span className="text-sm text-stone-700">Días a cosecha: </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rendimiento estimado */}
                        <Card className="group relative flex flex-col justify-between rounded-xl border border-stone-100 bg-white/60 p-4 shadow-sm transition-colors hover:bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-stone-800">
                                    Rendimiento Estimado
                                </h3>
                                <ChartColumnBig className="size-6 text-yellow-600 transition-colors group-hover:text-yellow-700" />
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-stone-500">Proyección de Cosecha:</p>
                                <span className="text-xl font-bold text-emerald-700">
                                    — kg/Ha
                                </span>
                            </div>
                            <div className="mt-4 h-20 w-full rounded-md bg-stone-100 p-2">
                                <svg viewBox="0 0 100 50" className="h-full w-full">
                                    <polyline
                                        fill="none"
                                        stroke="#10B981"
                                        strokeWidth="2"
                                        points="0,40 20,20 40,35 60,15 80,30 100,10"
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#F59E0B"
                                        strokeWidth="2"
                                        points="0,30 20,35 40,25 60,30 80,20 100,5"
                                        strokeDasharray="3 3"
                                    />
                                </svg>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-4 w-full justify-center text-stone-400 hover:bg-transparent cursor-not-allowed"
                            >
                                Ver informes detallados
                            </Button>
                        </Card>

                        {/* Historial de Suelo */}
                        <Card className="col-span-2 group relative flex flex-col justify-between rounded-xl border border-stone-100 bg-white/60 p-4 shadow-sm transition-colors hover:bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-stone-800">
                                    Características del Suelo
                                </h3>
                                <Droplets className="size-6 text-blue-600 transition-colors group-hover:text-blue-700" />
                            </div>
                            <div className="mt-4 flex flex-col gap-2">
                                <p className="text-sm text-stone-500">
                                    pH:{" "}
                                    <span className="font-bold text-stone-700">
                                        {lote.ph ?? "—"}
                                    </span>
                                </p>
                                <p className="text-sm text-stone-500">
                                    Profundidad de napa:{" "}
                                    <span className="font-bold text-stone-700">
                                        {lote.napa != null ? `${lote.napa} m` : "—"}
                                    </span>
                                </p>
                                {lote.caracteristicas && (
                                    <p className="text-sm text-stone-500">
                                        Características:{" "}
                                        <span className="font-bold text-stone-700">
                                            {lote.caracteristicas}
                                        </span>
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden mt-4 w-full justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                            >
                                Ver detalle del suelo
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </Body>
    );
}
