/*import { Head, router } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";

export default function Siembras() {
    return (
        <Body>
            <Head title="Gestion de Lotes" />
            <div className="min-h-full p-8 font-sans">
                <div className="mx-auto mb-8 flex w-full max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Gestión de Lotes
                    </h1>
                    <button
                        type="button"
                        onClick={handleAbrirCreacion}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Nuevo Lote
                    </button>
                </div>

                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-stone-200 bg-[#fdf8f0] p-6 shadow-sm space-y-4">
                        
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={nombreBuscado}
                            onChange={(e) => setNombreBuscado(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
            </div>
        </Body>
    );


}*/
import { Head, router } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
import { useState, useCallback, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { Plus, Edit2, Trash2, Sprout } from "lucide-react";
import ModalConfirmacion from "@/components/Modals/ModalConfirmacion";
import ModalFormularioSiembra from "@/components/Modals/ModalFormularioSiembra";
import {
    DataTable,
    type ColumnDef,
    type PaginationMeta,
} from "@/components/ui/DataTable";

interface SiembraDB {
    id: number;
    campania_id: number;
    lote_id: number;
    cultivo_id: number;
    fecha: string;
    observaciones: string | null;
}

interface SiembraRow {
    id: number;
    campania_id: number;
    lote_id: number;
    cultivo_id: number;
    fecha_siembra: string;
    observaciones: string | null;
    // Resolved display names
    campania_nombre: string;
    lote_nombre: string;
    cultivo_nombre: string;
    cultivo_antecesor_nombre: string | null;
}

const PER_PAGE = 10;

export default function Siembras() {
    const [siembras, setSiembras] = useState<SiembraRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFormulario, setShowFormulario] = useState(false);
    const [siembraEditando, setSiembraEditando] = useState<SiembraDB | null>(
        null,
    );
    const [siembraAEliminar, setSiembraAEliminar] =
        useState<SiembraRow | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const getSiembras = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/siembras");
            if (!response.ok) throw new Error();
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
                s.campania_nombre?.toLowerCase().includes(q) ||
                s.lote_nombre?.toLowerCase().includes(q) ||
                s.cultivo_nombre?.toLowerCase().includes(q),
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

    const handleSiembraSaved = (siembra: SiembraDB) => {
        // Reload to get resolved names from the API
        getSiembras();
        setError(null);
        setShowFormulario(false);
        setSiembraEditando(null);
    };

    const handleEliminarSiembra = async () => {
        if (!siembraAEliminar) return;
        try {
            const response = await api.delete(
                `/api/siembras/${siembraAEliminar.id}`,
            );
            if (!response.ok) throw new Error();
            setSiembras((prev) =>
                prev.filter((s) => s.id !== siembraAEliminar.id),
            );
            setSiembraAEliminar(null);
        } catch {
            setError("Error al eliminar la siembra");
        }
    };

    const formatFecha = (fecha: string) => {
        if (!fecha) return "—";
        const [year, month, day] = fecha.split("-");
        return `${day}/${month}/${year}`;
    };

    const columns: ColumnDef<SiembraRow>[] = [
        {
            id: "campania",
            header: "Campaña",
            headerClassName:
                "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm font-medium text-gray-900",
            cell: (s) => (
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {s.campania_nombre ?? `Campaña #${s.campania_id}`}
                </span>
            ),
        },
        {
            id: "lote",
            header: "Lote",
            headerClassName:
                "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (s) => s.lote_nombre ?? `Lote #${s.lote_id}`,
        },
        {
            id: "fecha",
            header: "Fecha",
            headerClassName:
                "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700 tabular-nums",
            cell: (s) => formatFecha(s.fecha_siembra),
        },
        {
            id: "cultivo",
            header: "Cultivo",
            headerClassName:
                "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (s) => (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800 ring-1 ring-green-200">
                    <Sprout size={11} />
                    {s.cultivo_nombre ?? `Cultivo #${s.cultivo_id}`}
                </span>
            ),
        },
        {
            id: "antecesor",
            header: "Cultivo antecesor",
            headerClassName:
                "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-700",
            cell: (s) =>
                s.cultivo_antecesor_nombre ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                        {s.cultivo_antecesor_nombre}
                    </span>
                ) : (
                    <span className="italic text-gray-400 text-xs">
                        Sin antecedente
                    </span>
                ),
        },
        {
            id: "observaciones",
            header: "Observaciones",
            headerClassName:
                "px-6 py-4 text-left text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-sm text-gray-600 max-w-xs",
            cell: (s) =>
                s.observaciones ? (
                    <span className="line-clamp-2">{s.observaciones}</span>
                ) : (
                    <span className="italic text-gray-400">—</span>
                ),
        },
        {
            id: "acciones",
            header: "Acciones",
            headerClassName:
                "px-6 py-4 text-right text-sm font-semibold text-gray-900",
            cellClassName: "px-6 py-4 text-right",
            cell: (s) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setSiembraEditando({
                                id: s.id,
                                campania_id: s.campania_id,
                                lote_id: s.lote_id,
                                cultivo_id: s.cultivo_id,
                                fecha: s.fecha_siembra,
                                observaciones: s.observaciones,
                            });
                            setShowFormulario(true);
                        }}
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
                {/* Header */}
                <div className="mx-auto mb-8 flex w-full max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Gestión de Siembras
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Registrá las siembras por campaña y lote
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSiembraEditando(null);
                            setShowFormulario(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Nueva Siembra
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-auto mb-4 max-w-[1600px] rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Search */}
                <div className="mx-auto mb-6 max-w-[1600px]">
                    <input
                        type="text"
                        placeholder="Buscar por campaña, lote o cultivo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Table */}
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
                    className="mx-auto max-w-[1600px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                />

                {/* Modal formulario */}
                <ModalFormularioSiembra
                    show={showFormulario}
                    onClose={() => {
                        setShowFormulario(false);
                        setSiembraEditando(null);
                    }}
                    siembraEditando={siembraEditando}
                    onSaved={handleSiembraSaved}
                />

                {/* Modal confirmación eliminar */}
                <ModalConfirmacion
                    show={siembraAEliminar !== null}
                    onCancelar={() => setSiembraAEliminar(null)}
                    onConfirmar={handleEliminarSiembra}
                    titulo="Eliminar Siembra"
                    mensaje={`¿Estás seguro de que deseás eliminar la siembra del lote "${siembraAEliminar?.lote_nombre}" en la campaña "${siembraAEliminar?.campania_nombre}"?`}
                />
            </div>
        </Body>
    );
}
