import { Eye, Pencil, Trash2 } from "lucide-react";

interface CatalogItemCardProps {
    eyebrow: string;
    title: string;
    badge?: {
        label: string;
        className: string;
    };
    stats: Array<{
        label: string;
        value: string;
    }>;
    footer?: {
        label: string;
        value: string;
    };
    note?: string;
    onView: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function CatalogItemCard({
    eyebrow,
    title,
    badge,
    stats,
    footer,
    note,
    onView,
    onEdit,
    onDelete,
}: CatalogItemCardProps) {
    return (
        <article className="group flex h-full flex-col rounded-3xl border border-stone-200/70 bg-[#FCFBF8]/62 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                        {eyebrow}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-xl font-black tracking-tight text-stone-900">
                        {title}
                    </h3>
                </div>
                {badge && (
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${badge.className}`}
                    >
                        {badge.label}
                    </span>
                )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl bg-stone-50/65 p-4 ring-1 ring-black/5"
                    >
                        <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                            {stat.label}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-stone-900">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {footer && (
                <div className="mt-4 rounded-2xl border border-stone-200/70 bg-[#f7f2e9]/62 px-4 py-3 backdrop-blur-sm">
                    <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                        {footer.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-stone-900">
                        {footer.value}
                    </div>
                </div>
            )}

            {note && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600">
                    {note}
                </p>
            )}

            <div className="mt-auto flex items-center justify-end gap-2 border-t border-stone-200 pt-4">
                <button
                    type="button"
                    onClick={onView}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                    <Eye size={16} />
                    Ver
                </button>
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        <Pencil size={16} />
                        Editar
                    </button>
                )}
                {onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                        <Trash2 size={16} />
                        Eliminar
                    </button>
                )}
            </div>
        </article>
    );
}
