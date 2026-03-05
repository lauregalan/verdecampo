import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ScrollArea } from "@/components/ui/scroll-area";
import { router } from "@inertiajs/react";
import { Eye, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import FormularioCampo from "./FormularioCampo";
import { camposIniciales, statusStyles } from "./mockCampos";
import type { CampoCard, CampoDraft } from "./types";

interface FieldCardProps extends CampoCard {
    onOpenDetail: () => void;
    onDelete: () => void;
}

const FieldCard = ({
    id,
    name,
    surface,
    status,
    lastCrop,
    imageUrl,
    statusColor,
    onOpenDetail,
    onDelete,
}: FieldCardProps) => {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onOpenDetail}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenDetail();
                }
            }}
            className="flex h-full cursor-pointer flex-col rounded-2xl border border-stone-200 bg-[#fdf8f0] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={`Abrir detalle de ${name}`}
            data-campo-id={id}
        >
            <h3 className="mb-4 text-xl font-bold text-gray-800">{name}</h3>

            <div className="mb-4 h-32 w-full overflow-hidden rounded-xl">
                <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            </div>

            <div className="flex-grow space-y-3">
                <div>
                    <p className="font-medium text-gray-700">Superficie: {surface}</p>
                    <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[statusColor]}`}
                    >
                        {status}
                    </span>
                </div>

                <p className="pt-2 font-medium text-gray-700">
                    Ultimo Cultivo: <span className="font-normal">{lastCrop}</span>
                </p>
            </div>

            <div className="mt-6 flex justify-end gap-4 text-gray-600">
                <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    className="transition-colors hover:text-blue-600"
                >
                    <Pencil size={20} />
                </button>
                <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    className="transition-colors hover:text-blue-600"
                >
                    <MapPin size={20} />
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpenDetail();
                    }}
                    className="transition-colors hover:text-blue-600"
                    title="Ver detalle"
                >
                    <Eye size={20} />
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete();
                    }}
                    className="transition-colors hover:text-red-600"
                    title="Eliminar campo"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};

export default function Campo() {
    const [campos, setCampos] = useState<CampoCard[]>(camposIniciales);
    const [showFormulario, setShowFormulario] = useState(false);

    const handleAgregar = (nuevoCampo: CampoDraft) => {
        setCampos((prev) => {
            const nextId = prev.length > 0 ? Math.max(...prev.map((campo) => campo.id)) + 1 : 1;
            return [...prev, { id: nextId, ...nuevoCampo }];
        });
        setShowFormulario(false);
    };

    const handleEliminar = (id: number) => {
        setCampos((prev) => prev.filter((campo) => campo.id !== id));
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-full bg-[#f9f4ea] p-8 font-sans">
                <div className="mx-auto mb-10 flex max-w-7xl items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gestion de Campos
                    </h1>
                    <button
                        type="button"
                        onClick={() => setShowFormulario(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#1d4ed8] px-5 py-2 font-medium text-white shadow-md transition-all hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Nuevo Campo
                    </button>
                </div>

                <ScrollArea className="mx-auto h-[60vh] w-full max-w-7xl rounded-xl pr-4 md:h-[68vh]">
                    <div className="grid grid-cols-1 gap-8 pb-4 md:grid-cols-2 lg:grid-cols-3">
                        {campos.map((campo) => (
                            <FieldCard
                                key={campo.id}
                                {...campo}
                                onOpenDetail={() => router.visit(`/campo/${campo.id}`)}
                                onDelete={() => handleEliminar(campo.id)}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <FormularioCampo
                show={showFormulario}
                onClose={() => setShowFormulario(false)}
                onSubmit={handleAgregar}
            />
        </AuthenticatedLayout>
    );
}
