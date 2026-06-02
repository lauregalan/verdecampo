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
import { LocalWeatherCard } from "./LocalWeatherCard";
import api from "@/lib/api";
import {
    estimarRendimientoCampo,
    getCultivoProfile,
    getSiembraActiva,
} from "@/lib/rendimiento";

interface CampoDetallePageProps {
    campoId: number | string;
}

interface BackendCampo {
    id: number;
    nombre: string;
    latitud: string;
    longitud: string;
    hectareas: number;
    clima?: {
        temperatura_max: number[];
        temperatura_min: number[];
        precipitacion: number[];
        codigo_clima: number[];
        fechas: string[];
    };
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
    cosechas?: any[];
}

interface CultivoActual {
    tipo: string;
    variedad: string;
    fecha_siembra: string;
    dias_transcurridos: number;
    dias_a_cosecha: number;
}

interface RendimientoCampo {
    kg_por_hectarea: number;
    kg_total: number;
    promedio_kg_ha: number;
    confianza: number;
    lotes_estimados: number;
}

const getEstadoCampo = (lotes: BackendLote[]) => {
    if (lotes.some((lote) => lote.estado === "produccion")) {
        return {
            label: "En Produccion",
            className: "bg-green-700 hover:bg-green-800",
        };
    }
    if (lotes.some((lote) => lote.estado === "preparacion")) {
        return {
            label: "En Preparacion",
            className: "bg-yellow-600 hover:bg-yellow-700",
        };
    }
    if (lotes.some((lote) => lote.estado === "barbecho")) {
        return {
            label: "Barbecho",
            className: "bg-red-600 hover:bg-red-700",
        };
    }

    return {
        label: "Disponible",
        className: "bg-emerald-500 hover:bg-emerald-600",
    };
};

const getCaracteristicaPredominante = (lotes: BackendLote[]) => {
    const caracteristicas = lotes
        .map((lote) => lote.caracteristicas?.toLowerCase() ?? "")
        .join(" ");

    if (caracteristicas.includes("fertil") || caracteristicas.includes("fÃ©rtil")) {
        return "Fertil";
    }
    if (caracteristicas.includes("arcilloso")) {
        return "Arcilloso";
    }
    if (caracteristicas.includes("arenoso")) {
        return "Arenoso";
    }

    return "Variado";
};

