export interface CatalogOption {
    id: number;
    nombre: string;
}

export interface LoteOption {
    id: number;
    nombre: string;
    campo_id?: number | null;
}

export interface AplicacionDraft {
    producto_aplicacion_id: number;
    tipo_aplicacion_id: number;
    campania_id: number;
    lote_id: number;
    cantidad: number;
    unidad: string;
    fecha: string;
    precio_labor: number;
    moneda_precio_labor: string;
    observaciones: string;
}

export interface BackendAplicacion {
    id: number;
    producto_aplicacion: CatalogOption | null;
    tipo_aplicacion: CatalogOption | null;
    campania: CatalogOption | null;
    lote: LoteOption | null;
    cantidad: number;
    unidad: string;
    fecha: string;
    precio_labor: number;
    moneda_precio_labor: string;
    observaciones: string | null;
}

export interface AplicacionRecord {
    id: number;
    producto: string;
    tipo: string;
    campania: string;
    lote: string;
    cantidad: number;
    unidad: string;
    fecha: string;
    precioLabor: number;
    moneda: string;
    observaciones: string;
    productoId: number | null;
    tipoId: number | null;
    campaniaId: number | null;
    loteId: number | null;
}

export type ProductoFisico = "GRANULADO" | "LIQUIDO";

export interface ProductoAplicacion {
    id: number;
    nombre: string;
    concentracion: string;
    tipo: ProductoFisico;
    created_at?: string;
    updated_at?: string;
}

export interface TipoAplicacion {
    id: number;
    nombre: string;
    created_at?: string;
    updated_at?: string;
}
