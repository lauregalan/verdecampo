import Body from "@/components/ui/Tabs/Body";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    CalendarDays,
    GroupIcon,
    LayoutDashboard,
    Sprout,
    Target,
    TrendingUp,
} from "lucide-react";

type StatusItem = {
    label: string;
    count: number;
};

type CampaignHighlight = {
    id: number;
    nombre: string;
    estado: string;
    campo_nombre: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    lotes_count: number;
};

type PendingUser = {
    id: number;
    name: string;
    email: string;
    active: boolean;
    roles: string[];
    created_at: string | null;
    reason: string;
};

type DashboardProps = {
    summary: {
        campos_count: number;
        lotes_count: number;
        cultivos_count: number;
        active_campaigns_count: number;
        pending_users_count: number;
        surface_hectares: number;
    };
    campaign_status: StatusItem[];
    lote_status: StatusItem[];
    campaign_highlights: CampaignHighlight[];
    pending_users: PendingUser[];
    is_productor: boolean;
};

const formatDate = (value: string | null) => {
    if (!value) return "Sin fecha";

    return new Date(value).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const statusTone: Record<string, string> = {
    "En Curso": "bg-emerald-100 text-emerald-800",
    Planificada: "bg-amber-100 text-amber-800",
    Finalizada: "bg-slate-200 text-slate-700",
    Cancelada: "bg-rose-100 text-rose-700",
};

const panelTone: Record<string, string> = {
    Planificada: "bg-amber-500",
    "En Curso": "bg-emerald-600",
    Finalizada: "bg-slate-500",
    Cancelada: "bg-rose-500",
    Produccion: "bg-emerald-600",
    Barbecho: "bg-stone-500",
    Preparacion: "bg-sky-600",
};

const maxCount = (items: StatusItem[]) =>
    items.reduce((max, item) => Math.max(max, item.count), 0) || 1;

export default function Dashboard({
    summary,
    campaign_status,
    lote_status,
    campaign_highlights,
    pending_users,
    is_productor,
}: DashboardProps) {
    const authUser = usePage().props.auth?.user as
        | { name?: string; roles?: string[] }
        | undefined;

    const roleLabel =
        Array.isArray(authUser?.roles) && authUser.roles.length > 0
            ? authUser.roles.join(", ")
            : "Sin rol asignado";

    const quickActions = [
        { href: "/campo", label: "Ver campos" },
        { href: "/campanias", label: "Ver campañas" },
        ...(is_productor
            ? [{ href: "/usuarios", label: "Gestionar usuarios" }]
            : []),
    ];

    const campaignStatusMax = maxCount(campaign_status);
    const loteStatusMax = maxCount(lote_status);

    return (
        <Body>
            <Head title="Dashboard" />

            <div className="min-h-full p-6 md:p-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <section className="overflow-hidden rounded-[28px] border border-black/5 bg-[#0f2e1e] text-white shadow-xl">
                        <div className="grid gap-6 p-6 md:grid-cols-[1.6fr_1fr] md:p-8">
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-100">
                                    <LayoutDashboard size={14} />
                                    Panel general
                                </div>

                                <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white md:text-4xl">
                                    Hola
                                    {authUser?.name ? `, ${authUser.name}` : ""}
                                    . Este es el estado general de Verdecampo.
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm text-green-100/85 md:text-base">
                                    Tenes {summary.campos_count} campos,{" "}
                                    {summary.lotes_count} lotes y{" "}
                                    {summary.active_campaigns_count} campanias
                                    en curso.
                                    {is_productor
                                        ? ` Ademas, hay ${summary.pending_users_count} usuarios pendientes de revision.`
                                        : ` Tu rol actual es ${roleLabel}.`}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    {quickActions.map((action) => (
                                        <Link
                                            key={action.href}
                                            href={action.href}
                                            className="rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-[#0f2e1e] transition hover:bg-green-50"
                                        >
                                            {action.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                                <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-green-100/70">
                                        Superficie cargada
                                    </div>
                                    <div className="mt-2 text-4xl font-black text-white">
                                        {summary.surface_hectares.toLocaleString(
                                            "es-AR",
                                            {
                                                maximumFractionDigits: 1,
                                            },
                                        )}
                                    </div>
                                    <div className="mt-1 text-sm text-green-100/80">
                                        Hectareas entre todos los campos
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-white/5 p-5">
                                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-green-100/70">
                                        Cultivos registrados
                                    </div>
                                    <div className="mt-2 text-4xl font-black text-white">
                                        {summary.cultivos_count}
                                    </div>
                                    <div className="mt-1 text-sm text-green-100/80">
                                        Base para seguimiento y reportes
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: "Campos",
                                value: summary.campos_count,
                                detail: "Unidades productivas cargadas",
                                icon: (
                                    <Sprout
                                        size={18}
                                        className="text-emerald-700"
                                    />
                                ),
                            },
                            {
                                label: "Lotes",
                                value: summary.lotes_count,
                                detail: "Sectores operativos registrados",
                                icon: (
                                    <Target
                                        size={18}
                                        className="text-emerald-700"
                                    />
                                ),
                            },
                            {
                                label: "Campañas activas",
                                value: summary.active_campaigns_count,
                                detail: "Campañas en estado En Curso",
                                icon: (
                                    <CalendarDays
                                        size={18}
                                        className="text-emerald-700"
                                    />
                                ),
                            },
                            {
                                label: "Pendientes",
                                value: is_productor
                                    ? summary.pending_users_count
                                    : summary.cultivos_count,
                                detail: is_productor
                                    ? "Usuarios sin activar o sin rol"
                                    : "Cultivos disponibles para seguimiento",
                                icon: is_productor ? (
                                    <GroupIcon
                                        size={18}
                                        className="text-emerald-700"
                                    />
                                ) : (
                                    <TrendingUp
                                        size={18}
                                        className="text-emerald-700"
                                    />
                                ),
                            },
                        ].map((card) => (
                            <article
                                key={card.label}
                                className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-stone-500">
                                        {card.label}
                                    </div>
                                    <div className="rounded-2xl bg-emerald-50 p-2">
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="mt-4 text-4xl font-black tracking-tight text-stone-900">
                                    {card.value}
                                </div>
                                <p className="mt-2 text-sm text-stone-500">
                                    {card.detail}
                                </p>
                            </article>
                        ))}
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                        <article className="rounded-[26px] border border-black/5 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-stone-900">
                                        Campañas activas y planificadas
                                    </h2>
                                    <p className="text-sm text-stone-500">
                                        Lo mas importante para seguir durante
                                        esta etapa.
                                    </p>
                                </div>
                                <Link
                                    href="/campanias"
                                    className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                                >
                                    Ver todas
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {campaign_highlights.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
                                        Todavia no hay campañas activas ni
                                        planificadas.
                                    </div>
                                ) : (
                                    campaign_highlights.map((campaign) => (
                                        <div
                                            key={campaign.id}
                                            className="grid gap-3 rounded-3xl border border-stone-100 bg-stone-50/80 p-4 md:grid-cols-[1.4fr_auto]"
                                        >
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-bold text-stone-900">
                                                        {campaign.nombre}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[campaign.estado] ?? "bg-stone-200 text-stone-700"}`}
                                                    >
                                                        {campaign.estado}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-stone-600">
                                                    Campo:{" "}
                                                    <span className="font-semibold text-stone-800">
                                                        {campaign.campo_nombre}
                                                    </span>
                                                </p>
                                                <p className="mt-1 text-sm text-stone-500">
                                                    Inicio{" "}
                                                    {formatDate(
                                                        campaign.fecha_inicio,
                                                    )}{" "}
                                                    | Fin{" "}
                                                    {formatDate(
                                                        campaign.fecha_fin,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex items-center">
                                                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm ring-1 ring-black/5">
                                                    <div className="text-2xl font-black text-stone-900">
                                                        {campaign.lotes_count}
                                                    </div>
                                                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                                                        lotes
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </article>

                        <article className="rounded-[26px] border border-black/5 bg-white p-6 shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-2xl font-black tracking-tight text-stone-900">
                                    {is_productor
                                        ? "Pendientes de usuarios"
                                        : "Resumen del equipo"}
                                </h2>
                                <p className="text-sm text-stone-500">
                                    {is_productor
                                        ? "Cuentas que todavia requieren revision, activacion o rol."
                                        : `Actualmente ingresaste con el rol ${roleLabel}.`}
                                </p>
                            </div>

                            {is_productor ? (
                                <div className="space-y-3">
                                    {pending_users.length === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
                                            No hay usuarios pendientes. Buen
                                            trabajo.
                                        </div>
                                    ) : (
                                        pending_users.map((pendingUser) => (
                                            <div
                                                key={pendingUser.id}
                                                className="rounded-3xl border border-stone-100 bg-stone-50/80 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="text-base font-bold text-stone-900">
                                                            {pendingUser.name}
                                                        </div>
                                                        <div className="text-sm text-stone-500">
                                                            {pendingUser.email}
                                                        </div>
                                                    </div>
                                                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                                                        {pendingUser.active
                                                            ? "Sin rol"
                                                            : "Pendiente"}
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                                                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-stone-700 ring-1 ring-black/5">
                                                        {pendingUser.reason}
                                                    </span>
                                                    <span>
                                                        Registrado el{" "}
                                                        {formatDate(
                                                            pendingUser.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <Link
                                        href="/usuarios"
                                        className="inline-flex rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                                    >
                                        Ir a gestion de usuarios
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-3xl border border-stone-100 bg-stone-50/80 p-4">
                                        <div className="text-sm font-semibold text-stone-500">
                                            Acceso actual
                                        </div>
                                        <div className="mt-2 text-xl font-black text-stone-900">
                                            {roleLabel}
                                        </div>
                                        <p className="mt-2 text-sm text-stone-500">
                                            Usa este panel para ubicar rapido
                                            campañas, campos y el estado general
                                            de la operacion.
                                        </p>
                                    </div>

                                    <div className="rounded-3xl border border-stone-100 bg-[#edf6ef] p-4">
                                        <div className="text-sm font-semibold text-emerald-800">
                                            Proximo paso recomendado
                                        </div>
                                        <p className="mt-2 text-sm text-emerald-900">
                                            Revisa los campos y las campañas
                                            activas para mantener al dia la
                                            informacion del lote y del cultivo.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </article>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                        <article className="rounded-[26px] border border-black/5 bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-2xl font-black tracking-tight text-stone-900">
                                    Estado de campañas
                                </h2>
                                <p className="text-sm text-stone-500">
                                    Distribucion por etapa para ver rapido la
                                    carga de trabajo.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {campaign_status.map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="font-semibold text-stone-700">
                                                {item.label}
                                            </span>
                                            <span className="font-bold text-stone-900">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                                            <div
                                                className={`h-full rounded-full ${panelTone[item.label] ?? "bg-stone-500"}`}
                                                style={{
                                                    width: `${(item.count / campaignStatusMax) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-[26px] border border-black/5 bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-2xl font-black tracking-tight text-stone-900">
                                    Estado de lotes
                                </h2>
                                <p className="text-sm text-stone-500">
                                    Lectura rapida de la situacion operativa
                                    actual.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {lote_status.map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="font-semibold text-stone-700">
                                                {item.label}
                                            </span>
                                            <span className="font-bold text-stone-900">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                                            <div
                                                className={`h-full rounded-full ${panelTone[item.label] ?? "bg-stone-500"}`}
                                                style={{
                                                    width: `${(item.count / loteStatusMax) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>
                </div>
            </div>
        </Body>
    );
}
