import Modal from "@/components/Modals/Modal";
import { X } from "lucide-react";

type CampaignStatus = "Planificada" | "En Curso" | "Finalizada" | "Cancelada";

interface BackendCampania {
    id: number;
    campo_id: number | null;
    cultivo_id: number | null;
    nombre: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    estado: CampaignStatus;
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
    fieldById: Record<number, string>;
    cultivoById: Record<number, string>;
    onEdit: () => void;
}

export default function ModalDetalleCampania({
    show,
    onClose,
    campania,
    fieldById,
    cultivoById,
    onEdit,
}: ModalDetalleCampaniaProps) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900">Detalle de campania</h2>
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
                                ? (fieldById[campania.campo_id] ?? "Campo desconocido")
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Cultivo:</strong>{" "}
                            {campania.cultivo_id !== null
                                ? (cultivoById[campania.cultivo_id] ?? "Cultivo desconocido")
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Fecha inicio:</strong> {formatDate(campania.fecha_inicio)}
                        </p>
                        <p>
                            <strong>Fecha fin:</strong> {formatDate(campania.fecha_fin)}
                        </p>
                        <p>
                            <strong>Estado:</strong> {campania.estado}
                        </p>
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
