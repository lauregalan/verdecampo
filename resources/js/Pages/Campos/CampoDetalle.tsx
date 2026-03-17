import Body from "@/components/ui/Tabs/Body";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, CalendarDays, ChartColumnBig, ListTree, NotebookPen } from "lucide-react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
                const response = await fetch(`/api/campos/${campoId}`, {
                    headers: {
                        Accept: "application/json",
                    },
                    signal: controller.signal,
                });

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
                <div className="min-h-full bg-[#f9f4ea] p-8 font-sans">
                    <div className="mx-auto max-w-7xl rounded-3xl border border-stone-300 bg-[#fdf8f0] p-8">
                        <p className="text-xl font-semibold text-gray-800">Cargando detalle del campo...</p>
                    </div>
                </div>
            </Body>
        );
    }

    if (!campo) {
        return (
            <Body>
                <Head title="Campo no encontrado" />
                <div className="min-h-full bg-[#f9f4ea] p-8 font-sans">
                    <div className="mx-auto max-w-7xl rounded-3xl border border-stone-300 bg-[#fdf8f0] p-8">
                        <p className="text-xl font-semibold text-gray-800">{error ?? "Ubicacion no disponible"}</p>
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

    const centroCampo: LatLngExpression = hasValidCoords ? [latitude, longitude] : [-34.6037, -58.3816];

    return (
        <Body>
            <Head title={`Detalle - ${campo.nombre}`} />

            <div className="flex h-full w-full flex-col overflow-hidden bg-[#f9f4ea] p-4 font-sans md:p-6">
                
                <div className="mx-auto mb-4 w-full max-w-6xl shrink-0">
                    <Button 
                        variant="outline" 
                        asChild
                        className="gap-2 border-stone-300 bg-[#fdf8f0] text-stone-700 hover:bg-stone-200 hover:text-stone-900"
                    >
                        <Link href="/campo">
                            <ArrowLeft size={16} />
                            Volver a Lotes
                        </Link>
                    </Button>
                </div>

                <Card className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col overflow-hidden rounded-sm border-stone-300 bg-[#FCFBF8] shadow-sm">
                    
                    <div className="relative h-48 w-full shrink-0 border-b border-stone-200 md:h-[35%]">
                        <MapContainer
                            center={centroCampo}
                            zoom={14}
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
                                    pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.8 }}
                                />
                            )}
                        </MapContainer>
                        <div className="pointer-events-none absolute inset-0 z-[20] bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>

                    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
                        <CardHeader className="shrink-0 pb-2 pt-4 md:px-6">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold uppercase tracking-wide text-stone-800 md:text-2xl">
                                        {campo.nombre}
                                    </CardTitle>
                                    <p className="mt-1 text-sm font-medium text-stone-600">
                                        Superficie: <span className="font-semibold text-stone-800">{campo.hectareas} Ha</span>
                                    </p>
                                </div>
                                <Badge className="w-fit bg-green-700 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white hover:bg-green-800">
                                    En Producción
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="flex flex-1 flex-col overflow-y-auto pb-4 pt-2 md:px-6">
                            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-md border border-stone-200 bg-stone-100 px-3 py-1.5">
                                <span className="text-sm font-semibold text-stone-800">Último cultivo:</span>
                                <span className="text-sm font-normal text-stone-600">Sin dato</span>
                            </div>

                            <div className="mt-auto">
                                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-stone-500">
                                    Acciones Rápidas
                                </h3>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                                    {acciones.map((accion) => {
                                        const Icon = accion.icon;
                                        return (
                                            <Button
                                                key={accion.title}
                                                variant="outline"
                                                className="flex h-16 flex-col items-center justify-center gap-1.5 whitespace-normal border-stone-200 bg-white/60 p-2 text-stone-700 transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:bg-stone-50 hover:shadow-sm md:h-20"
                                            >
                                                <Icon size={18} className="text-stone-500" />
                                                <span className="text-center text-[11px] font-medium leading-tight md:text-xs">{accion.title}</span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </Body>    
    );
}
