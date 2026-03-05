import Main from "@/Pages/Frames/Main";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, CalendarDays, ChartColumnBig, ListTree, NotebookPen } from "lucide-react";
import { CircleMarker, MapContainer, Polygon, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { camposIniciales, statusStyles } from "./mockCampos";

interface CampoDetallePageProps {
    campoId: number | string;
}

const acciones = [
    { title: "Ver lotes", icon: ListTree },
    { title: "Ver campanas asociadas", icon: CalendarDays },
    { title: "Ver rendimiento", icon: ChartColumnBig },
    { title: "Consultar eventos o tareas", icon: NotebookPen },
];

export default function CampoDetalle() {
    const { campoId } = usePage().props as unknown as CampoDetallePageProps;
    const campo = camposIniciales.find((item) => item.id === Number(campoId));

    if (!campo) {
        return (
            <Main>
                <Head title="Campo no encontrado" />
                <div className="min-h-full bg-[#f9f4ea] p-8 font-sans">
                    <div className="mx-auto max-w-7xl rounded-3xl border border-stone-300 bg-[#fdf8f0] p-8">
                        <p className="text-xl font-semibold text-gray-800">Ubicacion no disponible</p>
                        <Link
                            href="/campo"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <ArrowLeft size={16} />
                            Volver a campos
                        </Link>
                    </div>
                </div>
            </Main>
        );
    }

    const centroCampo: LatLngExpression = [campo.latitude, campo.longitude];
    const poligonoCampo = campo.polygon as LatLngExpression[];

    return (
        <Main>
            <Head title={`Detalle - ${campo.name}`} />

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

                        </MapContainer>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
                    </div>

                    <div className="mb-10 space-y-2 text-gray-800">
                        <h1 className="text-3xl font-bold">{campo.name}</h1>
                        <p className="text-lg font-medium">Superficie: {campo.surface}</p>
                        <p className="text-lg">
                            Estado:{" "}
                            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[campo.statusColor]}`}>
                                {campo.status}
                            </span>
                        </p>
                        <p className="text-lg">Ultimo cultivo: {campo.lastCrop}</p>
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
        </Main>
    );
}
