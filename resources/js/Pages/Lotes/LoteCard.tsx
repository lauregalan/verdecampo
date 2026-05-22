import ItemCard from "@/components/ui/ItemCard";
import { Lote } from "./types";
import {
    CheckCircle2,
    Clock3,
    Maximize2,
    Sprout,
    Tractor,
} from "lucide-react";

interface LoteCardProps {
    lote: Lote;
    fieldName: string;
    onOpenDetail: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isProductor: boolean;
}

const statusTone: Record<string, string> = {
    produccion: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    barbecho: "bg-rose-100 text-rose-700 ring-rose-200",
    preparacion: "bg-amber-100 text-amber-700 ring-amber-200",
    disponible: "bg-sky-100 text-sky-700 ring-sky-200",
};

const statusLabel: Record<string, string> = {
    produccion: "Produccion",
    barbecho: "Barbecho",
    preparacion: "Preparacion",
    disponible: "Disponible",
};

export default function LoteCard({
    lote,
    fieldName,
    onOpenDetail,
    onEdit,
    onDelete,
    isProductor,
}: LoteCardProps) {
    const renderImage = () => {
        switch (lote.estado) {
            case "produccion":
                return (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f7a48,#6ecf8b)]">
                        <Sprout
                            size={50}
                            className="text-white/90"
                            aria-hidden="true"
                        />
                    </div>
                );
            case "barbecho":
                return (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#9f3c2e,#d78d69)]">
                        <Clock3
                            size={50}
                            className="text-white/90"
                            aria-hidden="true"
                        />
                    </div>
                );
            case "preparacion":
                return (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#af6b13,#f2c165)]">
                        <Tractor
                            size={50}
                            className="text-white/90"
                            aria-hidden="true"
                        />
                    </div>
                );
            case "disponible":
                return (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#2563eb,#7dd3fc)]">
                        <CheckCircle2
                            size={50}
                            className="text-white/90"
                            aria-hidden="true"
                        />
                    </div>
                );
            default:
                return <div className="h-full w-full bg-stone-300" />;
        }
    };

    const getCultivoActual = () => {
        const siembrasEnCurso =
            [...(lote.siembras ?? [])].filter(
                (siembra) =>
                    siembra.campania?.estado?.toLowerCase() === "en curso",
            ) ?? [];

        if (siembrasEnCurso.length === 0) {
            return "Sin siembras";
        }

        const siembraReciente = siembrasEnCurso.sort(
            (a, b) =>
                new Date(b.fecha_siembra).getTime() -
                new Date(a.fecha_siembra).getTime(),
        )[0];

        return siembraReciente.cultivo?.tipo || "Sin siembras";
    };

    return (
        <ItemCard
            eyebrow="Lote"
            title={lote.nombre}
            subtitle={`Campo: ${fieldName}`}
            badge={{
                label: statusLabel[lote.estado] ?? lote.estado,
                className:
                    statusTone[lote.estado] ??
                    "bg-stone-100 text-stone-700 ring-stone-200",
            }}
            stats={[
                {
                    icon: <Maximize2 size={16} />,
                    label: "Superficie",
                    value: `${lote.hectareas} Ha`,
                },
                {
                    icon: <Sprout size={16} />,
                    label: "Cultivo",
                    value: getCultivoActual(),
                },
            ]}
            image={renderImage()}
            onClick={onOpenDetail}
            onView={onOpenDetail}
            onEdit={isProductor ? onEdit : undefined}
            onDelete={isProductor ? onDelete : undefined}
        />
    );
}
