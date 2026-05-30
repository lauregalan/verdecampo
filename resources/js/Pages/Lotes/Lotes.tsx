import Body from "@/components/ui/Tabs/Body";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Head, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    CalendarDays,
    Filter,
    Layers3,
    Plus,
    Search,
    Sprout,
} from "lucide-react";
import api from "@/lib/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ModalFormularioLote from "@/components/Modals/ModalFormularioLote";
import LoteCard from "./LoteCard";
import {
    Campania,
    CampaniaDB,
    Campo,
    CampoDB,
    Cultivo,
    CultivoDB,
    Estado,
    IdCultivoPorIdCampania,
    IdLotesPorIdCampania,
    Lote,
    LoteDraft,
} from "./types";
import ModalConfirmacion from "@/components/Modals/ModalConfirmacion";

type LoteFormErrors = Record<string, string>;

const loteErrorFieldMap: Record<string, string> = {
    nombre: "name",
    campo_id: "campo",
    caracteristicas: "caracteristicas",
    estado: "status",
    latitud: "polygon",
    longitud: "polygon",
    hectareas: "hectareas",
    ph: "ph",
    napa: "napa",
    polygon: "polygon",
};

const getLoteFormErrors = async (
    response: Response,
    fallback: string,
): Promise<LoteFormErrors> => {
    const payload = (await response.json().catch(() => null)) as
        | {
              message?: string;
              errors?: Record<string, string[]>;
          }
        | null;

    if (!payload?.errors) {
        return { name: payload?.message ?? fallback };
    }

    return Object.entries(payload.errors).reduce<LoteFormErrors>(
        (acc, [field, messages]) => {
            const formField =
                loteErrorFieldMap[field] ??
                loteErrorFieldMap[field.split(".")[0]] ??
                "name";
            acc[formField] = messages[0] ?? fallback;
            return acc;
        },
        {},
    );
};

const mapearLote = (lote: any): Lote => ({
    id: lote.id,
    nombre: lote.nombre,
    caracteristicas: lote.caracteristicas,
    estado: lote.estado,
    latitud: Number(lote.latitud),
    longitud: Number(lote.longitud),
    hectareas: Number(lote.hectareas),
    idCampo: Number(lote.campo_id),
    ph: Number(lote.ph),
    napa: Number(lote.napa),
    polygon: lote.polygon ?? [],
    siembras: lote.siembras ?? [],
});

const parsePositiveInteger = (value: string | null) => {
    if (!value) return null;

    const parsedValue = Number(value);

    return Number.isInteger(parsedValue) && parsedValue > 0
        ? parsedValue
        : null;
};

const estados: Estado[] = [
    { nombre: "produccion" },
    { nombre: "barbecho" },
    { nombre: "preparacion" },
    { nombre: "disponible" },
];

const estadoLabels: Record<string, string> = {
    produccion: "En produccion",
    barbecho: "En barbecho",
    preparacion: "En preparacion",
    disponible: "Disponibles",
};

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

