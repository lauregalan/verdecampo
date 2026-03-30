import { Head } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
import { useState, useCallback, useEffect, FormEvent } from "react";
import api from "@/lib/api";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import ModalConfirmacion from "@/components/ui/ModalConfirmacion";
import Modal from "@/components/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";

interface Cultivo {
    id: number;
    tipo: string;
    variedad: string;
    cultivo_antecesor_id: number | null;
    notas: string | null;
    created_at?: string;
    updated_at?: string;
}

interface CultivoForm {
    tipo: string;
    variedad: string;
    cultivo_antecesor_id: number | null;
    notas: string;
}

export default function Cultivos() {
    const [cultivos, setcultivos] = useState<Cultivo[]>([]);
    const [cultivosFiltrados, setcultivosFiltrados] = useState<Cultivo[]>([]);
    const [showFormulario, setShowFormulario] = useState(false);
    const [cultivoEditando, setcultivoEditando] = useState<Cultivo | null>(
        null,
    );
    const [cultivoAEliminar, setcultivoAEliminar] = useState<Cultivo | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [formulario, setFormulario] = useState<CultivoForm>({
        tipo: "",
        variedad: "",
        cultivo_antecesor_id: null,
        notas: "",
    });

    // -------------------------GET CULTIVOS-------------------------
    const getcultivos = useCallback(async () => {
        try {
            const response = await api.get("/api/cultivos");
            const data = await response.json();
            setcultivos(data);
            console.log("Cultivos obtenidos:", data);
        } catch (error) {
            console.error("Error fetching cultivos:", error);
            setError("Error al cargar los cultivos");
        }
    }, []);

    useEffect(() => {
        getcultivos();
    }, [getcultivos]);

    // -------------------------FILTRADO-------------------------
    useEffect(() => {
        const filtrados = cultivos.filter((cultivo) => {
            if (busqueda) {
                const busquedaLower = busqueda.toLowerCase();
                return (
                    cultivo.tipo.toLowerCase().includes(busquedaLower) ||
                    cultivo.variedad.toLowerCase().includes(busquedaLower)
                );
            }
            return true;
        });
        setcultivosFiltrados(filtrados);
    }, [cultivos, busqueda]);

    // -------------------------AGREGAR/EDITAR CULTIVO-------------------------
    const handleAbrirFormulario = (cultivo?: Cultivo) => {
        if (cultivo) {
            setcultivoEditando(cultivo);
            setFormulario({
                tipo: cultivo.tipo,
                variedad: cultivo.variedad,
                cultivo_antecesor_id: cultivo.cultivo_antecesor_id,
                notas: cultivo.notas || "",
            });
        } else {
            setcultivoEditando(null);
            setFormulario({
                tipo: "",
                variedad: "",
                cultivo_antecesor_id: null,
                notas: "",
            });
        }
        setShowFormulario(true);
    };

    const handleClose = () => {
        setShowFormulario(false);
        setcultivoEditando(null);
        setFormulario({
            tipo: "",
            variedad: "",
            cultivo_antecesor_id: null,
            notas: "",
        });
    };

    const handleGuardar = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                tipo: formulario.tipo.trim(),
                variedad: formulario.variedad.trim(),
                cultivo_antecesor_id: formulario.cultivo_antecesor_id,
                notas: formulario.notas.trim() || null,
            };

            if (cultivoEditando) {
                // Editar
                const response = await api.put(
                    `/api/cultivos/${cultivoEditando.id}`,
                    payload,
                );

                if (!response.ok) {
                    throw new Error("No se pudo actualizar el cultivo");
                }

                const data = await response.json();
                setcultivos((prev) =>
                    prev.map((c) => (c.id === data.id ? data : c)),
                );
            } else {
                // Crear
                const response = await api.post("/api/cultivos", payload);

                if (!response.ok) {
                    throw new Error("No se pudo crear el cultivo");
                }

                const data = await response.json();
                setcultivos((prev) => [...prev, data]);
            }

            handleClose();
            setError(null);
        } catch (error) {
            console.error("Error:", error);
            setError("Error al guardar el cultivo");
        }
    };

    // -------------------------ELIMINAR CULTIVO-------------------------
    const handleEliminarCultivo = async () => {
        if (!cultivoAEliminar) return;

        try {
            const response = await api.delete(
                `/api/cultivos/${cultivoAEliminar.id}`,
            );

            if (!response.ok) {
                throw new Error("No se pudo eliminar el cultivo");
            }

            setcultivos((prev) =>
                prev.filter((c) => c.id !== cultivoAEliminar.id),
            );
            setcultivoAEliminar(null);
        } catch (error) {
            console.error("Error:", error);
            setError("Error al eliminar el cultivo");
        }
    };

    return (
        <Body>
            <Head title="Gestión de Cultivos" />
            <div className="min-h-full p-8 font-sans">
                {/* Header */}
                <div className="mx-auto mb-8 flex w-full max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
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

                {/* Error Message */}
                {error && (
                    <div className="mx-auto max-w-7xl mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Búsqueda */}
                <div className="mx-auto max-w-7xl mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por tipo o variedad..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    />
                </div>

                {/* Lista de Cultivos */}
                <div className="mx-auto max-w-7xl">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Variedad
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Notas
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {cultivosFiltrados.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-8 text-center text-gray-500"
                                            >
                                                {busqueda
                                                    ? "No se encontraron cultivos"
                                                    : "No hay cultivos registrados"}
                                            </td>
                                        </tr>
                                    ) : (
                                        cultivosFiltrados.map((cultivo) => (
                                            <tr
                                                key={cultivo.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {cultivo.tipo}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {cultivo.variedad}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {cultivo.notas ? (
                                                        <span className="line-clamp-2">
                                                            {cultivo.notas}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">
                                                            Sin notas
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleAbrirFormulario(
                                                                    cultivo,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Edit2 size={14} />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setcultivoAEliminar(
                                                                    cultivo,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal de Formulario */}
                <Modal
                    show={showFormulario}
                    onClose={handleClose}
                    maxWidth="lg"
                >
                    <div className="flex max-h-[90vh] flex-col bg-white rounded-2xl">
                        {/* HEADER */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-3">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {cultivoEditando
                                    ? "Editar cultivo"
                                    : "Registrar nuevo cultivo"}
                            </h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* CONTENIDO */}
                        <form
                            onSubmit={handleGuardar}
                            className="flex-1 overflow-y-auto px-6 pb-6 space-y-5"
                        >
                            {/* Tipo */}
                            <div>
                                <InputLabel value="Tipo *" />
                                <TextInput
                                    value={formulario.tipo}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            tipo: e.target.value,
                                        })
                                    }
                                    placeholder="Ej: Soja, Maíz, Trigo"
                                    className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                                    required
                                />
                            </div>

                            {/* Variedad */}
                            <div>
                                <InputLabel value="Variedad *" />
                                <TextInput
                                    value={formulario.variedad}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            variedad: e.target.value,
                                        })
                                    }
                                    placeholder="Ej: RR, Convencional"
                                    className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                                    required
                                />
                            </div>

                            {/* Notas */}
                            <div>
                                <InputLabel value="Notas" />
                                <textarea
                                    value={formulario.notas}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            notas: e.target.value,
                                        })
                                    }
                                    placeholder="Observaciones adicionales..."
                                    className="mt-1 w-full rounded-md border-green-700 shadow-sm focus:border-green-800 focus:ring-green-800"
                                    rows={4}
                                />
                            </div>
                        </form>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-3 px-6 pb-5 pt-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="border border-green-700 px-5 py-2 rounded-lg text-green-700 hover:bg-green-50 transition"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                onClick={handleGuardar}
                                className="bg-green-700 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-800 hover:shadow-lg transition-all"
                            >
                                {cultivoEditando
                                    ? "Guardar cambios"
                                    : "Registrar"}
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Modal de Confirmación de Eliminación */}
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
