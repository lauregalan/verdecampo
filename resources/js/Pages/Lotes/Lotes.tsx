import { Button } from "@/components/ui/button";
import { Head } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import FormularioLote from "./FormularioLote";
import LoteCard from "./LoteCard";
import { Plus } from "lucide-react";
import { LoteDraft } from "./types";

export interface Lote {
    id: number;
    nombre: string;
    caracteristicas: string;
    estado: string;
    longitud: number;
    latitud: number;
    hectareas: number;
    idCampo: number;
    ph: number;
    napa: number;
}

interface Campo {
    id: number;
    nombre: string;
}

interface CampoDB {
    id: number;
    nombre: string;
    latitud: string;
    longitud: string;
    hectareas: number;
}

interface Cultivo {
    id: number;
    nombre: string;
}

interface Campania {
    id: number;
    nombre: string;
}

interface Estado {
    nombre: string;
}

export default function Lotes() {
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [lotesFiltrados, setLotesFiltrados] = useState<Lote[]>([]);
    const [showFormulario, setShowFormulario] = useState(false);
    const [campoSeleccionado, setCampoSeleccionado] = useState<Campo | null>(
        null,
    );
    const [cultivoSeleccionado, setCultivoSeleccionado] =
        useState<Cultivo | null>(null);
    const [campaniaSeleccionada, setCampaniaSeleccionada] =
        useState<Campania | null>(null);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<Estado | null>(
        null,
    );

    const [loteEditando, setLoteEditando] = useState<Lote | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [nombreBuscado, setNombreBuscado] = useState("");
    const [campos, setCampos] = useState<Campo[]>([
        { id: 1, nombre: "Campo A" },
        { id: 2, nombre: "Campo B" },
        { id: 3, nombre: "Campo C" },
    ]);
    const [cultivos, setCultivos] = useState<Cultivo[]>([
        { id: 1, nombre: "Trigo" },
        { id: 2, nombre: "Maíz" },
        { id: 3, nombre: "Soja" },
    ]);
    const [campanias, setCampanias] = useState<Campania[]>([
        { id: 1, nombre: "Campaña 2023" },
        { id: 2, nombre: "Campaña 2024" },
        { id: 3, nombre: "Campaña 2025" },
    ]);

    const estados = [
        { nombre: "produccion" },
        { nombre: "barbecho" },
        { nombre: "preparacion" },
        { nombre: "disponible" },
    ];

    const GetLotes = useCallback(async () => {
        try {
            const response = await fetch("/api/lotes");
            const data = await response.json();
            setLotes(
                data.map((lote: any) => ({
                    id: lote.id,
                    nombre: lote.nombre,
                    caracteristicas: lote.caracteristicas,
                    estado: lote.estado,
                    latitud: lote.latitud,
                    longitud: lote.longitud,
                    hectareas: lote.hectareas,
                    idCampo: lote.id_campo,
                    ph: lote.ph,
                    napa: lote.napa,
                })),

            );
            console.log("Lotes obtenidos:", data);
        } catch (error) {
            console.error("Error fetching lots:", error);
        }
    }, []);

    const getCampos = useCallback(async () => {
        try {
            const response = await fetch("/api/campos");
            const data = await response.json();
            setCampos(
                data.map((campo: CampoDB) => ({
                    id: campo.id,
                    nombre: campo.nombre,
                }))
            );
        } catch (error) {
            console.error("Error fetching lots:", error);
        }
    }, []);

    useEffect(() => {
        GetLotes();
        getCampos();
    }, []);

    useEffect(() => {
        const filtrados = lotes.filter((lote) => {
            console.log("Filtrando lote:", lote.nombre, "idCampo:", lote.idCampo, "campoSeleccionado:", campoSeleccionado?.id);
            if (campoSeleccionado && lote.idCampo !== campoSeleccionado.id) {
                console.log("Excluyendo lote por campo");
                return false;
            }
            if (estadoSeleccionado && lote.estado !== estadoSeleccionado.nombre) {
                return false;
            }
            if (nombreBuscado && !lote.nombre.toLowerCase().includes(nombreBuscado.toLowerCase())) {
                return false;
            }
            // Para campania y cultivo, no hay propiedades en lote, así que omitir por ahora
            return true;
        });
        console.log("Lotes filtrados:", filtrados.length, "de", lotes.length);
        console.log("Filtrados: ", filtrados);
        setLotesFiltrados(filtrados);
    }, [lotes, campoSeleccionado, estadoSeleccionado, nombreBuscado]);

const handleAbrirCreacion = () => {
    setShowFormulario(true);
};
const handleAgregarLote = async (
    nuevoLote: LoteDraft,
    campoId: number | string
): Promise<boolean> => {
    try {
        const hectareas = Number.isFinite(Number(nuevoLote.hectarea))
            ? Math.round(Number(nuevoLote.hectarea
            ))
            : 0;

        const payload = {
            nombre: nuevoLote.name,
            caracteristicas: nuevoLote.caracteristicas,
            estado: nuevoLote.status,
            latitud: Number(nuevoLote.latitude),
            longitud: Number(nuevoLote.longitude),
            hectareas,
            idCampo: Number(campoId),
            ph: nuevoLote.ph,
            napa: nuevoLote.napa,
        };

        // ✏️ EDITAR
        if (loteEditando) {
            const response = await fetch(`/api/lotes/${loteEditando.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("No se pudo actualizar el lote.");
            }

            const updatedLote = (await response.json()) as Lote;

            setLotes((prev) =>
                prev.map((l) => (l.id === updatedLote.id ? updatedLote : l))
            );

            setShowFormulario(false);
            setLoteEditando(null);
            setError(null);

            return true;
        }

        // ➕ CREAR
        const response = await fetch(`/api/lotes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("No se pudo crear el lote.");
        }

        const createdLote = (await response.json()) as Lote;

        setLotes((prev) => [...prev, createdLote]);

        setShowFormulario(false);
        setError(null);

        return true;
    } catch (error) {
        console.error(error);
        setError("Error al guardar el lote.");
        return false;
    }
};

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
                        {/* 🔍 Buscador */}
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={nombreBuscado}
                            onChange={(e) => setNombreBuscado(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />

                        {/* 🎛️ Filtros */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Campo */}
                            <Select
                                value={
                                    campoSeleccionado
                                        ? String(campoSeleccionado.id)
                                        : ""
                                }
                                onValueChange={(value: string) => {
                                    if (value === "todos") {
                                        setCampoSeleccionado(null);
                                    } else {
                                        const campo =
                                            campos.find(
                                                (c) => String(c.id) === value,
                                            ) || null;
                                        setCampoSeleccionado(campo);
                                    }
                                    console.log("Campo seleccionado:", value === "todos" ? null : campos.find((c) => String(c.id) === value));
                                }}
                            >
                                <SelectTrigger className="w-full rounded-xl border border-gray-300 bg-[#fffaf0] hover:bg-gray-100 focus:ring-2 focus:ring-green-500">
                                    <SelectValue placeholder="Campo" />
                                </SelectTrigger>

                                <SelectContent className="rounded-xl">
                                    <SelectItem
                                        value="todos"
                                        className="cursor-pointer bg-[#fffaf0] hover:bg-green-100 focus:bg-green-100"
                                    >
                                        Todos
                                    </SelectItem>
                                    {campos.map((campo) => (
                                        <SelectItem
                                            key={campo.id}
                                            value={String(campo.id)}
                                            className="cursor-pointer bg-[#fffaf0] hover:bg-green-100 focus:bg-green-100"
                                        >
                                            {campo.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Campaña */}
                            <Select
                                value={
                                    estadoSeleccionado
                                        ? estadoSeleccionado.nombre
                                        : ""
                                }
                                onValueChange={(value: string) => {
                                    if (value === "todos") {
                                        setEstadoSeleccionado(null);
                                    } else {
                                        const estado =
                                            estados.find(
                                                (e) => e.nombre === value,
                                            ) || null;
                                        setEstadoSeleccionado(estado);
                                    }
                                    console.log("Estado seleccionado:", value === "todos" ? null : estados.find((e) => e.nombre === value));
                                }}
                            >
                                <SelectTrigger className="w-full rounded-xl border border-gray-300 bg-[#fffaf0] hover:bg-gray-100 focus:ring-2 focus:ring-green-500">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>

                                <SelectContent className="rounded-xl">
                                    <SelectItem
                                        value="todos"
                                        className="cursor-pointer bg-[#fffaf0] hover:bg-green-100 focus:bg-green-100"
                                    >
                                        Todos
                                    </SelectItem>
                                    {estados.map((e) => (
                                        <SelectItem
                                            key={e.nombre}
                                            value={e.nombre}
                                            className="cursor-pointer bg-[#fffaf0] hover:bg-green-100 focus:bg-green-100"
                                        >
                                            {e.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Estado */}
                            <Select
                                value={
                                    campaniaSeleccionada
                                        ? String(campaniaSeleccionada.id)
                                        : ""
                                }
                                onValueChange={(value: string) => {
                                    if (value === "todos") {
                                        setCampaniaSeleccionada(null);
                                    } else {
                                        const campania =
                                            campanias.find(
                                                (c) => String(c.id) === value,
                                            ) || null;
                                        setCampaniaSeleccionada(campania);
                                    }
                                    console.log("Campaña seleccionada:", value === "todos" ? null : campanias.find((c) => String(c.id) === value));
                                }}
                            >
                                <SelectTrigger className="w-full rounded-xl border border-gray-300 bg-[#fffaf0] hover:bg-gray-100 focus:ring-2 focus:ring-green-500">
                                    <SelectValue placeholder="Campaña" />
                                </SelectTrigger>

                                <SelectContent className="rounded-xl">
                                    <SelectItem
                                        value="todos"
                                        className="cursor-pointer bg-[#fffaf0] hover:bg-green-100 focus:bg-green-100"
                                    >
                                        Todos
                                    </SelectItem>
                                    {campanias.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                            className="cursor-pointer bg-[#fffaf0] hover:bg-green-100 focus:bg-green-100"
                                        >
                                            {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Cultivo */}
                            <Select
                                value={
                                    cultivoSeleccionado
                                        ? String(cultivoSeleccionado.id)
                                        : ""
                                }
                                onValueChange={(value: string) => {
                                    if (value === "todos") {
                                        setCultivoSeleccionado(null);
                                    } else {
                                        const cultivo =
                                            cultivos.find(
                                                (c) => String(c.id) === value,
                                            ) || null;
                                        setCultivoSeleccionado(cultivo);
                                    }
                                    console.log("Cultivo seleccionado:", value === "todos" ? null : cultivos.find((c) => String(c.id) === value));
                                }}
                            >
                                <SelectTrigger className="w-full rounded-xl border border-gray-300 bg-[#fffaf0] hover:bg-gray-100 focus:ring-2 focus:ring-green-500">
                                    <SelectValue placeholder="Cultivo" />
                                </SelectTrigger>

                                <SelectContent className="rounded-xl">
                                    <SelectItem
                                        value="todos"
                                        className="cursor-pointer bg-[#fffaf0] hover:bg-green-100 focus:bg-green-100"
                                    >
                                        Todos
                                    </SelectItem>
                                    {cultivos.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                            className="cursor-pointer bg-[#fffaf0] hover:bg-green-100 focus:bg-green-100"
                                        >
                                            {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl">
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {lotesFiltrados.map((lote) => (
                            <LoteCard
                                key={lote.id}
                                lote={lote}
                                onOpenDetail={() => {
                                    console.log(`Abrir detalle de lote ${lote.id}`);
                                }}
                                onEdit={() => {
                                    console.log(`Editar lote ${lote.id}`);
                                }}
                                onDelete={() => {
                                    console.log(`Eliminar lote ${lote.id}`);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <FormularioLote
                show={showFormulario}
                onClose={() => setShowFormulario(false)}
                campoId={campoSeleccionado ? campoSeleccionado.id : 0}
                onSubmit={handleAgregarLote}
            />
        </Body>
    );
}
