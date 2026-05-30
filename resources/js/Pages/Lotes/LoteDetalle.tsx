import Body from "@/components/ui/Tabs/Body";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    Activity,
    ArrowLeft,
    ChartColumnBig,
    Droplets,
    Fingerprint,
    Timer,
} from "lucide-react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import ModalFormularioLote from "./ModalFormularioLote";
import { LoteCard } from "./types";
import {
    estimarRendimientoLote,
    getCultivoProfile,
    getSiembraActiva,
    type RendimientoLoteEstimado,
} from "@/lib/rendimiento";

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
    campo_id: number;
    ph: number;
    napa: number;
    siembras?: any[];
}

interface CultivoActual {
    id: number;
    tipo: string;
    variedad: string;
    fecha_siembra: string;
    dias_transcurridos: number;
    dias_a_cosecha: number;
}

const estadoBadgeColors: Record<string, string> = {
    produccion: "bg-green-700 hover:bg-green-800",
    barbecho: "bg-red-600 hover:bg-red-700",
    preparacion: "bg-yellow-600 hover:bg-yellow-700",
    disponible: "bg-emerald-500 hover:bg-emerald-600",
};

export default function LoteDetalle() {
    const { loteId } = usePage().props as unknown as LoteDetallePageProps;
    const returnTo = useMemo(() => {
        if (typeof window === "undefined") {
            return "/lotes";
        }

        const nextUrl = new URLSearchParams(window.location.search).get(
            "returnTo",
        );

        return nextUrl && nextUrl.startsWith("/") ? nextUrl : "/lotes";
    }, []);
    const [lote, setLote] = useState<BackendLote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cultivoActual, setCultivoActual] = useState<CultivoActual | null>(null);
    const [rendimientoEstimado, setRendimientoEstimado] =
        useState<RendimientoLoteEstimado | null>(null);
    const [showEditarModal, setShowEditarModal] = useState(false);

    const loadCultivoActual = (loteData: BackendLote) => {
        const siembraActiva = getSiembraActiva(loteData.siembras || []);

        if (!siembraActiva) {
            setCultivoActual(null);
            return;
        }

        const fechaSiembra = new Date(siembraActiva.fecha_siembra);
        const diasTranscurridos = Math.floor(
            (new Date().getTime() - fechaSiembra.getTime()) /
                (1000 * 60 * 60 * 24),
        );
        const diasCiclo = getCultivoProfile(siembraActiva.cultivo?.tipo).cycleDays;

        setCultivoActual({
            id: siembraActiva.cultivo?.id || 0,
            tipo: siembraActiva.cultivo?.tipo || "Desconocido",
            variedad: siembraActiva.cultivo?.variedad || "Desconocida",
            fecha_siembra: siembraActiva.fecha_siembra,
            dias_transcurridos: diasTranscurridos,
            dias_a_cosecha: Math.max(0, diasCiclo - diasTranscurridos),
        });
    };

    const calcularRendimientoEstimado = (loteData: BackendLote) => {
        setRendimientoEstimado(estimarRendimientoLote(loteData));
    };

    const handleEditarLote = (loteActualizado: LoteCard) => {
        if (!lote) return;

        const loteActualizadoLocal: BackendLote = {
            ...lote,
            nombre: loteActualizado.name,
            estado: loteActualizado.status,
            latitud: loteActualizado.latitude,
            longitud: loteActualizado.longitude,
            hectareas: loteActualizado.hectareas,
            caracteristicas: loteActualizado.caracteristicas,
            ph: loteActualizado.ph,
            napa: loteActualizado.napa,
        };

        setLote(loteActualizadoLocal);
        calcularRendimientoEstimado(loteActualizadoLocal);
    };

    const loteToForm = (loteData: BackendLote): LoteCard => ({
        id: loteData.id,
        campo_id: loteData.campo_id,
        name: loteData.nombre,
        status: loteData.estado,
        latitude: Number(loteData.latitud),
        longitude: Number(loteData.longitud),
        hectareas: loteData.hectareas,
        caracteristicas: loteData.caracteristicas,
        ph: loteData.ph,
        napa: loteData.napa,
        polygon: [],
    });

    useEffect(() => {
        const controller = new AbortController();

        const loadLote = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/lotes/${loteId}`);

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

                loadCultivoActual(payload);
                calcularRendimientoEstimado(payload);
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
                            href={returnTo}
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

            <div className="flex h-full w-full flex-col overflow-y-auto p-4 font-sans md:p-6">
                <div className="mx-auto mb-4 flex w-full max-w-8xl shrink-0 justify-start">
                    <div className="flex flex-col gap-6">
                        <Button
                            variant="outline"
                            asChild
                            className="max-w-[160px] gap-2 border-stone-300 bg-[#fdf8f0] text-stone-700 hover:bg-stone-200 hover:text-stone-900"
                        >
                            <Link href={returnTo}>
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
                                    <Button onClick={() => setShowEditarModal(true)}>
                                        Editar
                                    </Button>
                                    <Button asChild variant="default">
                                        <Link href={`/campanias?loteId=${lote.id}`}>
                                            Ver campanias
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={`/aplicaciones?loteId=${lote.id}`}>
                                            Ver aplicaciones
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={`/siembras?loteId=${lote.id}`}>
                                            Ver siembras
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
                    <Card className="mx-auto h-full min-h-[360px] w-full max-w-6xl flex-col overflow-hidden rounded-xl border-stone-300 bg-[#FCFBF8] shadow-sm md:min-h-[480px] lg:col-span-3 lg:min-h-[62vh]">
                        <div className="relative h-full w-full shrink-0 border-b border-stone-200">
                            <MapContainer
                                center={centroLote}
                                zoom={13}
                                scrollWheelZoom
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

                    <div className="grid w-full grid-cols-1 gap-3 lg:col-span-2 lg:auto-rows-min xl:grid-cols-2">
                        <Card className="flex flex-col justify-between border-stone-200 bg-[#FCFBF8] p-4 shadow-sm xl:col-span-2">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-tight text-stone-900">
                                        {lote.nombre}
                                    </h2>
                                    <p className="text-xs font-medium text-stone-500">
                                        Superficie:{" "}
                                        <span className="font-bold text-stone-800">
                                            {lote.hectareas.toLocaleString("es-AR")} Ha
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="flex flex-col justify-start border-stone-100 bg-white/60 p-0 shadow-sm transition-colors hover:bg-white">
                            <CardHeader className="border-b border-stone-100 p-4 pb-3">
                                <h2 className="text-base font-bold uppercase tracking-tight text-stone-700">
                                    Cultivo actual
                                </h2>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 p-4 pt-3">
                                {cultivoActual ? (
                                    <>
                                        <span className="text-lg font-black uppercase text-stone-800">
                                            {cultivoActual.tipo} {cultivoActual.variedad}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Fingerprint className="size-4 text-stone-500" />
                                            <span className="text-xs text-stone-700">
                                                Fecha de siembra:{" "}
                                                {new Date(
                                                    cultivoActual.fecha_siembra,
                                                ).toLocaleDateString("es-AR")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="size-4 text-stone-500" />
                                            <span className="text-xs text-stone-700">
                                                Dias transcurridos:{" "}
                                                {cultivoActual.dias_transcurridos}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Timer className="size-4 text-stone-500" />
                                            <span className="text-xs text-stone-700">
                                                Dias a cosecha:{" "}
                                                {cultivoActual.dias_a_cosecha}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-lg font-black uppercase text-stone-800">
                                            —
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Fingerprint className="size-4 text-stone-500" />
                                            <span className="text-xs text-stone-700">
                                                Variedad: Sin informacion
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="size-4 text-stone-500" />
                                            <span className="text-xs text-stone-700">
                                                Estado: Sin cultivo activo
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Timer className="size-4 text-stone-500" />
                                            <span className="text-xs text-stone-700">
                                                Dias a cosecha: N/A
                                            </span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="group relative flex flex-col justify-between rounded-xl border border-stone-100 bg-white/60 p-3 shadow-sm transition-colors hover:bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-stone-800">
                                    Rendimiento Estimado
                                </h3>
                                <ChartColumnBig className="size-5 text-yellow-600 transition-colors group-hover:text-yellow-700" />
                            </div>
                            <div className="mt-3 space-y-1.5">
                                <p className="text-xs text-stone-500">
                                    Proyeccion por hectarea:
                                </p>
                                <span className="text-lg font-bold text-emerald-700">
                                    {rendimientoEstimado
                                        ? `${rendimientoEstimado.kg_por_hectarea.toLocaleString()} kg/Ha`
                                        : "— kg/Ha"}
                                </span>
                                <p className="text-xs text-stone-500">
                                    Total estimado:{" "}
                                    <span className="font-semibold text-stone-700">
                                        {rendimientoEstimado
                                            ? `${rendimientoEstimado.kg_total.toLocaleString()} kg`
                                            : "—"}
                                    </span>
                                </p>
                                <p className="text-xs text-stone-500">
                                    Confianza:{" "}
                                    <span className="font-semibold text-stone-700">
                                        {rendimientoEstimado
                                            ? `${rendimientoEstimado.confianza}%`
                                            : "—"}
                                    </span>
                                </p>
                                {rendimientoEstimado?.progreso !== null && (
                                    <p className="text-xs text-stone-500">
                                        Avance del cultivo:{" "}
                                        <span className="font-semibold text-stone-700">
                                            {rendimientoEstimado?.progreso}%
                                        </span>
                                    </p>
                                )}
                            </div>
                            <div className="mt-3 h-12 w-full rounded-md bg-stone-100 p-2">
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
                        </Card>

                        <Card className="group relative flex flex-col justify-between rounded-xl border border-stone-100 bg-white/60 p-3 shadow-sm transition-colors hover:bg-white xl:col-span-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-stone-800">
                                    Caracteristicas del Suelo
                                </h3>
                                <Droplets className="size-5 text-blue-600 transition-colors group-hover:text-blue-700" />
                            </div>
                            <div className="mt-3 flex flex-col gap-1.5">
                                <p className="text-xs text-stone-500">
                                    pH:{" "}
                                    <span className="font-bold text-stone-700">
                                        {lote.ph ?? "—"}
                                    </span>
                                </p>
                                <p className="text-xs text-stone-500">
                                    Profundidad de napa:{" "}
                                    <span className="font-bold text-stone-700">
                                        {lote.napa != null ? `${lote.napa} m` : "—"}
                                    </span>
                                </p>
                                {lote.caracteristicas && (
                                    <p className="break-words text-xs leading-relaxed text-stone-500">
                                        Caracteristicas:{" "}
                                        <span className="font-bold text-stone-700 [overflow-wrap:anywhere]">
                                            {lote.caracteristicas}
                                        </span>
                                    </p>
                                )}
                                {rendimientoEstimado && (
                                    <div className="mt-1 grid grid-cols-2 gap-1.5 text-[11px] text-stone-500">
                                        <span>
                                            pH x{rendimientoEstimado.factor_ph}
                                        </span>
                                        <span>
                                            Napa x{rendimientoEstimado.factor_napa}
                                        </span>
                                        <span>
                                            Suelo x{rendimientoEstimado.factor_caracteristicas}
                                        </span>
                                        <span>
                                            Estado x{rendimientoEstimado.factor_estado}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {lote && (
                <ModalFormularioLote
                    show={showEditarModal}
                    onClose={() => setShowEditarModal(false)}
                    campoId={lote.campo_id.toString()}
                    onSubmit={handleEditarLote}
                    initialData={loteToForm(lote)}
                />
            )}
        </Body>
    );
}
