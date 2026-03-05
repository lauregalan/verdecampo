import Main from "@/Pages/Frames/Main";
import { Head } from "@inertiajs/react";
import { Eye, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import FormularioCampo from "./FormularioCampo";

export type StatusColor = "verde" | "naranja" | "violeta";

export interface Card {
    name: string;
    surface: string;
    status: string;
    lastCrop: string;
    statusColor: StatusColor;
    imageUrl: string;
}

const camposIniciales: Card[] = [
    {
        name: "La Aurora - Lote 1",
        surface: "80 Ha",
        status: "En Produccion",
        lastCrop: "Maiz",
        statusColor: "verde",
        imageUrl:
            "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400",
    },
    {
        name: "Campo Verde - Lote 2",
        surface: "120 Ha",
        status: "En Preparacion",
        lastCrop: "Trigo",
        statusColor: "naranja",
        imageUrl:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400",
    },
    {
        name: "El Retiro - Lote 3",
        surface: "150 Ha",
        status: "En Barbecho",
        lastCrop: "Girasol",
        statusColor: "violeta",
        imageUrl:
            "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=500",
    },
];

const statusStyles: Record<StatusColor, string> = {
    verde: "bg-green-600 text-white",
    naranja: "bg-orange-400 text-white",
    violeta: "bg-violet-600 text-white",
};

interface FieldCardProps extends Card {
    onDelete: () => void;
}

const FieldCard = ({
    name,
    surface,
    status,
    lastCrop,
    imageUrl,
    statusColor,
    onDelete,
}: FieldCardProps) => {
    return (
        <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-[#fdf8f0] p-6 shadow-sm transition-shadow hover:shadow-md">
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
                <button type="button" className="transition-colors hover:text-blue-600">
                    <Pencil size={20} />
                </button>
                <button type="button" className="transition-colors hover:text-blue-600">
                    <MapPin size={20} />
                </button>
                <button type="button" className="transition-colors hover:text-blue-600">
                    <Eye size={20} />
                </button>
                <button
                    type="button"
                    onClick={onDelete}
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
    const [campos, setCampos] = useState<Card[]>(camposIniciales);
    const [showFormulario, setShowFormulario] = useState(false);

    const handleAgregar = (nuevoCampo: Card) => {
        setCampos((prev) => [...prev, nuevoCampo]);
        setShowFormulario(false);
    };

    const handleEliminar = (index: number) => {
        setCampos((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Main>
            <Head title="Gestion de Campos" />

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

                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {campos.map((campo, index) => (
                        <FieldCard
                            key={`${campo.name}-${index}`}
                            {...campo}
                            onDelete={() => handleEliminar(index)}
                        />
                    ))}
                </div>
            </div>

            <FormularioCampo
                show={showFormulario}
                onClose={() => setShowFormulario(false)}
                onSubmit={handleAgregar}
            />
        </Main>
    );
}
