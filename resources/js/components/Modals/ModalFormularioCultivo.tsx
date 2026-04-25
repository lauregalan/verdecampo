import { FormEvent, useState, useEffect } from "react";
import Modal from "@/components/Modals/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";
import { X } from "lucide-react";
import api from "@/lib/api";

interface Cultivo {
    id: number;
    tipo: string;
    variedad: string;
    cultivo_antecesor_id: number | null;
    notas: string | null;
}

interface CultivoForm {
    tipo: string;
    variedad: string;
    cultivo_antecesor_id: number | null;
    notas: string;
}

interface ModalFormularioCultivoProps {
    show: boolean;
    onClose: () => void;
    cultivoEditando: Cultivo | null;
    onSaved: (cultivo: Cultivo) => void;
}

export default function ModalFormularioCultivo({
    show,
    onClose,
    cultivoEditando,
    onSaved,
}: ModalFormularioCultivoProps) {
    const [formulario, setFormulario] = useState<CultivoForm>({
        tipo: "",
        variedad: "",
        cultivo_antecesor_id: null,
        notas: "",
    });

    useEffect(() => {
        if (show && cultivoEditando) {
            setFormulario({
                tipo: cultivoEditando.tipo,
                variedad: cultivoEditando.variedad,
                cultivo_antecesor_id: cultivoEditando.cultivo_antecesor_id,
                notas: cultivoEditando.notas || "",
            });
        } else if (show && !cultivoEditando) {
            setFormulario({ tipo: "", variedad: "", cultivo_antecesor_id: null, notas: "" });
        }
    }, [show, cultivoEditando]);

    const handleClose = () => {
        setFormulario({ tipo: "", variedad: "", cultivo_antecesor_id: null, notas: "" });
        onClose();
    };

    const handleGuardar = async (e: FormEvent) => {
        e.preventDefault();
        const payload = {
            tipo: formulario.tipo.trim(),
            variedad: formulario.variedad.trim(),
            cultivo_antecesor_id: formulario.cultivo_antecesor_id,
            notas: formulario.notas.trim() || null,
        };

        if (cultivoEditando) {
            const response = await api.put(`/api/cultivos/${cultivoEditando.id}`, payload);
            if (!response.ok) throw new Error("No se pudo actualizar el cultivo");
            const data = await response.json();
            onSaved(data);
        } else {
            const response = await api.post("/api/cultivos", payload);
            if (!response.ok) throw new Error("No se pudo crear el cultivo");
            const data = await response.json();
            onSaved(data);
        }

        handleClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <div className="flex max-h-[90vh] flex-col bg-white rounded-2xl">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {cultivoEditando ? "Editar cultivo" : "Registrar nuevo cultivo"}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleGuardar}
                    className="flex-1 overflow-y-auto px-6 pb-6 space-y-5"
                >
                    <div>
                        <InputLabel value="Tipo *" />
                        <TextInput
                            value={formulario.tipo}
                            onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
                            placeholder="Ej: Soja, Maíz, Trigo"
                            className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                            required
                        />
                    </div>
                    <div>
                        <InputLabel value="Variedad *" />
                        <TextInput
                            value={formulario.variedad}
                            onChange={(e) => setFormulario({ ...formulario, variedad: e.target.value })}
                            placeholder="Ej: RR, Convencional"
                            className="mt-1 w-full border-green-700 focus:border-green-800 focus:ring-green-800"
                            required
                        />
                    </div>
                    <div>
                        <InputLabel value="Notas" />
                        <textarea
                            value={formulario.notas}
                            onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                            placeholder="Observaciones adicionales..."
                            className="mt-1 w-full rounded-md border-green-700 shadow-sm focus:border-green-800 focus:ring-green-800"
                            rows={4}
                        />
                    </div>
                </form>

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
                        {cultivoEditando ? "Guardar cambios" : "Registrar"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
