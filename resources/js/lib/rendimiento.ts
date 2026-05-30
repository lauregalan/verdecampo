type ClimaPronostico = {
    temperatura_max: number[];
    temperatura_min: number[];
    precipitacion: number[];
    codigo_clima?: number[];
    fechas?: string[];
};

type CultivoReferencia = {
    id?: number;
    tipo?: string;
    variedad?: string;
};

type CampaniaReferencia = {
    estado?: string;
};

type SiembraReferencia = {
    fecha_siembra: string;
    cultivo?: CultivoReferencia;
    campania?: CampaniaReferencia;
};

type LoteRendimientoInput = {
    hectareas: number;
    ph: number;
    napa: number;
    caracteristicas?: string;
    estado?: string;
    siembras?: SiembraReferencia[];
};

export type RendimientoLoteEstimado = {
    kg_por_hectarea: number;
    kg_total: number;
    confianza: number;
    progreso: number | null;
    cultivo_referencia: string;
    factor_ph: number;
    factor_napa: number;
    factor_caracteristicas: number;
    factor_clima: number;
    factor_estado: number;
    factor_desarrollo: number;
};

export type RendimientoCampoEstimado = {
    kg_por_hectarea: number;
    kg_total: number;
    promedio_kg_ha: number;
    confianza: number;
    lotes_estimados: number;
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

const normalizeText = (value?: string | null) =>
    (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const average = (values: number[]) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const sum = (values: number[]) =>
    values.reduce((total, value) => total + value, 0);

export const getCultivoProfile = (tipo?: string) => {
    const cultivo = normalizeText(tipo);

    if (cultivo.includes("maiz")) {
        return { baseYield: 7800, cycleDays: 155, label: "Maiz" };
    }
    if (cultivo.includes("trigo")) {
        return { baseYield: 4200, cycleDays: 145, label: "Trigo" };
    }
    if (cultivo.includes("girasol")) {
        return { baseYield: 2500, cycleDays: 130, label: "Girasol" };
    }
    if (cultivo.includes("cebada")) {
        return { baseYield: 3900, cycleDays: 140, label: "Cebada" };
    }
    if (cultivo.includes("sorgo")) {
        return { baseYield: 5200, cycleDays: 145, label: "Sorgo" };
    }
    if (cultivo.includes("soja")) {
        return { baseYield: 3200, cycleDays: 125, label: "Soja" };
    }

    return { baseYield: 3000, cycleDays: 120, label: "Cultivo mixto" };
};

export const getSiembraActiva = (siembras: SiembraReferencia[] = []) => {
    const siembrasEnCurso = siembras
        .filter(
            (siembra) =>
                normalizeText(siembra.campania?.estado) === "en curso",
        )
        .sort(
            (a, b) =>
                new Date(b.fecha_siembra).getTime() -
                new Date(a.fecha_siembra).getTime(),
        );

    return siembrasEnCurso[0] ?? null;
};

const getFactorPh = (ph: number) => {
    if (!Number.isFinite(ph) || ph <= 0) return 0.96;

    const distanciaOptima = Math.abs(ph - 6.4);

    return clamp(1.12 - distanciaOptima * 0.14, 0.72, 1.12);
};

const getFactorNapa = (napa: number) => {
    if (!Number.isFinite(napa) || napa <= 0) return 0.97;
    if (napa < 0.6) return 0.68;
    if (napa < 0.9) return 0.82;
    if (napa < 1.2) return 0.95;
    if (napa <= 1.8) return 1.08;
    if (napa <= 2.4) return 1.03;
    return 0.97;
};

const getFactorCaracteristicas = (caracteristicas?: string) => {
    const normalized = normalizeText(caracteristicas);

    if (!normalized) return 1;

    let factor = 1;

    const positivos = [
        { terms: ["fertil", "rico", "materia organica"], delta: 0.08 },
        { terms: ["limoso", "franco"], delta: 0.04 },
        { terms: ["bien drenado", "riego"], delta: 0.03 },
    ];

    const negativos = [
        { terms: ["arenoso", "pobre"], delta: -0.08 },
        { terms: ["compactado", "salino"], delta: -0.09 },
        { terms: ["arcilloso"], delta: -0.03 },
        { terms: ["erosionado"], delta: -0.06 },
    ];

    positivos.forEach(({ terms, delta }) => {
        if (terms.some((term) => normalized.includes(term))) {
            factor += delta;
        }
    });

    negativos.forEach(({ terms, delta }) => {
        if (terms.some((term) => normalized.includes(term))) {
            factor += delta;
        }
    });

    return clamp(factor, 0.8, 1.14);
};

const getFactorEstado = (estado?: string, tieneCultivoActivo?: boolean) => {
    const normalized = normalizeText(estado);

    if (tieneCultivoActivo) {
        if (normalized === "produccion") return 1.03;
        if (normalized === "preparacion") return 0.94;
        if (normalized === "barbecho") return 0.88;
        if (normalized === "disponible") return 0.92;
        return 1;
    }

    if (normalized === "produccion") return 0.94;
    if (normalized === "preparacion") return 0.82;
    if (normalized === "barbecho") return 0.7;
    if (normalized === "disponible") return 0.76;
    return 0.78;
};

const getProgresoCultivo = (
    fechaSiembra?: string,
    cycleDays?: number,
): number | null => {
    if (!fechaSiembra || !cycleDays) return null;

    const fecha = new Date(fechaSiembra);

    if (Number.isNaN(fecha.getTime())) return null;

    const elapsedDays = Math.max(
        0,
        Math.floor((Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return clamp(elapsedDays / cycleDays, 0, 1.2);
};

const getFactorDesarrollo = (progreso: number | null) => {
    if (progreso === null) return 0.95;
    if (progreso < 0.15) return 0.9;
    if (progreso < 0.35) return 0.96;
    if (progreso < 0.75) return 1.03;
    if (progreso <= 1) return 1.01;
    return 0.97;
};

const getFactorClima = (clima?: ClimaPronostico) => {
    if (!clima) return 1;

    const temperaturasMax = clima.temperatura_max ?? [];
    const temperaturasMin = clima.temperatura_min ?? [];
    const precipitaciones = clima.precipitacion ?? [];

    if (
        temperaturasMax.length === 0 &&
        temperaturasMin.length === 0 &&
        precipitaciones.length === 0
    ) {
        return 1;
    }

    const avgMax = average(temperaturasMax);
    const avgMin = average(temperaturasMin);
    const totalPrecipitacion = sum(precipitaciones);

    let factor = 1;

    if (avgMax > 35) factor -= 0.08;
    else if (avgMax > 31) factor -= 0.04;
    else if (avgMax >= 23 && avgMax <= 29) factor += 0.03;

    if (avgMin < 3) factor -= 0.07;
    else if (avgMin >= 10 && avgMin <= 18) factor += 0.02;

    if (totalPrecipitacion < 8) factor -= 0.06;
    else if (totalPrecipitacion <= 45) factor += 0.03;
    else if (totalPrecipitacion > 80) factor -= 0.05;

    return clamp(factor, 0.84, 1.08);
};

export const estimarRendimientoLote = (
    lote: LoteRendimientoInput,
    clima?: ClimaPronostico,
): RendimientoLoteEstimado => {
    const siembraActiva = getSiembraActiva(lote.siembras);
    const cultivoProfile = getCultivoProfile(siembraActiva?.cultivo?.tipo);
    const progreso = getProgresoCultivo(
        siembraActiva?.fecha_siembra,
        cultivoProfile.cycleDays,
    );

    const factorPh = getFactorPh(lote.ph);
    const factorNapa = getFactorNapa(lote.napa);
    const factorCaracteristicas = getFactorCaracteristicas(
        lote.caracteristicas,
    );
    const factorClima = getFactorClima(clima);
    const factorEstado = getFactorEstado(lote.estado, Boolean(siembraActiva));
    const factorDesarrollo = getFactorDesarrollo(progreso);

    const rendimientoBruto =
        cultivoProfile.baseYield *
        factorPh *
        factorNapa *
        factorCaracteristicas *
        factorClima *
        factorEstado *
        factorDesarrollo;

    const kgPorHectarea = clamp(
        rendimientoBruto,
        cultivoProfile.baseYield * 0.45,
        cultivoProfile.baseYield * 1.35,
    );

    const kgTotal = kgPorHectarea * Math.max(lote.hectareas || 0, 0);

    const confidenceBase =
        0.56 +
        (siembraActiva ? 0.12 : 0) +
        (clima ? 0.06 : 0) +
        (Number.isFinite(lote.ph) && lote.ph > 0 ? 0.06 : 0) +
        (Number.isFinite(lote.napa) && lote.napa > 0 ? 0.05 : 0) +
        (lote.caracteristicas ? 0.05 : 0);

    return {
        kg_por_hectarea: Math.round(kgPorHectarea),
        kg_total: Math.round(kgTotal),
        confianza: Math.round(clamp(confidenceBase, 0.5, 0.9) * 100),
        progreso:
            progreso === null ? null : Math.round(clamp(progreso, 0, 1) * 100),
        cultivo_referencia: cultivoProfile.label,
        factor_ph: Number(factorPh.toFixed(2)),
        factor_napa: Number(factorNapa.toFixed(2)),
        factor_caracteristicas: Number(factorCaracteristicas.toFixed(2)),
        factor_clima: Number(factorClima.toFixed(2)),
        factor_estado: Number(factorEstado.toFixed(2)),
        factor_desarrollo: Number(factorDesarrollo.toFixed(2)),
    };
};

export const estimarRendimientoCampo = (
    lotes: LoteRendimientoInput[],
    clima?: ClimaPronostico,
): RendimientoCampoEstimado | null => {
    if (lotes.length === 0) {
        return null;
    }

    const estimaciones = lotes.map((lote) => estimarRendimientoLote(lote, clima));
    const hectareasTotales = lotes.reduce(
        (total, lote) => total + Math.max(lote.hectareas || 0, 0),
        0,
    );
    const totalKg = estimaciones.reduce(
        (total, estimacion) => total + estimacion.kg_total,
        0,
    );
    const promedioKgHa =
        hectareasTotales > 0
            ? totalKg / hectareasTotales
            : average(estimaciones.map((estimacion) => estimacion.kg_por_hectarea));
    const confianzaPromedio = average(
        estimaciones.map((estimacion) => estimacion.confianza),
    );

    return {
        kg_por_hectarea: Math.round(promedioKgHa),
        kg_total: Math.round(totalKg),
        promedio_kg_ha: Math.round(promedioKgHa),
        confianza: Math.round(confianzaPromedio),
        lotes_estimados: estimaciones.length,
    };
};
