import Modal from "@/components/Modals/Modal";
import { Layers, X } from "lucide-react";

type CampaignStatus = "Planificada" | "En Curso" | "Finalizada" | "Cancelada";

interface BackendCampania {
    id: number;
    campo_id: number | null;
    cultivo_id: number | null;
    nombre: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    estado: CampaignStatus;
    lotes?: BackendLote[];
}

interface BackendLote {
    id: number;
    nombre: string;
    caracteristicas?: string;
    estado?: string;
    hectareas?: number;
    deleted_at?: string | null;
}

const formatDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "Sin fecha";

interface ModalDetalleCampaniaProps {
    show: boolean;
    onClose: () => void;
    campania: BackendCampania | null;
    isLoading?: boolean;
    fieldById: Record<number, string>;
    cultivoById: Record<number, string>;
    onEdit: () => void;
}

export default function ModalDetalleCampania({
    show,
    onClose,
    campania,
    isLoading = false,
    fieldById,
    cultivoById,
    onEdit,
}: ModalDetalleCampaniaProps) {
    const lotes = campania?.lotes ?? [];

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Detalle de campaña
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>
                {campania ? (
                    <div className="space-y-3">
                        <p>
                            <strong>Nombre:</strong> {campania.nombre}
                        </p>
                        <p>
                            <strong>Campo:</strong>{" "}
                            {campania.campo_id !== null
                                ? (fieldById[campania.campo_id] ??
                                  "Campo desconocido")
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Cultivo:</strong>{" "}
                            {campania.cultivo_id !== null
                                ? (cultivoById[campania.cultivo_id] ??
                                  "Cultivo desconocido")
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Fecha inicio:</strong>{" "}
                            {formatDate(campania.fecha_inicio)}
                        </p>
                        <p>
                            <strong>Fecha fin:</strong>{" "}
                            {formatDate(campania.fecha_fin)}
                        </p>
                        <p>
                            <strong>Estado:</strong> {campania.estado}
                        </p>
                        <section className="pt-2">
                            <div className="mb-3 flex items-center gap-2 border-t border-stone-200 pt-4">
                                <Layers
                                    size={18}
                                    className="text-emerald-700"
                                    aria-hidden="true"
                                />
                                <h3 className="text-base font-semibold text-gray-900">
                                    Lotes asociados
                                </h3>
                                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                                    {lotes.length}
                                </span>
                            </div>

                            {isLoading ? (
                                <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500">
                                    Cargando lotes asociados...
                                </div>
                            ) : lotes.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {lotes.map((lote) => (
                                        <article
                                            key={lote.id}
                                            className="rounded-lg border border-stone-200 bg-stone-50 p-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-semibold text-stone-900">
                                                        {lote.nombre}
                                                    </h4>
                                                    <p className="mt-1 text-xs text-stone-500">
                                                        {lote.estado ??
                                                            "Sin estado"}
                                                    </p>
                                                </div>
                                                {lote.deleted_at && (
                                                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                                        Eliminado
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-3 text-xs text-stone-600">
                                                <span className="font-semibold">
                                                    Superficie:
                                                </span>{" "}
                                                {lote.hectareas != null
                                                    ? `${lote.hectareas} ha`
                                                    : "Sin dato"}
                                            </div>
                                            {lote.caracteristicas && (
                                                <p className="mt-2 line-clamp-2 text-xs text-stone-500">
                                                    {lote.caracteristicas}
                                                </p>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500">
                                    Sin lotes asociados.
                                </div>
                            )}
                        </section>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onEdit}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                ) : (
                    <p>Cargando datos de la campania...</p>
                )}
            </div>
        </Modal>
    );
}
