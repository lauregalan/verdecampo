import Body from "@/components/ui/Tabs/Body";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, CalendarDays, ChartColumnBig, ListTree, NotebookPen } from "lucide-react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

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

            <div className="min-h-full bg-[#f9f4ea] p-8 font-sans">
                <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between">
                    <Link
                        href="/campo"
                        className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-[#fdf8f0] px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-stone-100"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </Link>
                </div>

                <section className="mx-auto max-w-7xl rounded-3xl border-2 border-stone-300 bg-[#fdf8f0] p-6 md:p-8">
                    <div className="relative mb-8 h-56 overflow-hidden rounded-3xl border-2 border-stone-300 bg-stone-900 md:h-64">
                        <MapContainer
                            center={centroCampo}
                            zoom={14}
                            scrollWheelZoom={true}
                            className="z-0 h-full w-full"
                        >
                            <TileLayer
                                attribution='Tiles &copy; Esri'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                            {hasValidCoords && (
                                <CircleMarker
                                    center={[latitude, longitude]}
                                    radius={8}
                                    pathOptions={{ color: "#1d4ed8", fillColor: "#1d4ed8", fillOpacity: 0.8 }}
                                />
                            )}
                        </MapContainer>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
                    </div>

                    <div className="mb-10 space-y-2 text-gray-800">
                        <h1 className="text-3xl font-bold">{campo.nombre}</h1>
                        <p className="text-lg font-medium">Superficie: {campo.hectareas} Ha</p>
                        <p className="text-lg">
                            Estado:{" "}
                            <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white">
                                En Produccion
                            </span>
                        </p>
                        <p className="text-lg">Ultimo cultivo: Sin dato</p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {acciones.map((accion) => {
                            const Icon = accion.icon;
                            return (
                                <button
                                    key={accion.title}
                                    type="button"
                                    className="flex min-h-24 items-center justify-center gap-3 rounded-3xl border-2 border-stone-300 bg-[#fdf8f0] px-6 py-6 text-lg font-semibold text-gray-800 transition-colors hover:bg-stone-100"
                                >
                                    <Icon size={20} />
                                    {accion.title}
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>
        </Body>
    );
}
