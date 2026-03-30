import { Button } from "@/components/ui/button";
import { Head, router } from "@inertiajs/react";
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
import { LoteDraft, Lote, Campo, CampoDB, Cultivo, Campania, Estado, CampaniaDB, CultivoDB, IdLotesPorIdCampania, IdCultivoPorIdCampania} from "./types";
import ModalConfirmacion from "@/components/ui/ModalConfirmacion";

const mapearLote = (lote: any): Lote => ({
    id: lote.id,
    nombre: lote.nombre,
    caracteristicas: lote.caracteristicas,
    estado: lote.estado,
    latitud: Number(lote.latitud),
    longitud: Number(lote.longitud),
    hectareas: Number(lote.hectareas),
    idCampo: Number(lote.id_campo),
    ph: Number(lote.ph),
    napa: Number(lote.napa),
});

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
    const [loteAEliminar, setLoteAEliminar] = useState<Lote | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [nombreBuscado, setNombreBuscado] = useState("");
    const [campos, setCampos] = useState<Campo[]>([]);
    const [cultivos, setCultivos] = useState<Cultivo[]>([]);
    const [campanias, setCampanias] = useState<Campania[]>([]);
    const [lotesPorCampania, setLotesPorCampania] = useState<IdLotesPorIdCampania[]>([]);
    const [cultivoPorCampania, setCultivoPorCampania] = useState<IdCultivoPorIdCampania[]>([]);

    const estados = [
        { nombre: "produccion" },
        { nombre: "barbecho" },
        { nombre: "preparacion" },
        { nombre: "disponible" },
    ];

    //-------------------------GET LOTES-------------------------
    const GetLotes = useCallback(async () => {
        try {
            const response = await fetch("/api/lotes");
            const data = await response.json();
            setLotes(data.map(mapearLote));
            console.log("Lotes obtenidos:", data);
        } catch (error) {
            console.error("Error fetching lots:", error);
        }
    }, []);

    //-------------------------GET CAMPOS-------------------------
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

    //-------------------------GET CAMPANIAS-------------------------
    const getCampanias = useCallback(async () => {
        try {
            const result_lotes = [];
            const result_cultivos = [];
            const response = await fetch("/api/campanias");
            const data = await response.json();
            setCampanias(
                data.map((campania: CampaniaDB) => ({
                    id: campania.id,
                    nombre: campania.nombre,
                }))
            );

            for (const campania of data) {
                console.log(`Obteniendo lotes para campaña ${campania.id}...`);
                const response_lotes = await fetch(`/api/campanias/${campania.id}/lotes`);
                const data_lotes = await response_lotes.json();
                console.log(`Lotes para campaña ${campania.id}:`, data_lotes);
                result_lotes.push({
                    campaniaId: campania.id,
                    lotesId: data_lotes.map((lote: any) => lote.id),
                });
            }

            for (const campania of data) {
                result_cultivos.push({
                    campaniaId: campania.id,
                    cultivosId: campania.cultivo_id,
                });
            }

            

            console.log("Lotes por campaña:", result_lotes);

            setLotesPorCampania(result_lotes);
            setCultivoPorCampania(result_cultivos);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    }, []);

    //-------------------------GET CULTIVOS-------------------------
    const getCultivos = useCallback(async () => {
        try {
            const response = await fetch("/api/cultivos");
            const data = await response.json();
            setCultivos(
                data.map((cultivo: CultivoDB) => ({
                    id: cultivo.id,
                    nombre: cultivo.tipo,
                }))
            );
        } catch (error) {
            console.error("Error fetching crops:", error);
        }
    }, []);

    useEffect(() => {
        GetLotes();
        getCampos();
        getCampanias();
        getCultivos();
    }, []);

    //-------------------------FILTRADO-------------------------
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
            if (campaniaSeleccionada){
                const loteEnCampania = lotesPorCampania.find(l => l.campaniaId === campaniaSeleccionada.id);
                if (!loteEnCampania || !loteEnCampania.lotesId.includes(lote.id)) {
                    console.log("Excluyendo lote por campaña");
                    return false;
                }
            }
            if (cultivoSeleccionado){
                const idCampania = lotesPorCampania.find(l => l.lotesId.includes(lote.id))?.campaniaId;
                const cultivoEnCampania = cultivoPorCampania.find(c => c.campaniaId === idCampania);
                if (cultivoEnCampania?.cultivosId !== cultivoSeleccionado.id) {
                    console.log("Excluyendo lote por campaña");
                    return false;
                }
            }
            // Para campania y cultivo, no hay propiedades en lote, así que omitir por ahora
            return true;
        });
        console.log("Lotes filtrados:", filtrados.length, "de", lotes.length);
        console.log("Filtrados: ", filtrados);
        setLotesFiltrados(filtrados);
    }, [lotes, campoSeleccionado, estadoSeleccionado, nombreBuscado, campaniaSeleccionada, cultivoSeleccionado]);


    //-------------------------AGREGAR/EDITAR LOTE-------------------------
    const handleAgregarLote = async (
        nuevoLote: LoteDraft,
        campoId: number | string
    ): Promise<boolean> => {

        try {
            const estadoNormalizado = nuevoLote.status
                .toLowerCase()
                .replace(/\s+/g, ""); // elimina TODOS los espacios

            const payload = {
                nombre: nuevoLote.name?.trim() || "",
                caracteristicas: nuevoLote.caracteristicas || "",
                estado: nuevoLote.status.toLowerCase().replace(" ", ""),
                latitud: Number(nuevoLote.latitude) ?? 0,
                longitud: Number(nuevoLote.longitude) ?? 0,
                hectareas: Number(nuevoLote.hectareas) ?? 0,
                id_campo: Number(campoId),
                ph: Number(nuevoLote.ph) || 0,
                napa: Number(nuevoLote.napa) || 0,
            };

            console.log("📤 Enviando payload:", payload);

            //let response, data;

            // -------- EDITAR --------
            if (loteEditando) {
                const response = await fetch(`/api/lotes/${loteEditando.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error("❌ Error backend:", data);
                    throw new Error("No se pudo actualizar el lote.");
                }
                console.log("✅ Lote actualizado:", data);

                setLotes((prev) =>
                    prev.map((l) => (l.id === data.id ? mapearLote(data) : l))
                );

                setShowFormulario(false);
                setLoteEditando(null);
                return true;
            }

            else {
                // -------- CREAR --------
                const response = await fetch(`/api/lotes`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error("❌ Error backend:", data);
                    throw new Error("No se pudo crear el lote.");
                }

                console.log("✅ Lote creado:", data);

                setLotes((prev) => [...prev, mapearLote(data)]);
            }
            //Reset general
            setShowFormulario(false);
            setLoteEditando(null);
            setError(null);

            return true;

        } catch (error) {
            console.error("Error:", error);
            setError("Error al guardar el lote.");
            return false;
        }
    };
    const handleAbrirCreacion = () => {
        setShowFormulario(true);
    };

    //-------------------------ELIMINAR LOTE-------------------------
    const handleEliminarLote = async (id: number) => {
        try {
            const response = await fetch(`/api/lotes/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                console.error("Error backend:", data);
                throw new Error("No se pudo eliminar el lote.");
            }

            console.log("Lote eliminado");
            setLotes((prev) => prev.filter((l) => l.id !== id));
        } catch (error) {
            console.error("Error:", error);
            setError("Error al eliminar el lote.");
        } finally {
            setLoteAEliminar(null);
        }
    };


    const loteToForm = (lote: Lote | null) => {
        if (!lote) return null;

        return {
            id: lote.id,
            name: lote.nombre,
            status: lote.estado,
            latitude: lote.latitud,
            longitude: lote.longitud,
            hectareas: lote.hectareas,
            caracteristicas: lote.caracteristicas,
            ph: lote.ph,
            napa: lote.napa,
            polygon: [],
            id_campo: lote.idCampo,
        };
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

                            {/* Estados */}
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

                            {/* Campania */}
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
                                    router.visit(`/lotes/${lote.id}`);
                                }}
                                onEdit={() => {
                                    setLoteEditando(lote);
                                    setShowFormulario(true);
                                }}
                                onDelete={() => setLoteAEliminar(lote)}
                            />
                        ))}
                    </div>
                </div>
                <FormularioLote
                    show={showFormulario}
                    onClose={() => { setShowFormulario(false); setLoteEditando(null) }}
                    campoId={campoSeleccionado ? campoSeleccionado.id : 0}
                    onSubmit={handleAgregarLote}
                    initialData={loteToForm(loteEditando)}
                />

                <ModalConfirmacion
                    show={loteAEliminar !== null}
                    titulo="Eliminar lote"
                    mensaje={`¿Estás seguro de que querés eliminar el lote "${loteAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
                    onConfirmar={() => loteAEliminar && handleEliminarLote(loteAEliminar.id)}
                    onCancelar={() => setLoteAEliminar(null)}
                />
            </div>

        </Body>
    );
}
