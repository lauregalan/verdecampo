import { ReactNode } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface Stat {
    icon: ReactNode;
    label: string;
    value: string;
}

interface Footer {
    label: string;
    value: string;
    icon?: ReactNode;
}

interface ItemCardProps {
    eyebrow: string;
    title: string;
    subtitle?: string;
    badge?: {
        label: string;
        className: string;
    };
    stats: Stat[];
    footers?: Footer[];
    image?: ReactNode;
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    additionalButtons?: ReactNode;
    className?: string;
}

export default function ItemCard({
    eyebrow,
    title,
    subtitle,
    badge,
    stats,
    footers,
    image,
    onView,
    onEdit,
    onDelete,
    onClick,
    additionalButtons,
    className = "",
}: ItemCardProps) {
    const cardClasses = `group flex h-full flex-col rounded-3xl border border-stone-200/70 bg-[#FCFBF8]/62 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${className}`;

    const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.stopPropagation();
            onClick();
        }
    };

    return (
        <article className={cardClasses} onClick={handleClick}>
            {image && (
                <div className="mb-4 h-48 w-full shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                    {image}
                </div>
            )}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                        {eyebrow}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-xl font-black tracking-tight text-stone-900">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="mt-2 text-sm text-stone-500">
                            {subtitle}
                        </p>
                    )}
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
                {stats.map((stat, index) => (
                    <div key={index} className="rounded-2xl bg-stone-50/80 p-4 ring-1 ring-black/5">
                        <div className="flex items-center gap-2 text-stone-500">
                            {stat.icon}
                            <span className="text-xs font-bold uppercase tracking-wide">
                                {stat.label}
                            </span>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-stone-900">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {footers && footers.map((footer, index) => (
                <div key={index} className="mt-4 rounded-2xl border border-stone-200/80 bg-[#f7f2e9]/78 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                {footer.label}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-stone-900">
                                {footer.value}
                            </div>
                        </div>
                        {footer.icon && footer.icon}
                    </div>
                </div>
            ))}

            {(onView || onEdit || onDelete || additionalButtons) && (
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-stone-200 pt-4">
                    {additionalButtons}
                    {onView && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onView();
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                        >
                            <Eye size={16} />
                            Ver
                        </button>
                    )}
                    {onEdit && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            <Pencil size={16} />
                            Editar
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                            <Trash2 size={16} />
                            Eliminar
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}