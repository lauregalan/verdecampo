import { Head } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { Plus, Edit2, Trash2 } from "lucide-react";
import ModalConfirmacion from "@/components/Modals/ModalConfirmacion";
import ModalFormularioSiembra from "@/components/Modals/ModalFormularioSiembra";
import {
    DataTable,
    type ColumnDef,
    type PaginationMeta,
} from "@/components/ui/DataTable";

interface Siembra {
    id: number;
    campania_id: number;
    lote_id: number;
    cultivo_id: number;
    fecha: string;
    observaciones: string | null;
    campania?: { id: number; nombre: string };
    lote?: { id: number; nombre: string };
    cultivo?: { id: number; tipo: string; variedad: string };
    cultivo_antecesor?: { id: number; tipo: string; variedad: string } | null;
    created_at?: string;
    updated_at?: string;
}

const PER_PAGE = 10;

export default function Siembras() {
    const [siembras, setSiembras] = useState<Siembra[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFormulario, setShowFormulario] = useState(false);
    const [siembraEditando, setSiembraEditando] = useState<Siembra | null>(null);
    const [siembraAEliminar, setSiembraAEliminar] = useState<Siembra | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const getSiembras = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/siembras");
            const data = await response.json();
            setSiembras(data);
        } catch {
            setError("Error al cargar las siembras");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getSiembras();
    }, [getSiembras]);

    useEffect(() => {
        setCurrentPage(1);
    }, [busqueda]);

    const siembrasFiltradas = useMemo(() => {
        if (!busqueda) return siembras;
        const q = busqueda.toLowerCase();
        return siembras.filter(
            (s) =>
                s.campania?.nombre?.toLowerCase().includes(q) ||
                s.lote?.nombre?.toLowerCase().includes(q) ||
                s.cultivo?.tipo?.toLowerCase().includes(q) ||
                s.cultivo?.variedad?.toLowerCase().includes(q) ||
                s.observaciones?.toLowerCase().includes(q),
        );
    }, [siembras, busqueda]);

    const pagination: PaginationMeta = {
        currentPage,
        lastPage: Math.max(1, Math.ceil(siembrasFiltradas.length / PER_PAGE)),
        total: siembrasFiltradas.length,
        perPage: PER_PAGE,
        from:
            siembrasFiltradas.length === 0
                ? 0
                : (currentPage - 1) * PER_PAGE + 1,
        to: Math.min(currentPage * PER_PAGE, siembrasFiltradas.length),
    };

    const paginatedData = siembrasFiltradas.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE,
    );

    const handleAbrirFormulario = (siembra?: Siembra) => {
        setSiembraEditando(siembra ?? null);
        setShowFormulario(true);
    };

    const handleSiembraSaved = (siembra: Siembra) => {
        if (siembraEditando) {
            setSiembras((prev) =>
                prev.map((s) => (s.id === siembra.id ? siembra : s)),
            );
        } else {
            setSiembras((prev) => [...prev, siembra]);
        }
        setError(null);
        setShowFormulario(false);
        setSiembraEditando(null);
    };

    const handleEliminarSiembra = async () => {
        if (!siembraAEliminar) return;
        try {
            const response = await api.delete(`/api/siembras/${siembraAEliminar.id}`);
            if (!response.ok) throw new Error();
            setSiembras((prev) => prev.filter((s) => s.id !== siembraAEliminar.id));
            setSiembraAEliminar(null);
        } catch {
            setError("Error al eliminar la siembra");
        }
    };

    const formatFecha = (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

    const columns: ColumnDef<Siembra>[] = [
        {
            id: "campania",
            header: "Campaña",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm font-medium text-gray-900",
            cell: (s) => s.campania?.nombre ?? "-",
        },
        {
            id: "lote",
            header: "Lote",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (s) => s.lote?.nombre ?? "-",
        },
        {
            id: "fecha",
            header: "Fecha",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (s) => formatFecha(s.fecha),
        },
        {
            id: "cultivo",
            header: "Cultivo",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (s) =>
                s.cultivo
                    ? `${s.cultivo.tipo} - ${s.cultivo.variedad}`
                    : "-",
        },
        {
            id: "cultivo_antecesor",
            header: "Cultivo Antecesor",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (s) =>
                s.cultivo_antecesor ? (
                    `${s.cultivo_antecesor.tipo} - ${s.cultivo_antecesor.variedad}`
                ) : (
                    <span className="italic text-gray-400">Sin antecesor</span>
                ),
        },
        {
            id: "observaciones",
            header: "Observaciones",
            headerClassName: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (s) =>
                s.observaciones ? (
                    <span className="line-clamp-2">{s.observaciones}</span>
                ) : (
                    <span className="italic text-gray-400">Sin observaciones</span>
                ),
        },
        {
            id: "acciones",
            header: "Acciones",
            headerClassName: "px-6 py-4 text-right text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-right",
            cell: (s) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => handleAbrirFormulario(s)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                        <Edit2 size={14} />
                        Editar
                    </button>
                    <button
                        onClick={() => setSiembraAEliminar(s)}
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
            <Head title="Gestión de Siembras" />
            <div className="min-h-full p-8 font-sans">
                <div className="mx-auto mb-8 flex w-full max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Gestión de Siembras
                    </h1>
                    <button
                        type="button"
                        onClick={() => handleAbrirFormulario()}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Nueva Siembra
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
                        placeholder="Buscar por campaña, lote, cultivo u observaciones..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={paginatedData}
                    keyExtractor={(s) => s.id}
                    loading={loading}
                    emptyMessage={
                        busqueda
                            ? "No se encontraron siembras."
                            : "No hay siembras registradas."
                    }
                    pagination={pagination}
                    onPageChange={setCurrentPage}
                    className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                />

                <ModalFormularioSiembra
                    show={showFormulario}
                    onClose={() => {
                        setShowFormulario(false);
                        setSiembraEditando(null);
                    }}
                    siembraEditando={siembraEditando}
                    onSaved={handleSiembraSaved}
                />

                <ModalConfirmacion
                    show={siembraAEliminar !== null}
                    onCancelar={() => setSiembraAEliminar(null)}
                    onConfirmar={handleEliminarSiembra}
                    titulo="Eliminar Siembra"
                    mensaje={`¿Estás seguro de que deseas eliminar la siembra del lote "${siembraAEliminar?.lote?.nombre}" en la campaña "${siembraAEliminar?.campania?.nombre}"?`}
                />
            </div>
        </Body>
    );
}