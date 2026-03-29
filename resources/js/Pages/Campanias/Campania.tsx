import Body from "@/components/ui/Tabs/Body";
import { ScrollArea } from "@/components/ui/scroll-area";
import Modal from "@/components/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    CalendarDays,
    Clock3,
    Filter,
    Plus,
    Search,
    Sprout,
    X,
} from "lucide-react";

type CampaignStatus = "Planificada" | "En Curso" | "Finalizada" | "Cancelada";

interface BackendCampania {
    id: number;
    campo_id: number | null;
    nombre: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    estado: CampaignStatus;
}

interface BackendCampo {
    id: number;
    nombre: string;
}

const statuses: CampaignStatus[] = ["Planificada", "En Curso", "Finalizada", "Cancelada"];

const statusTone: Record<CampaignStatus, string> = {
    "En Curso": "bg-emerald-100 text-emerald-800 ring-emerald-200",
    Planificada: "bg-amber-100 text-amber-800 ring-amber-200",
    Finalizada: "bg-slate-200 text-slate-700 ring-slate-300",
    Cancelada: "bg-rose-100 text-rose-700 ring-rose-200",
};

const order: Record<CampaignStatus, number> = {
    "En Curso": 0,
    Planificada: 1,
    Finalizada: 2,
    Cancelada: 3,
};

const formatDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "Sin fecha";