export default function CampoDetalle() {
    const { campoId } = usePage().props as unknown as CampoDetallePageProps;
    const [campo, setCampo] = useState<BackendCampo | null>(null);
    const [lotesCampo, setLotesCampo] = useState<BackendLote[]>([]);
    const [cultivoActual, setCultivoActual] = useState<CultivoActual | null>(null);
    const [rendimientoCampo, setRendimientoCampo] =
        useState<RendimientoCampo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const calcularCultivoActual = (lotes: BackendLote[]) => {
        const siembrasActivas = lotes
            .map((lote) => getSiembraActiva(lote.siembras ?? []))
            .filter((siembra): siembra is NonNullable<typeof siembra> => Boolean(siembra));

        if (siembrasActivas.length === 0) {
            setCultivoActual(null);
            return;
        }

        const siembraMasReciente = siembrasActivas.sort(
            (a, b) =>
                new Date(b.fecha_siembra).getTime() -
                new Date(a.fecha_siembra).getTime(),
        )[0];

        const fechaSiembra = new Date(siembraMasReciente.fecha_siembra);
        const diasTranscurridos = Math.floor(
            (new Date().getTime() - fechaSiembra.getTime()) /
                (1000 * 60 * 60 * 24),
        );
        const diasCiclo = getCultivoProfile(
            siembraMasReciente.cultivo?.tipo,
        ).cycleDays;

        setCultivoActual({
            tipo: siembraMasReciente.cultivo?.tipo || "Desconocido",
            variedad: siembraMasReciente.cultivo?.variedad || "Desconocida",
            fecha_siembra: siembraMasReciente.fecha_siembra,
            dias_transcurridos: diasTranscurridos,
            dias_a_cosecha: Math.max(0, diasCiclo - diasTranscurridos),
        });
    };

    const calcularRendimiento = (
        lotes: BackendLote[],
        clima?: BackendCampo["clima"],
    ) => {
        const estimacion = estimarRendimientoCampo(lotes, clima);
        setRendimientoCampo(estimacion);
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadCampo = async () => {
            try {
                setLoading(true);

                const [campoResponse, lotesResponse] = await Promise.all([
                    api.get(`/api/campos/${campoId}`),
                    api.get(`/api/lotes/campo/${campoId}`),
                ]);

                if (!campoResponse.ok) {
                    if (campoResponse.status === 404) {
                        setCampo(null);
                        setError("Campo no encontrado.");
                        return;
                    }
                    throw new Error("No se pudo obtener el detalle del campo.");
                }

                if (!lotesResponse.ok) {
                    throw new Error("No se pudieron obtener los lotes del campo.");
                }

                const campoPayload = (await campoResponse.json()) as BackendCampo;
                const lotesPayload = (await lotesResponse.json()) as BackendLote[];

                setCampo(campoPayload);
                setLotesCampo(lotesPayload);
                setError(null);

                calcularCultivoActual(lotesPayload);
                calcularRendimiento(lotesPayload, campoPayload.clima);
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                setCampo(null);
                setError("Error al cargar el detalle del campo.");
            } finally {
                setLoading(false);
            }
        };

        void loadCampo();

        return () => controller.abort();
    }, [campoId]);

    const estadoCampo = useMemo(() => getEstadoCampo(lotesCampo), [lotesCampo]);

    if (loading) {
        return (
            <Body>
                <Head title="Cargando campo" />
                <div className="min-h-full p-8 font-sans">
                    <div className="mx-auto max-w-7xl rounded-3xl border border-stone-300 bg-[#fdf8f0] p-8">
                        <p className="text-xl font-semibold text-gray-800">
                            Cargando detalle del campo...
                        </p>
                    </div>
                </div>
            </Body>
        );
    }

    if (!campo) {
        return (
            <Body>
                <Head title="Campo no encontrado" />
                <div className="min-h-full p-8 font-sans">
                    <div className="mx-auto max-w-7xl rounded-3xl border border-stone-300 bg-[#fdf8f0] p-8">
                        <p className="text-xl font-semibold text-gray-800">
                            {error ?? "Ubicacion no disponible"}
                        </p>
                        <Link
                            href="/campo"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <ArrowLeft size={16} />
                            Volver a campos
                        </Link>
                    </div>
                </div>
            </Body>
        );
    }

    const latitude = Number.parseFloat(campo.latitud);
    const longitude = Number.parseFloat(campo.longitud);
    const hasValidCoords =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        Math.abs(latitude) <= 90 &&
        Math.abs(longitude) <= 180;

    const centroCampo: LatLngExpression = hasValidCoords
        ? [latitude, longitude]
        : [-34.6037, -58.3816];

    return (
        <Body>
            <Head title={`Detalle - ${campo.nombre}`} />

            <div className="flex h-full min-h-0 w-full flex-col overflow-hidden font-sans">
                <div className="mb-3 flex w-full shrink-0 flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            asChild
                            className="h-9 max-w-[160px] gap-2 border-stone-300 bg-[#fdf8f0] text-stone-700 hover:bg-stone-200 hover:text-stone-900"
                        >
                            <Link href="/campo">
                                <ArrowLeft size={16} />
                                Volver a Campos
                            </Link>
                        </Button>

                        <Badge
                            className={`w-fit px-3 py-1 text-xs font-bold uppercase tracking-wider text-white ${estadoCampo.className}`}
                        >
                            {estadoCampo.label}
                        </Badge>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Button asChild variant="default" className="h-9">
                            <Link href={`/lotes?campoId=${campo.id}`}>
                                Ver Lotes
                            </Link>
                        </Button>
                        <Button asChild variant="default" className="h-9">
                            <Link href="/cultivos">Ver cultivos</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
                    <Card className="mx-auto h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-xl border-stone-300 bg-[#FCFBF8] shadow-sm lg:col-span-3">
                        <div className="relative h-full w-full shrink-0 border-b border-stone-200">
                            <MapContainer
                                center={centroCampo}
                                zoom={10}
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

                    <div className="grid h-full min-h-0 w-full grid-cols-2 grid-rows-[auto_1fr_1fr] gap-3 lg:col-span-2">
                        <Card className="col-span-2 flex min-h-0 flex-col justify-center border-stone-200 bg-[#FCFBF8] p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-stone-900">
                                        {campo.nombre}
                                    </h2>
                                    <p className="text-sm font-medium text-stone-500">
                                        Superficie:{" "}
                                        <span className="font-bold text-stone-800">
                                            {campo.hectareas.toLocaleString("es-AR")} Ha
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="flex min-h-0 flex-col overflow-hidden border-stone-100 bg-white/60 p-0 shadow-sm transition-colors hover:bg-white">
                            <CardHeader className="border-b border-stone-100 p-4 pb-3">
                                <h2 className="text-base font-bold uppercase tracking-tight text-stone-700">
                                    Cultivo actual
                                </h2>
                            </CardHeader>
                            <CardContent className="flex min-h-0 flex-col gap-2 p-4 pt-3">
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

                        <Card className="group relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-stone-100 bg-white/60 p-4 shadow-sm transition-colors hover:bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-stone-800">
                                    Rendimiento Estimado
                                </h3>
                                <ChartColumnBig className="size-5 text-yellow-600 transition-colors group-hover:text-yellow-700" />
                            </div>
                            <div className="mt-3 space-y-1.5">
                                <p className="text-xs text-stone-500">
                                    Proyeccion de cosecha total:
                                </p>
                                <span className="text-lg font-bold text-emerald-700">
                                    {rendimientoCampo
                                        ? `${rendimientoCampo.kg_total.toLocaleString()} kg`
                                        : "— kg"}
                                </span>
                                <p className="text-xs text-stone-500">
                                    Promedio:{" "}
                                    {rendimientoCampo
                                        ? `${rendimientoCampo.promedio_kg_ha.toLocaleString()} kg/Ha`
                                        : "—"}
                                </p>
                                <p className="text-xs text-stone-500">
                                    Confianza:{" "}
                                    <span className="font-semibold text-stone-700">
                                        {rendimientoCampo
                                            ? `${rendimientoCampo.confianza}%`
                                            : "—"}
                                    </span>
                                </p>
                                <p className="line-clamp-2 text-[11px] text-stone-400">
                                    Estimacion ponderada por hectareas y ajustada por
                                    clima, suelo y estado del cultivo.
                                </p>
                            </div>
                            <div className="mt-3 h-14 w-full rounded-md bg-stone-100 p-2">
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

                        <Card className="group relative flex min-h-0 flex-col justify-start overflow-hidden rounded-xl border border-stone-100 bg-white/60 p-4 shadow-sm transition-colors hover:bg-white">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                                <h3 className="text-base font-bold text-stone-800">
                                    Historial de Suelo
                                </h3>
                                <Droplets className="size-5 text-blue-600 transition-colors group-hover:text-blue-700" />
                            </div>
                            <div className="mt-3 flex flex-col gap-2">
                                {lotesCampo.length > 0 ? (
                                    <>
                                        <p className="text-xs text-stone-500">
                                            pH promedio:
                                            <span className="font-bold text-stone-700">
                                                {(
                                                    lotesCampo.reduce(
                                                        (sum, lote) =>
                                                            sum + (lote.ph || 0),
                                                        0,
                                                    ) / lotesCampo.length
                                                ).toFixed(1)}
                                            </span>
                                        </p>
                                        <p className="text-xs text-stone-500">
                                            Caracteristica predominante:
                                            <span className="font-bold text-stone-700">
                                                {getCaracteristicaPredominante(
                                                    lotesCampo,
                                                )}
                                            </span>
                                        </p>
                                        <p className="text-xs text-stone-500">
                                            Napa promedio:
                                            <span className="font-bold text-stone-700">
                                                {(
                                                    lotesCampo.reduce(
                                                        (sum, lote) =>
                                                            sum + (lote.napa || 0),
                                                        0,
                                                    ) / lotesCampo.length
                                                ).toFixed(1)}{" "}
                                                m
                                            </span>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs text-stone-500">
                                            pH:
                                            <span className="font-bold text-stone-700">
                                                Sin datos
                                            </span>
                                        </p>
                                        <p className="text-xs text-stone-500">
                                            Caracteristicas:
                                            <span className="font-bold text-stone-700">
                                                Sin informacion
                                            </span>
                                        </p>
                                    </>
                                )}
                            </div>
                        </Card>

                        <LocalWeatherCard clima={campo.clima} />
                    </div>
                </div>
            </div>
        </Body>
    );
}
