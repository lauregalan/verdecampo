import React, { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";
import { Target, SproutIcon, TrendingUp } from "lucide-react";
import api from "@/lib/api";

interface CampoSummary {
    id: number;
    nombre: string;
    latitud: string;
    longitud: string;
    hectareas: number;
}

interface CampaniaSummary {
    id: number;
    nombre: string;
    cultivo_id: number;
    campo_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
}

interface CultivoSummary {
    id: number;
    tipo: string;
    variedad: string;
}

interface SiembraSummary {
    id: number;
    campania_id: number;
    lote_id: number;
    cultivo_id: number;
    fecha_siembra: string;
    observaciones: string | null;
    cultivo: CultivoSummary;
    campania: CampaniaSummary;
}

interface LoteSummary {
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
    siembras?: SiembraSummary[];
}

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

export const ProductoSumary: React.FC = () => {
    const [campos, setCampos] = useState<CampoSummary[]>([]);
    const [lotes, setLotes] = useState<LoteSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);

            try {
                const [camposResponse, lotesResponse] = await Promise.all([
                    api.get("/api/campos"),
                    api.get("/api/lotes"),
                ]);

                if (!camposResponse.ok || !lotesResponse.ok) {
                    throw new Error("Error al cargar estadisticas");
                }

                const camposData = asArray<CampoSummary>(
                    await camposResponse.json(),
                );
                const lotesData = asArray<LoteSummary>(
                    await lotesResponse.json(),
                );

                setCampos(camposData);
                setLotes(lotesData);
                setError(null);
            } catch {
                setCampos([]);
                setLotes([]);
                setError("No se pudieron cargar las estadisticas.");
            } finally {
                setLoading(false);
            }
        };

        void cargarDatos();
    }, []);

    const totalCampoHa = useMemo(
        () => campos.reduce((sum, campo) => sum + Number(campo.hectareas), 0),
        [campos],
    );

    const totalLoteHa = useMemo(
        () => lotes.reduce((sum, lote) => sum + Number(lote.hectareas), 0),
        [lotes],
    );

    const surfaceData = useMemo(() => {
        const estadoMap = new Map<string, number>();

        lotes.forEach((lote) => {
            const estado = lote.estado || "Desconocido";

            estadoMap.set(
                estado,
                (estadoMap.get(estado) ?? 0) + Number(lote.hectareas),
            );
        });

        const palette: Record<string, string> = {
            produccion: "#166534",
            barbecho: "#a8a29e",
            preparacion: "#ca8a04",
            disponible: "#16a34a",
            Desconocido: "#64748b",
        };

        return Array.from(estadoMap.entries()).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: palette[name] ?? "#94a3b8",
        }));
    }, [lotes]);

    const cropData = useMemo(() => {
        const cultivoMap = new Map<string, { name: string; ha: number }>();

        lotes.forEach((lote) => {
            const siembrasEnCurso = (lote.siembras ?? []).filter(
                (siembra) =>
                    siembra.campania?.estado?.toLowerCase() === "en curso",
            );

            if (siembrasEnCurso.length === 0) {
                return;
            }

            const siembraReciente = siembrasEnCurso.sort(
                (a, b) =>
                    new Date(b.fecha_siembra).getTime() -
                    new Date(a.fecha_siembra).getTime(),
            )[0];

            const cultivoNombre = `${siembraReciente.cultivo.tipo} ${siembraReciente.cultivo.variedad}`;

            cultivoMap.set(cultivoNombre, {
                name: cultivoNombre,
                ha:
                    (cultivoMap.get(cultivoNombre)?.ha ?? 0) +
                    Number(lote.hectareas),
            });
        });

        return Array.from(cultivoMap.values())
            .sort((a, b) => b.ha - a.ha)
            .slice(0, 5);
    }, [lotes]);

    const healthScore = useMemo(() => {
        if (totalLoteHa === 0) {
            return null;
        }

        const estadoScore: Record<string, number> = {
            produccion: 1,
            disponible: 0.7,
            preparacion: 0.5,
            barbecho: 0.25,
        };

        const weightedHa = lotes.reduce((sum, lote) => {
            const peso = estadoScore[lote.estado] ?? 0.4;
            return sum + Number(lote.hectareas) * peso;
        }, 0);

        return Math.round((weightedHa / totalLoteHa) * 100) / 10;
    }, [lotes, totalLoteHa]);

    const healthLabel =
        healthScore === null
            ? "Sin datos"
            : healthScore >= 8
              ? "Excelente"
              : healthScore >= 6
                ? "Bueno"
                : healthScore >= 4
                  ? "Regular"
                  : "Bajo";

    const healthDescription =
        totalLoteHa === 0
            ? "No hay lotes cargados para calcular este indice."
            : "Indice ponderado por superficie y estado operativo de los lotes.";

    if (loading) {
        return (
            <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-stone-500">Cargando estadisticas...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 rounded-xl border border-stone-100 bg-stone-50 p-6 shadow-sm md:grid-cols-3">
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-3">
                    {error}
                </div>
            )}

            <div className="flex h-full min-h-[28rem] flex-col rounded-lg border border-stone-100 bg-white p-5 shadow-inner">
                <div className="mb-3 flex items-center gap-2">
                    <Target className="size-5 text-emerald-700" />
                    <h3 className="text-lg font-semibold text-stone-900">
                        Superficie por estado
                    </h3>
                </div>

                <div className="relative h-72 w-full">
                    {surfaceData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={surfaceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {surfaceData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke="none"
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-stone-950">
                                    {totalLoteHa.toLocaleString("es-AR")}
                                </span>
                                <span className="text-sm font-medium text-stone-500">
                                    Ha en lotes
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center text-sm text-stone-500">
                            No hay lotes con superficie para graficar.
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-600">
                    {surfaceData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span>
                                {item.name}: {item.value.toLocaleString("es-AR")} Ha
                            </span>
                        </div>
                    ))}
                </div>

                <p className="mt-3 text-xs text-stone-500">
                    Superficie total declarada en campos:{" "}
                    {totalCampoHa.toLocaleString("es-AR")} Ha.
                </p>
            </div>

            <div className="flex h-full min-h-[28rem] flex-col rounded-lg border border-stone-100 bg-white p-5 shadow-inner">
                <div className="mb-5 flex items-center gap-2">
                    <SproutIcon className="size-5 text-emerald-700" />
                    <h3 className="text-lg font-semibold text-stone-900">
                        Cultivos en campaña
                    </h3>
                </div>
                <div className="h-72 flex-1">
                    {cropData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={cropData}
                                layout="vertical"
                                margin={{ top: 10, right: 24, left: 10, bottom: 10 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs font-medium text-stone-700"
                                />
                                <Tooltip
                                    cursor={{ fill: "transparent" }}
                                    contentStyle={{
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "8px",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    }}
                                />
                                <Bar
                                    dataKey="ha"
                                    fill="#166534"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-stone-500">
                            No hay cultivos activos en campañas en curso.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex h-full min-h-[28rem] flex-col items-center justify-center rounded-lg border border-stone-100 bg-white p-5 text-center shadow-inner">
                <div className="w-full">
                    <div className="mb-5 flex items-center justify-center gap-2">
                        <TrendingUp className="size-5 text-emerald-700" />
                        <h3 className="text-lg font-semibold text-stone-900">
                            Salud de los lotes
                        </h3>
                    </div>
                    <div className="flex flex-col items-center gap-1 py-4">
                        <span className="text-6xl font-extrabold text-emerald-800">
                            {healthScore !== null ? healthScore.toFixed(1) : "—"}
                            <span className="text-3xl text-stone-300">/10</span>
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                            {healthLabel}
                        </span>
                    </div>
                </div>
                <p className="px-4 text-xs text-stone-500">{healthDescription}</p>
            </div>
        </div>
    );
};
