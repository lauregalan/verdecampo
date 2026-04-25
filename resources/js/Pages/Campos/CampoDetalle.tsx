import Body from "@/components/ui/Tabs/Body";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    Activity,
    ArrowLeft,
    CalendarDays,
    ChartColumnBig,
    Droplets,
    Fingerprint,
    Icon,
    Layers,
    ListTree,
    NotebookPen,
    Sun,
    Timer,
} from "lucide-react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EstimacionCard } from "./EstimacionCard";
import { LocalWeatherCard } from "./LocalWeatherCard";
import api from "@/lib/api";

interface CampoDetallePageProps {
    campoId: number | string;
}

interface BackendCampo {
    id: number;
    nombre: string;
    latitud: string;
    longitud: string;
    hectareas: number;
}

const acciones = [
    { title: "Ver lotes", icon: ListTree },
    { title: "Crear lotes", icon: ListTree },
    { title: "Ver campanas asociadas", icon: CalendarDays },
    { title: "Ver rendimiento", icon: ChartColumnBig },
    { title: "Consultar eventos o tareas", icon: NotebookPen },
];

export default function CampoDetalle() {
    const { campoId } = usePage().props as unknown as CampoDetallePageProps;
    const [campo, setCampo] = useState<BackendCampo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadCampo = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/campos/${campoId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setCampo(null);
                        setError("Campo no encontrado.");
                        return;
                    }

                    throw new Error("No se pudo obtener el detalle del campo.");
                }

                const payload = (await response.json()) as BackendCampo;
                setCampo(payload);
                setError(null);
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
    const DashboardCard = ({
        children,
        className = "",
    }: {
        children: React.ReactNode;
        className?: string;
    }) => (
        <div
            className={`rounded-3xl border border-stone-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
        >
            {children}
        </div>
    );

    return (
        <Body>
            <Head title={`Detalle - ${campo.nombre}`} />

            <div className="flex h-full w-full flex-col overflow-hidden p-4 font-sans md:p-6">
                <div className="flex mx-auto mb-4 w-full max-w-8xl shrink-0 justify-start">
                    <div className="flex flex-col gap-6 ">
                        <Button
                            variant="outline"
                            asChild
                            className="gap-2 border-stone-300 bg-[#fdf8f0] text-stone-700 hover:bg-stone-200 hover:text-stone-900 max-w-[160px]"
                        >
                            <Link href="/campo">
                                <ArrowLeft size={16} />
                                Volver a Lotes
                            </Link>
                        </Button>

                        <div className="flex flex-row gap-6">
                            <Badge className="w-fit bg-green-700 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white hover:bg-green-800">
                                En Producción
                            </Badge>
                            <div className="flex flex-col">
                                <div className="flex flex-row gap-2">
                                    <Button
                                        asChild
                                        variant="default"
                                        className=""
                                    >
                                        <Link href={`/campo/${campo.id}/lotes`}>
                                            <Layers size={16} />
                                            Ver Lotes
                                        </Link>
                                    </Button>
                                    <Button>Ver mapas</Button>
                                    <Button>Ver informes</Button>
                                    <Button>Ver cultivos</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Card className="lg:col-span-3 h-full w-full mx-auto  max-w-6xl  min-h-[400px] md:min-h-[500px] lg:min-h-[60vh] flex-col overflow-hidden rounded-xl border-stone-300 bg-[#FCFBF8] shadow-sm">
                        <div className="relative h-[100%] w-full shrink-0 border-b border-stone-200 ">
                            <MapContainer
                                center={centroCampo}
                                zoom={10}
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

                    <div className="lg:col-span-2 grid grid-cols-2 gap-4 w-full">
                        <Card className="col-span-2 flex min-h-[220px] max-h-[230px] flex-col justify-between border-stone-200 bg-[#FCFBF8] p-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900">
                                        {campo.nombre}
                                    </h2>
                                    <p className="text-sm font-medium text-stone-500">
                                        Superficie:{" "}
                                        <span className="font-bold text-stone-800">
                                            {campo.hectareas.toLocaleString(
                                                "es-AR",
                                            )}{" "}
                                            Ha
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                                >
                                    Cambiar nombre
                                </Button>
                            </div>

                            <div className="mt-6 flex flex-col gap-2">
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

                        <Card className="flex flex-col justify-start border-stone-100 bg-white/60 p-0 shadow-sm transition-colors hover:bg-white">
                            <CardHeader className="border-b border-stone-100 p-6 pb-4">
                                <h2 className="text-xl font-bold uppercase tracking-tight text-stone-700">
                                    Cultivo actual
                                </h2>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 p-6 pt-4">
                                <span className="text-2xl font-black uppercase text-stone-800">
                                    Soja
                                </span>
                                <div className="flex items-center gap-2">
                                    <Fingerprint className="size-4 text-stone-500" />
                                    <span className="text-sm text-stone-700">
                                        Variedad:{" "}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="size-4 text-stone-500" />
                                    <span className="text-sm text-stone-700">
                                        Estado:{" "}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer className="size-4 text-stone-500" />
                                    <span className="text-sm text-stone-700">
                                        Dias a cosecha:{" "}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="group relative flex flex-col justify-between rounded-xl border border-stone-100 bg-white/60 p-4 shadow-sm transition-colors hover:bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-stone-800">
                                    Rendimiento Estimado
                                </h3>
                                <ChartColumnBig className="size-6 text-yellow-600 transition-colors group-hover:text-yellow-700" />
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-stone-500">
                                    Proyección de Cosecha:
                                </p>
                                <span className="text-xl font-bold text-emerald-700">
                                    1200 kg/Ha
                                </span>
                            </div>
                            <div className="mt-4 h-20 w-full rounded-md bg-stone-100 p-2">
                                <svg
                                    viewBox="0 0 100 50"
                                    className="h-full w-full"
                                >
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
                                className="mt-4 w-full justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                            >
                                Ver informes detallados
                            </Button>
                        </Card>
                        <Card className="group relative flex flex-col justify-between rounded-xl border border-stone-100 bg-white/60 p-4 shadow-sm transition-colors hover:bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-stone-800">
                                    Historial de Suelo
                                </h3>
                                <Droplets className="size-6 text-blue-600 transition-colors group-hover:text-blue-700" />
                            </div>
                            <div className="mt-4 flex flex-col gap-2">
                                <p className="text-sm text-stone-500">
                                    pH:{" "}
                                    <span className="font-bold text-stone-700">
                                        6.5
                                    </span>
                                </p>
                                <p className="text-sm text-stone-500">
                                    Nutrientes:{" "}
                                    <span className="font-bold text-stone-700">
                                        Balanceado
                                    </span>
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-4 w-full justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                            >
                                Ver detalle del suelo
                            </Button>
                        </Card>

                        <LocalWeatherCard />
                    </div>
                </div>
            </div>
        </Body>
    );
}