const toDate = (value: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const daysBetween = (start: string | null, end: string | null) => {
    const from = toDate(start);
    const to = toDate(end);
    if (!from || !to) return null;
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

function CampaignCard({
    campaign,
    fieldName,
}: {
    campaign: BackendCampania;
    fieldName: string;
}) {
    const span = daysBetween(campaign.fecha_inicio, campaign.fecha_fin);

    return (
        <article className="group flex h-full flex-col rounded-3xl border border-stone-300 bg-[#FCFBF8] p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                        Campania
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-stone-900">
                        {campaign.nombre}
                    </h3>
                    <p className="mt-2 text-sm text-stone-500">
                        Campo: <span className="font-semibold text-stone-800">{fieldName}</span>
                    </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone[campaign.estado]}`}>
                    {campaign.estado}
                </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 p-4 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 text-stone-500">
                        <CalendarDays size={16} />
                        <span className="text-xs font-bold uppercase tracking-wide">Inicio</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-stone-900">
                        {formatDate(campaign.fecha_inicio)}
                    </div>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 text-stone-500">
                        <Clock3 size={16} />
                        <span className="text-xs font-bold uppercase tracking-wide">Duracion</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-stone-900">
                        {span === null ? "Abierta" : `${span + 1} dias`}
                    </div>
                </div>
            </div>

            <div className="mt-4 border-t border-stone-200 bg-stone-50/50 px-1 pt-4">
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-[#f7f2e9] px-4 py-3">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                            Fecha de cierre
                        </div>
                        <div className="mt-1 text-sm font-semibold text-stone-900">
                            {formatDate(campaign.fecha_fin)}
                        </div>
                    </div>
                    <CalendarDays className="size-5 text-stone-400" />
                </div>
            </div>
        </article>
    );
}

export default function Campania() {
    const [campanias, setCampanias] = useState<BackendCampania[]>([]);
    const [campos, setCampos] = useState<BackendCampo[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newCampaniaName, setNewCampaniaName] = useState("");
    const [newFechaInicio, setNewFechaInicio] = useState("");
    const [newFechaFin, setNewFechaFin] = useState("");
    const [selectedCampoId, setSelectedCampoId] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<CampaignStatus | "Todas">("Todas");
    const [fieldFilter, setFieldFilter] = useState("Todos");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const cargarCampanias = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/campanias", { headers: { Accept: "application/json" } });
            if (!response.ok) throw new Error();
            const payload = (await response.json()) as BackendCampania[];
            setCampanias(Array.isArray(payload) ? payload : []);
            setError(null);
        } catch {
            setCampanias([]);
            setError("Error al cargar campanias desde el backend.");
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarCampos = useCallback(async () => {
        try {
            const response = await fetch("/api/campos", { headers: { Accept: "application/json" } });
            if (!response.ok) throw new Error();
            const payload = (await response.json()) as BackendCampo[];
            const nextFields = Array.isArray(payload) ? payload : [];
            setCampos(nextFields);
            setSelectedCampoId(nextFields[0] ? String(nextFields[0].id) : "");
        } catch {
            setCampos([]);
            setSelectedCampoId("");
        }
    }, []);

    useEffect(() => {
        void cargarCampanias();
        void cargarCampos();
    }, [cargarCampanias, cargarCampos]);

    const fieldById = useMemo(
        () => campos.reduce<Record<number, string>>((acc, field) => ({ ...acc, [field.id]: field.nombre }), {}),
        [campos],
    );

    const filteredCampanias = useMemo(() => {
        const term = search.trim().toLowerCase();

        return [...campanias]
            .filter((campaign) => {
                const fieldName = campaign.campo_id ? fieldById[campaign.campo_id] ?? "Sin campo" : "Sin campo";
                const matchesSearch =
                    term.length === 0 ||
                    campaign.nombre.toLowerCase().includes(term) ||
                    fieldName.toLowerCase().includes(term);
                const matchesStatus = statusFilter === "Todas" || campaign.estado === statusFilter;
                const matchesField = fieldFilter === "Todos" || String(campaign.campo_id ?? "") === fieldFilter;
                return matchesSearch && matchesStatus && matchesField;
            })
            .sort((a, b) => {
                const byStatus = order[a.estado] - order[b.estado];
                if (byStatus !== 0) return byStatus;
                return a.nombre.localeCompare(b.nombre, "es");
            });
    }, [campanias, fieldById, fieldFilter, search, statusFilter]);

    const summary = useMemo(
        () => ({
            total: campanias.length,
            enCurso: campanias.filter((campaign) => campaign.estado === "En Curso").length,
            planificadas: campanias.filter((campaign) => campaign.estado === "Planificada").length,
            fields: new Set(campanias.map((campaign) => campaign.campo_id).filter(Boolean)).size,
        }),
        [campanias],
    );

    const openModal = () => {
        if (!selectedCampoId && campos[0]) setSelectedCampoId(String(campos[0].id));
        setShowModal(true);
        setFormError(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setNewCampaniaName("");
        setNewFechaInicio("");
        setNewFechaFin("");
        setFormError(null);
        setSelectedCampoId(campos[0] ? String(campos[0].id) : "");
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!newCampaniaName.trim() || !newFechaInicio.trim()) {
            setFormError("El nombre y la fecha de inicio son obligatorios.");
            return;
        }
        if (!selectedCampoId) {
            setFormError("Debes seleccionar un campo para crear la campania.");
            return;
        }
        if (newFechaFin && newFechaFin < newFechaInicio) {
            setFormError("La fecha de fin no puede ser anterior a la fecha de inicio.");
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            const response = await fetch("/api/campanias", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    campo_id: Number(selectedCampoId),
                    nombre: newCampaniaName.trim(),
                    fecha_inicio: newFechaInicio,
                    fecha_fin: newFechaFin || null,
                    estado: "Planificada",
                    // cultivo_id: selectedCultivoId,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message ?? "Error al crear la campania.");
            }

            await cargarCampanias();
            closeModal();
        } catch (submitError) {
            setFormError(submitError instanceof Error ? submitError.message : "Error al crear la campania.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Body>
            <div className="flex h-full min-h-0 flex-col px-4 py-6 font-sans lg:px-8">
                <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Gestion de Campanias
                            </h1>
                            <p className="mt-1 text-sm text-stone-500">
                                Administra estados, fechas y campos asociados de cada temporada.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openModal}
                            disabled={campos.length === 0}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300"
                        >
                            <Plus size={20} />
                            Nueva Campania
                        </button>
                    </div>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            { label: "Total", value: summary.total, detail: "Campanias registradas" },
                            { label: "En curso", value: summary.enCurso, detail: "Seguimiento activo" },
                            { label: "Planificadas", value: summary.planificadas, detail: "Pendientes de inicio" },
                            { label: "Campos", value: summary.fields, detail: "Con campanias asociadas" },
                        ].map((item) => (
                            <article key={item.label} className="rounded-2xl border border-stone-200 bg-[#FCFBF8] p-5 shadow-sm">
                                <div className="text-sm font-semibold text-stone-500">{item.label}</div>
                                <div className="mt-4 text-4xl font-black tracking-tight text-stone-900">{item.value}</div>
                                <p className="mt-2 text-sm text-stone-500">{item.detail}</p>
                            </article>
                        ))}
                    </section>

                    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Search size={14} />
                                    Buscar
                                </span>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Nombre o campo..."
                                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Filter size={14} />
                                    Estado
                                </span>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value as CampaignStatus | "Todas")}
                                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                                >
                                    <option value="Todas">Todos los estados</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Sprout size={14} />
                                    Campo
                                </span>
                                <select
                                    value={fieldFilter}
                                    onChange={(event) => setFieldFilter(event.target.value)}
                                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                                >
                                    <option value="Todos">Todos los campos</option>
                                    {campos.map((field) => (
                                        <option key={field.id} value={String(field.id)}>{field.nombre}</option>
                                    ))}
                                </select>
                            </label>

                            <div className="flex items-end">
                                <div className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-600">
                                    {filteredCampanias.length} visibles
                                </div>
                            </div>
                        </div>
                    </section>

                    <ScrollArea className="min-h-0 flex-1 w-full">
                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                        )}

                        <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 xl:grid-cols-3">
                            {loading ? (
                                <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-stone-500">
                                    Cargando campanias...
                                </div>
                            ) : filteredCampanias.length === 0 ? (
                                <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h2 className="mt-4 text-xl font-bold text-stone-900">No hay campanias para mostrar</h2>
                                    <p className="mt-2 text-sm text-stone-500">
                                        Ajusta los filtros o crea una nueva campania para empezar.
                                    </p>
                                </div>
                            ) : (
                                filteredCampanias.map((campaign) => (
                                    <CampaignCard
                                        key={campaign.id}
                                        campaign={campaign}
                                        fieldName={campaign.campo_id ? fieldById[campaign.campo_id] ?? "Sin campo" : "Sin campo"}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Nueva campania</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-900">Crear etapa productiva</h2>
                        </div>
                        <button type="button" onClick={closeModal} className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700">
                            <X size={18} />
                        </button>
                    </div>

                    {campos.length === 0 && (
                        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Necesitas crear al menos un campo antes de registrar una campania.
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="campania-nombre" value="Nombre de la campania" />
                            <TextInput
                                id="campania-nombre"
                                value={newCampaniaName}
                                onChange={(event) => setNewCampaniaName(event.target.value)}
                                placeholder="Ej: Campania fina 2026"
                                className="mt-2 w-full rounded-2xl border-stone-300 bg-stone-50"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="campania-campo" value="Campo asociado" />
                            <select
                                id="campania-campo"
                                value={selectedCampoId}
                                onChange={(event) => setSelectedCampoId(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                            >
                                {campos.map((field) => (
                                    <option key={field.id} value={String(field.id)}>{field.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="campania-fecha-inicio" value="Fecha de inicio" />
                                <TextInput
                                    id="campania-fecha-inicio"
                                    type="date"
                                    value={newFechaInicio}
                                    onChange={(event) => setNewFechaInicio(event.target.value)}
                                    className="mt-2 w-full rounded-2xl border-stone-300 bg-stone-50"
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="campania-fecha-fin" value="Fecha de fin" />
                                <TextInput
                                    id="campania-fecha-fin"
                                    type="date"
                                    value={newFechaFin}
                                    onChange={(event) => setNewFechaFin(event.target.value)}
                                    className="mt-2 w-full rounded-2xl border-stone-300 bg-stone-50"
                                />
                            </div>
                        </div>
                    </div>

                    {formError && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {formError}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeModal} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving || campos.length === 0}
                            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                        >
                            {saving ? "Guardando..." : "Crear campania"}
                        </button>
                    </div>
                </form>
            </Modal>
        </Body>
    );
}
