import { Head } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import ModalConfirmacion from "@/components/Modals/ModalConfirmacion";
import ModalFormularioCosecha from "@/components/Modals/ModalFormularioCosecha";
import {
    DataTable,
    type ColumnDef,
    type PaginationMeta,
} from "@/components/ui/DataTable";

interface Cosecha {
    id: number;
    campania_id: number;
    lote_id: number;
    fecha: string | null;
    rinde: number;
    humedad: number;
    observaciones: string | null;
    campania?: { id: number; nombre: string };
    lote?: { id: number; nombre: string };
}

const PER_PAGE = 10;

const formatDate = (value: string | null) => {
    if (!value) return <span className="italic text-gray-400">Sin fecha</span>;
    return new Date(value).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function Cosechas() {
    const [cosechas, setCosechas] = useState<Cosecha[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFormulario, setShowFormulario] = useState(false);
    const [cosechaEditando, setCosechaEditando] = useState<Cosecha | null>(null);
    const [cosechaAEliminar, setCosechaAEliminar] = useState<Cosecha | null>(null);

    const getCosechas = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/cosechas");
            const data = await response.json();
            setCosechas(data);
        } catch {
            setError("Error al cargar las cosechas");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getCosechas();
    }, [getCosechas]);

    useEffect(() => {
        setCurrentPage(1);
    }, [busqueda]);

    const cosechasFiltradas = useMemo(() => {
        if (!busqueda) return cosechas;
        const q = busqueda.toLowerCase();
        return cosechas.filter(
            (c) =>
                c.campania?.nombre?.toLowerCase().includes(q) ||
                c.lote?.nombre?.toLowerCase().includes(q),
        );
    }, [cosechas, busqueda]);

    const pagination: PaginationMeta = {
        currentPage,
        lastPage: Math.max(1, Math.ceil(cosechasFiltradas.length / PER_PAGE)),
        total: cosechasFiltradas.length,
        perPage: PER_PAGE,
        from: cosechasFiltradas.length === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1,
        to: Math.min(currentPage * PER_PAGE, cosechasFiltradas.length),
    };

    const paginatedData = cosechasFiltradas.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE,
    );

    const handleAbrirFormulario = (cosecha?: Cosecha) => {
        setCosechaEditando(cosecha ?? null);
        setShowFormulario(true);
    };

    const handleCosechaSaved = (cosecha: Cosecha) => {
        if (cosechaEditando) {
            setCosechas((prev) => prev.map((c) => (c.id === cosecha.id ? cosecha : c)));
        } else {
            setCosechas((prev) => [...prev, cosecha]);
        }
        setError(null);
        setShowFormulario(false);
        setCosechaEditando(null);
    };

    const handleEliminar = async () => {
        if (!cosechaAEliminar) return;
        try {
            const response = await api.delete(`/api/cosechas/${cosechaAEliminar.id}`);
            if (!response.ok) throw new Error();
            setCosechas((prev) => prev.filter((c) => c.id !== cosechaAEliminar.id));
            setCosechaAEliminar(null);
        } catch {
            setError("Error al eliminar la cosecha");
        }
    };

    const columns: ColumnDef<Cosecha>[] = [
        {
            id: "campania",
            header: "Campaña",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm font-medium text-gray-900",
            cell: (c) => c.campania?.nombre ?? `#${c.campania_id}`,
        },
        {
            id: "lote",
            header: "Lote",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (c) => c.lote?.nombre ?? `#${c.lote_id}`,
        },
        {
            id: "fecha",
            header: "Fecha cosecha",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (c) => formatDate(c.fecha),
        },
        {
            id: "rinde",
            header: "Rinde (kg/ha)",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-900 font-semibold tabular-nums",
            cell: (c) =>
                Number(c.rinde).toLocaleString("es-AR", { maximumFractionDigits: 2 }),
        },
        {
            id: "humedad",
            header: "Humedad (%)",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700 tabular-nums",
            cell: (c) =>
                `${Number(c.humedad).toLocaleString("es-AR", { maximumFractionDigits: 2 })}%`,
        },
        {
            id: "observaciones",
            header: "Observaciones",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-600 max-w-[240px]",
            cell: (c) =>
                c.observaciones ? (
                    <span className="line-clamp-2">{c.observaciones}</span>
                ) : (
                    <span className="italic text-gray-400">—</span>
                ),
        },
        {
            id: "acciones",
            header: "Acciones",
            headerClassName: "px-6 py-4 text-right text-sm font-semibold text-gray-900",
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
                        onClick={() => setCosechaAEliminar(c)}
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
            <Head title="Cosechas" />
            <div className="min-h-full p-8 font-sans">
                {/* Encabezado */}
                <div className="mx-auto mb-8 flex w-full max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Cosechas
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Registro de rendimientos por campaña y lote
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleAbrirFormulario()}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Nueva Cosecha
                    </button>
                </div>

                {error && (
                    <div className="mx-auto mb-4 max-w-[1600px] rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Buscador */}
                <div className="mx-auto mb-4 max-w-[1600px]">
                    <div className="relative w-full max-w-sm">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por campaña o lote…"
                            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="mx-auto max-w-[1600px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <DataTable
                        columns={columns}
                        data={paginatedData}
                        keyExtractor={(c) => c.id}
                        loading={loading}
                        emptyMessage="No hay cosechas registradas"
                        pagination={pagination}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            <ModalFormularioCosecha
                show={showFormulario}
                onClose={() => {
                    setShowFormulario(false);
                    setCosechaEditando(null);
                }}
                cosechaEditando={cosechaEditando}
                onSaved={handleCosechaSaved}
            />

            <ModalConfirmacion
                show={!!cosechaAEliminar}
                titulo="Eliminar cosecha"
                mensaje={`¿Confirmás eliminar la cosecha del lote "${cosechaAEliminar?.lote?.nombre ?? ""}"? Esta acción no se puede deshacer.`}
                onConfirmar={handleEliminar}
                onCancelar={() => setCosechaAEliminar(null)}
            />
        </Body>
    );
}
