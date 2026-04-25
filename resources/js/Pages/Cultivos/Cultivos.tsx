import { Head } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { Plus, Edit2, Trash2 } from "lucide-react";
import ModalConfirmacion from "@/components/Modals/ModalConfirmacion";
import ModalFormularioCultivo from "@/components/Modals/ModalFormularioCultivo";
import {
    DataTable,
    type ColumnDef,
    type PaginationMeta,
} from "@/components/ui/DataTable";

interface Cultivo {
    id: number;
    tipo: string;
    variedad: string;
    cultivo_antecesor_id: number | null;
    notas: string | null;
    created_at?: string;
    updated_at?: string;
}

const PER_PAGE = 2;

export default function Cultivos() {
    const [cultivos, setcultivos] = useState<Cultivo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFormulario, setShowFormulario] = useState(false);
    const [cultivoEditando, setcultivoEditando] = useState<Cultivo | null>(
        null,
    );
    const [cultivoAEliminar, setcultivoAEliminar] = useState<Cultivo | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const getcultivos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/cultivos");
            const data = await response.json();
            setcultivos(data);
        } catch {
            setError("Error al cargar los cultivos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getcultivos();
    }, [getcultivos]);

    // Reset to page 1 on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [busqueda]);

    const cultivosFiltrados = useMemo(() => {
        if (!busqueda) return cultivos;
        const q = busqueda.toLowerCase();
        return cultivos.filter(
            (c) =>
                c.tipo.toLowerCase().includes(q) ||
                c.variedad.toLowerCase().includes(q),
        );
    }, [cultivos, busqueda]);

    const pagination: PaginationMeta = {
        currentPage,
        lastPage: Math.max(1, Math.ceil(cultivosFiltrados.length / PER_PAGE)),
        total: cultivosFiltrados.length,
        perPage: PER_PAGE,
        from:
            cultivosFiltrados.length === 0
                ? 0
                : (currentPage - 1) * PER_PAGE + 1,
        to: Math.min(currentPage * PER_PAGE, cultivosFiltrados.length),
    };

    const paginatedData = cultivosFiltrados.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE,
    );

    const handleAbrirFormulario = (cultivo?: Cultivo) => {
        setcultivoEditando(cultivo ?? null);
        setShowFormulario(true);
    };

    const handleCultivoSaved = (cultivo: Cultivo) => {
        if (cultivoEditando) {
            setcultivos((prev) =>
                prev.map((c) => (c.id === cultivo.id ? cultivo : c)),
            );
        } else {
            setcultivos((prev) => [...prev, cultivo]);
        }
        setError(null);
        setShowFormulario(false);
        setcultivoEditando(null);
    };

    const handleEliminarCultivo = async () => {
        if (!cultivoAEliminar) return;
        try {
            const response = await api.delete(
                `/api/cultivos/${cultivoAEliminar.id}`,
            );
            if (!response.ok) throw new Error();
            setcultivos((prev) =>
                prev.filter((c) => c.id !== cultivoAEliminar.id),
            );
            setcultivoAEliminar(null);
        } catch {
            setError("Error al eliminar el cultivo");
        }
    };

    const columns: ColumnDef<Cultivo>[] = [
        {
            id: "tipo",
            header: "Tipo",
            headerClassName:
                "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm font-medium text-gray-900",
            cell: (c) => c.tipo,
        },
        {
            id: "variedad",
            header: "Variedad",
            headerClassName:
                "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (c) => c.variedad,
        },
        {
            id: "notas",
            header: "Notas",
            headerClassName:
                "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (c) =>
                c.notas ? (
                    <span className="line-clamp-2">{c.notas}</span>
                ) : (
                    <span className="italic text-gray-400">Sin notas</span>
                ),
        },
        {
            id: "acciones",
            header: "Acciones",
            headerClassName:
                "px-6 py-4 text-right text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-right",
            cell: (c) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => handleAbrirFormulario(c)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                        <Edit2 size={14} />
                        Editar
                    </button>
                    <button
                        onClick={() => setcultivoAEliminar(c)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                    >
                        <Trash2 size={14} />
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    return (
        <Body>
            <Head title="Gestión de Cultivos" />
            <div className="min-h-full p-8 font-sans">
                <div className="mx-auto mb-8 flex w-full max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Gestión de Cultivos
                    </h1>
                    <button
                        type="button"
                        onClick={() => handleAbrirFormulario()}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Nuevo Cultivo
                    </button>
                </div>

                {error && (
                    <div className="mx-auto mb-4 max-w-7xl rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <div className="mx-auto mb-6 max-w-7xl">
                    <input
                        type="text"
                        placeholder="Buscar por tipo o variedad..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={paginatedData}
                    keyExtractor={(c) => c.id}
                    loading={loading}
                    emptyMessage={
                        busqueda
                            ? "No se encontraron cultivos."
                            : "No hay cultivos registrados."
                    }
                    pagination={pagination}
                    onPageChange={setCurrentPage}
                    className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                />

                <ModalFormularioCultivo
                    show={showFormulario}
                    onClose={() => {
                        setShowFormulario(false);
                        setcultivoEditando(null);
                    }}
                    cultivoEditando={cultivoEditando}
                    onSaved={handleCultivoSaved}
                />

                <ModalConfirmacion
                    show={cultivoAEliminar !== null}
                    onCancelar={() => setcultivoAEliminar(null)}
                    onConfirmar={handleEliminarCultivo}
                    titulo="Eliminar Cultivo"
                    mensaje={`¿Estás seguro de que deseas eliminar el cultivo "${cultivoAEliminar?.tipo} - ${cultivoAEliminar?.variedad}"?`}
                />
            </div>
        </Body>
    );
}