export default function Lotes() {
    const authUser = usePage().props.auth?.user as
        | { roles?: string[] }
        | undefined;
    const isProductor = authUser?.roles?.includes("Productor") ?? false;

    const filtrosIniciales = useMemo(() => {
        if (typeof window === "undefined") {
            return {
                busqueda: "",
                campoId: null,
                estado: null,
                campaniaId: null,
                cultivoId: null,
            };
        }

        const searchParams = new URLSearchParams(window.location.search);
        const estado = searchParams.get("estado");

        return {
            busqueda: searchParams.get("q") ?? "",
            campoId: parsePositiveInteger(searchParams.get("campoId")),
            estado: estado && estado !== "todos" ? estado : null,
            campaniaId: parsePositiveInteger(searchParams.get("campaniaId")),
            cultivoId: parsePositiveInteger(searchParams.get("cultivoId")),
        };
    }, []);

    const [lotes, setLotes] = useState<Lote[]>([]);
    const [showFormulario, setShowFormulario] = useState(false);
    const [campoSeleccionado, setCampoSeleccionado] = useState<Campo | null>(
        filtrosIniciales.campoId !== null
            ? { id: filtrosIniciales.campoId, nombre: "" }
            : null,
    );
    const [cultivoSeleccionado, setCultivoSeleccionado] =
        useState<Cultivo | null>(
            filtrosIniciales.cultivoId !== null
                ? { id: filtrosIniciales.cultivoId, nombre: "" }
                : null,
        );
    const [campaniaSeleccionada, setCampaniaSeleccionada] =
        useState<Campania | null>(
            filtrosIniciales.campaniaId !== null
                ? { id: filtrosIniciales.campaniaId, nombre: "" }
                : null,
        );
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<Estado | null>(
        () =>
            estados.find(
                (estado) => estado.nombre === filtrosIniciales.estado,
            ) ?? null,
    );
    const [loteEditando, setLoteEditando] = useState<Lote | null>(null);
    const [loteAEliminar, setLoteAEliminar] = useState<Lote | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [nombreBuscado, setNombreBuscado] = useState(
        filtrosIniciales.busqueda,
    );
    const [campos, setCampos] = useState<Campo[]>([]);
    const [cultivos, setCultivos] = useState<Cultivo[]>([]);
    const [campanias, setCampanias] = useState<Campania[]>([]);
    const [lotesPorCampania, setLotesPorCampania] = useState<
        IdLotesPorIdCampania[]
    >([]);
    const [cultivoPorCampania, setCultivoPorCampania] = useState<
        IdCultivoPorIdCampania[]
    >([]);
    const [loading, setLoading] = useState(true);

    const GetLotes = useCallback(async () => {
        try {
            const response = await api.get("/api/lotes");
            if (!response.ok) {
                throw new Error("No se pudieron obtener los lotes.");
            }

            const data = asArray<any>(await response.json());
            setLotes(data.map(mapearLote));
        } catch (fetchError) {
            console.error("Error fetching lots:", fetchError);
            setLotes([]);
            setError("Error al cargar lotes desde el backend.");
        }
    }, []);

    const getCampos = useCallback(async () => {
        try {
            const response = await api.get("/api/campos");
            if (!response.ok) {
                throw new Error("No se pudieron obtener los campos.");
            }

            const data = asArray<CampoDB>(await response.json());
            setCampos(
                data.map((campo) => ({
                    id: campo.id,
                    nombre: campo.nombre,
                })),
            );
        } catch (fetchError) {
            console.error("Error fetching fields:", fetchError);
            setCampos([]);
        }
    }, []);

    const getCampanias = useCallback(async () => {
        try {
            const resultLotes: IdLotesPorIdCampania[] = [];
            const resultCultivos: IdCultivoPorIdCampania[] = [];
            const response = await api.get("/api/campanias");
            if (!response.ok) {
                throw new Error("No se pudieron obtener las campanias.");
            }

            const data = asArray<CampaniaDB>(await response.json());

            setCampanias(
                data.map((campania) => ({
                    id: campania.id,
                    nombre: campania.nombre,
                })),
            );

            for (const campania of data) {
                const responseLotes = await api.get(
                    `/api/campanias/${campania.id}/lotes`,
                );
                if (!responseLotes.ok) {
                    throw new Error("No se pudieron obtener los lotes de la campania.");
                }

                const dataLotes = asArray<any>(await responseLotes.json());

                resultLotes.push({
                    campaniaId: campania.id,
                    lotesId: dataLotes.map((lote: any) => lote.id),
                });
            }

            for (const campania of data) {
                resultCultivos.push({
                    campaniaId: campania.id,
                    cultivosId: campania.cultivo_id,
                });
            }

            setLotesPorCampania(resultLotes);
            setCultivoPorCampania(resultCultivos);
        } catch (fetchError) {
            console.error("Error fetching campaigns:", fetchError);
            setCampanias([]);
            setLotesPorCampania([]);
            setCultivoPorCampania([]);
        }
    }, []);

    const getCultivos = useCallback(async () => {
        try {
            const response = await api.get("/api/cultivos");
            if (!response.ok) {
                throw new Error("No se pudieron obtener los cultivos.");
            }

            const data = asArray<CultivoDB>(await response.json());
            setCultivos(
                data.map((cultivo) => ({
                    id: cultivo.id,
                    nombre: cultivo.tipo,
                })),
            );
        } catch (fetchError) {
            console.error("Error fetching crops:", fetchError);
            setCultivos([]);
        }
    }, []);

    useEffect(() => {
        let active = true;

        const cargarDatos = async () => {
            setLoading(true);
            await Promise.all([
                GetLotes(),
                getCampos(),
                getCampanias(),
                getCultivos(),
            ]);

            if (active) {
                setLoading(false);
            }
        };

        void cargarDatos();

        return () => {
            active = false;
        };
    }, [GetLotes, getCampos, getCampanias, getCultivos]);

    useEffect(() => {
        if (
            filtrosIniciales.campoId === null ||
            campos.length === 0 ||
            campoSeleccionado?.nombre
        ) {
            return;
        }

        const campoInicial =
            campos.find((campo) => campo.id === filtrosIniciales.campoId) ??
            campoSeleccionado;

        setCampoSeleccionado(campoInicial);
    }, [filtrosIniciales.campoId, campoSeleccionado, campos]);

    useEffect(() => {
        if (
            filtrosIniciales.campaniaId === null ||
            campanias.length === 0 ||
            campaniaSeleccionada?.nombre
        ) {
            return;
        }

        const campaniaInicial =
            campanias.find(
                (campania) => campania.id === filtrosIniciales.campaniaId,
            ) ?? campaniaSeleccionada;

        setCampaniaSeleccionada(campaniaInicial);
    }, [campaniaSeleccionada, campanias, filtrosIniciales.campaniaId]);

    useEffect(() => {
        if (
            filtrosIniciales.cultivoId === null ||
            cultivos.length === 0 ||
            cultivoSeleccionado?.nombre
        ) {
            return;
        }

        const cultivoInicial =
            cultivos.find(
                (cultivo) => cultivo.id === filtrosIniciales.cultivoId,
            ) ?? cultivoSeleccionado;

        setCultivoSeleccionado(cultivoInicial);
    }, [cultivoSeleccionado, cultivos, filtrosIniciales.cultivoId]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const searchParams = new URLSearchParams();
        const busqueda = nombreBuscado.trim();

        if (busqueda) {
            searchParams.set("q", busqueda);
        }
        if (campoSeleccionado) {
            searchParams.set("campoId", String(campoSeleccionado.id));
        }
        if (estadoSeleccionado) {
            searchParams.set("estado", estadoSeleccionado.nombre);
        }
        if (campaniaSeleccionada) {
            searchParams.set("campaniaId", String(campaniaSeleccionada.id));
        }
        if (cultivoSeleccionado) {
            searchParams.set("cultivoId", String(cultivoSeleccionado.id));
        }

        const queryString = searchParams.toString();
        const nextUrl = queryString
            ? `${window.location.pathname}?${queryString}`
            : window.location.pathname;

        window.history.replaceState({}, "", nextUrl);
    }, [
        campaniaSeleccionada,
        campoSeleccionado,
        cultivoSeleccionado,
        estadoSeleccionado,
        nombreBuscado,
    ]);

    const fieldById = useMemo(
        () =>
            Object.fromEntries(campos.map((campo) => [campo.id, campo.nombre])) as Record<
                number,
                string
            >,
        [campos],
    );

    const lotesFiltrados = useMemo(() => {
        const normalizedSearch = nombreBuscado.trim().toLowerCase();

        return [...lotes]
            .filter((lote) => {
                const fieldName = fieldById[lote.idCampo] ?? "Sin campo";

                if (campoSeleccionado && lote.idCampo !== campoSeleccionado.id) {
                    return false;
                }

                if (
                    estadoSeleccionado &&
                    lote.estado !== estadoSeleccionado.nombre
                ) {
                    return false;
                }

                if (
                    normalizedSearch.length > 0 &&
                    !lote.nombre.toLowerCase().includes(normalizedSearch) &&
                    !fieldName.toLowerCase().includes(normalizedSearch)
                ) {
                    return false;
                }

                if (campaniaSeleccionada) {
                    const loteEnCampania = lotesPorCampania.find(
                        (item) => item.campaniaId === campaniaSeleccionada.id,
                    );

                    if (
                        !loteEnCampania ||
                        !loteEnCampania.lotesId.includes(lote.id)
                    ) {
                        return false;
                    }
                }

                if (cultivoSeleccionado) {
                    const idCampania = lotesPorCampania.find((item) =>
                        item.lotesId.includes(lote.id),
                    )?.campaniaId;
                    const cultivoEnCampania = cultivoPorCampania.find(
                        (item) => item.campaniaId === idCampania,
                    );

                    if (cultivoEnCampania?.cultivosId !== cultivoSeleccionado.id) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }, [
        campaniaSeleccionada,
        campoSeleccionado,
        cultivoPorCampania,
        cultivoSeleccionado,
        estadoSeleccionado,
        fieldById,
        lotes,
        lotesPorCampania,
        nombreBuscado,
    ]);

    const summary = useMemo(
        () => ({
            total: lotes.length,
            produccion: lotes.filter((lote) => lote.estado === "produccion")
                .length,
            hectareas: lotes.reduce((total, lote) => total + lote.hectareas, 0),
            fields: new Set(lotes.map((lote) => lote.idCampo)).size,
        }),
        [lotes],
    );

    const handleAgregarLote = async (
        nuevoLote: LoteDraft,
        campoId: number | string,
    ): Promise<LoteFormErrors | null> => {
        try {
            const campoIdNumerico = Number(campoId);

            if (!Number.isInteger(campoIdNumerico) || campoIdNumerico <= 0) {
                return {
                    campo: "Selecciona un campo valido antes de guardar el lote.",
                };
            }

            const payload = {
                nombre: nuevoLote.name?.trim() || "",
                caracteristicas: nuevoLote.caracteristicas || "",
                estado: nuevoLote.status.toLowerCase().replace(" ", ""),
                latitud: Number(nuevoLote.latitude) ?? 0,
                longitud: Number(nuevoLote.longitude) ?? 0,
                hectareas: Number(nuevoLote.hectareas) ?? 0,
                campo_id: campoIdNumerico,
                ph: Number(nuevoLote.ph) || 0,
                napa: Number(nuevoLote.napa) || 0,
                polygon: nuevoLote.polygon ?? [],
            };

            if (loteEditando) {
                const response = await api.put(
                    `/api/lotes/${loteEditando.id}`,
                    payload,
                );

                if (!response.ok) {
                    return await getLoteFormErrors(
                        response,
                        "No se pudo actualizar el lote.",
                    );
                }

                const data = await response.json();
                console.log("✅ Lote actualizado:", data);

                setLotes((prev) =>
                    prev.map((lote) =>
                        lote.id === data.id ? mapearLote(data) : lote,
                    ),
                );
            } else {
                // -------- CREAR --------
                const response = await api.post(`/api/lotes`, payload);

                if (!response.ok) {
                    return await getLoteFormErrors(
                        response,
                        "No se pudo crear el lote.",
                    );
                }

                const data = await response.json();
                console.log("✅ Lote creado:", data);

                setLotes((prev) => [...prev, mapearLote(data)]);
            }

            setShowFormulario(false);
            setLoteEditando(null);
            setError(null);

            return null;
        } catch (error) {
            console.error("Error:", error);
            const message =
                error instanceof Error ? error.message : "Error al guardar el lote.";
            setError(message);
            return { name: message };
        }
    };

    const handleEliminarLote = async (id: number) => {
        try {
            const response = await api.delete(`/api/lotes/${id}`);

            if (!response.ok) {
                throw new Error("No se pudo eliminar el lote.");
            }

            setLotes((prev) => prev.filter((lote) => lote.id !== id));
        } catch (deleteError) {
            console.error("Error:", deleteError);
            setError("Error al eliminar el lote.");
        } finally {
            setLoteAEliminar(null);
        }
    };

    const loteToForm = (lote: Lote | null) => {
        if (!lote) return null;

        return {
            id: lote.id,
            campo_id: lote.idCampo,
            name: lote.nombre,
            status: lote.estado,
            latitude: lote.latitud,
            longitude: lote.longitud,
            hectareas: lote.hectareas,
            caracteristicas: lote.caracteristicas,
            ph: lote.ph,
            napa: lote.napa,
            polygon: [],
        };
    };

    return (
        <Body>
            <Head title="Gestion de Lotes" />

            <div className="flex h-full min-h-0 flex-col p-8 font-sans">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestion de Lotes
                            </h1>
                        </div>
                        {isProductor && (
                            <button
                                type="button"
                                onClick={() => setShowFormulario(true)}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                            >
                                <Plus size={20} />
                                Nuevo Lote
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-stone-500">
                        Gestiona la superficie, el estado y la trazabilidad de cada lote.
                    </p>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: "Total",
                                value: summary.total,
                                detail: "Lotes registrados",
                            },
                            {
                                label: "En produccion",
                                value: summary.produccion,
                                detail: "Con actividad actual",
                            },
                            {
                                label: "Hectareas",
                                value: summary.hectareas.toLocaleString("es-AR"),
                                detail: "Superficie acumulada",
                            },
                            {
                                label: "Campos",
                                value: summary.fields,
                                detail: "Con lotes asociados",
                            },
                        ].map((item) => (
                            <article
                                key={item.label}
                                className="rounded-2xl border border-stone-200 bg-[#FCFBF8] p-5 shadow-sm"
                            >
                                <div className="text-sm font-semibold text-stone-500">
                                    {item.label}
                                </div>
                                <div className="mt-4 text-4xl font-black tracking-tight text-stone-900">
                                    {item.value}
                                </div>
                                <p className="mt-2 text-sm text-stone-500">
                                    {item.detail}
                                </p>
                            </article>
                        ))}
                    </section>

                    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]">
                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Search size={14} />
                                    Buscar
                                </span>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                                    <input
                                        value={nombreBuscado}
                                        onChange={(e) =>
                                            setNombreBuscado(e.target.value)
                                        }
                                        placeholder="Nombre o campo..."
                                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Sprout size={14} />
                                    Campo
                                </span>
                                <Select
                                    value={
                                        campoSeleccionado
                                            ? String(campoSeleccionado.id)
                                            : "todos"
                                    }
                                    onValueChange={(value) => {
                                        if (value === "todos") {
                                            setCampoSeleccionado(null);
                                            return;
                                        }

                                        setCampoSeleccionado(
                                            campos.find(
                                                (campo) =>
                                                    String(campo.id) === value,
                                            ) ?? null,
                                        );
                                    }}
                                >
                                    <SelectTrigger className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:ring-emerald-500">
                                        <SelectValue placeholder="Todos los campos" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="todos">
                                            Ver todos
                                        </SelectItem>
                                        {campos.map((campo) => (
                                            <SelectItem
                                                key={campo.id}
                                                value={String(campo.id)}
                                            >
                                                {campo.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Filter size={14} />
                                    Estado
                                </span>
                                <Select
                                    value={
                                        estadoSeleccionado
                                            ? estadoSeleccionado.nombre
                                            : "todos"
                                    }
                                    onValueChange={(value) => {
                                        if (value === "todos") {
                                            setEstadoSeleccionado(null);
                                            return;
                                        }

                                        setEstadoSeleccionado(
                                            estados.find(
                                                (estado) =>
                                                    estado.nombre === value,
                                            ) ?? null,
                                        );
                                    }}
                                >
                                    <SelectTrigger className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:ring-emerald-500">
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="todos">
                                            Ver todos
                                        </SelectItem>
                                        {estados.map((estado) => (
                                            <SelectItem
                                                key={estado.nombre}
                                                value={estado.nombre}
                                            >
                                                {estadoLabels[estado.nombre] ??
                                                    estado.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <CalendarDays size={14} />
                                    Campania
                                </span>
                                <Select
                                    value={
                                        campaniaSeleccionada
                                            ? String(campaniaSeleccionada.id)
                                            : "todos"
                                    }
                                    onValueChange={(value) => {
                                        if (value === "todos") {
                                            setCampaniaSeleccionada(null);
                                            return;
                                        }

                                        setCampaniaSeleccionada(
                                            campanias.find(
                                                (campania) =>
                                                    String(campania.id) === value,
                                            ) ?? null,
                                        );
                                    }}
                                >
                                    <SelectTrigger className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:ring-emerald-500">
                                        <SelectValue placeholder="Todas las campanias" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="todos">
                                            Ver todos
                                        </SelectItem>
                                        {campanias.map((campania) => (
                                            <SelectItem
                                                key={campania.id}
                                                value={String(campania.id)}
                                            >
                                                {campania.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                                    <Layers3 size={14} />
                                    Cultivo
                                </span>
                                <Select
                                    value={
                                        cultivoSeleccionado
                                            ? String(cultivoSeleccionado.id)
                                            : "todos"
                                    }
                                    onValueChange={(value) => {
                                        if (value === "todos") {
                                            setCultivoSeleccionado(null);
                                            return;
                                        }

                                        setCultivoSeleccionado(
                                            cultivos.find(
                                                (cultivo) =>
                                                    String(cultivo.id) === value,
                                            ) ?? null,
                                        );
                                    }}
                                >
                                    <SelectTrigger className="w-full rounded-2xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:ring-emerald-500">
                                        <SelectValue placeholder="Todos los cultivos" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="todos">
                                            Ver todos
                                        </SelectItem>
                                        {cultivos.map((cultivo) => (
                                            <SelectItem
                                                key={cultivo.id}
                                                value={String(cultivo.id)}
                                            >
                                                {cultivo.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </label>

                            <div className="flex items-end">
                                <div className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-600">
                                    {lotesFiltrados.length} visibles
                                </div>
                            </div>
                        </div>
                    </section>

                    <ScrollArea className="min-h-0 flex-1 w-full">
                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 xl:grid-cols-3">
                            {loading ? (
                                <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-stone-500">
                                    Cargando lotes...
                                </div>
                            ) : lotesFiltrados.length === 0 ? (
                                <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h2 className="mt-4 text-xl font-bold text-stone-900">
                                        No hay lotes para mostrar
                                    </h2>
                                    <p className="mt-2 text-sm text-stone-500">
                                        Ajusta los filtros o crea un nuevo lote para empezar.
                                    </p>
                                </div>
                            ) : (
                                lotesFiltrados.map((lote) => (
                                    <LoteCard
                                        key={lote.id}
                                        lote={lote}
                                        isProductor={isProductor}
                                        fieldName={fieldById[lote.idCampo] ?? "Sin campo"}
                                        onOpenDetail={() => {
                                            const returnTo =
                                                typeof window !== "undefined"
                                                    ? `${window.location.pathname}${window.location.search}`
                                                    : "/lotes";

                                            router.visit(
                                                `/lotes/${lote.id}?returnTo=${encodeURIComponent(returnTo)}`,
                                            );
                                        }}
                                        onEdit={() => {
                                            setLoteEditando(lote);
                                            setShowFormulario(true);
                                        }}
                                        onDelete={() => setLoteAEliminar(lote)}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <ModalFormularioLote
                show={showFormulario}
                onClose={() => {
                    setShowFormulario(false);
                    setLoteEditando(null);
                }}
                campoId={campoSeleccionado ? campoSeleccionado.id : ""}
                onSubmit={handleAgregarLote}
                initialData={loteToForm(loteEditando)}
            />

            <ModalConfirmacion
                show={loteAEliminar !== null}
                titulo="Eliminar lote"
                mensaje={`Estas seguro de que queres eliminar el lote "${loteAEliminar?.nombre}"? Esta accion no se puede deshacer.`}
                onConfirmar={() =>
                    loteAEliminar && handleEliminarLote(loteAEliminar.id)
                }
                onCancelar={() => setLoteAEliminar(null)}
            />
        </Body>
    );
}
