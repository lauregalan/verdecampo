import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { LoteCard } from "./types";

interface ModalFormularioLoteProps {
    show: boolean;
    onClose: () => void;
    campoId: string;
    onSubmit: (lote: LoteCard) => void;
    initialData?: LoteCard | null;
}

export default function ModalFormularioLote({
    show,
    onClose,
    campoId,
    onSubmit,
    initialData,
}: ModalFormularioLoteProps) {
    const [formData, setFormData] = useState({
        name: "",
        status: "disponible",
        latitude: 0,
        longitude: 0,
        hectareas: 0,
        caracteristicas: "",
        ph: 0,
        napa: 0,
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                status: initialData.status,
                latitude: initialData.latitude,
                longitude: initialData.longitude,
                hectareas: initialData.hectareas,
                caracteristicas: initialData.caracteristicas,
                ph: initialData.ph,
                napa: initialData.napa,
            });
        } else {
            setFormData({
                name: "",
                status: "disponible",
                latitude: 0,
                longitude: 0,
                hectareas: 0,
                caracteristicas: "",
                ph: 0,
                napa: 0,
            });
        }
    }, [initialData, show]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const loteData: LoteCard = {
                id: initialData?.id || 0,
                campo_id: parseInt(campoId),
                name: formData.name,
                status: formData.status,
                latitude: formData.latitude,
                longitude: formData.longitude,
                hectareas: formData.hectareas,
                caracteristicas: formData.caracteristicas,
                ph: formData.ph,
                napa: formData.napa,
                polygon: [],
            };

            if (initialData) {
                // Update existing lote
                const response = await api.put(`/api/lotes/${initialData.id}`, {
                    nombre: loteData.name,
                    estado: loteData.status,
                    latitud: loteData.latitude,
                    longitud: loteData.longitude,
                    hectareas: loteData.hectareas,
                    caracteristicas: loteData.caracteristicas,
                    ph: loteData.ph,
                    napa: loteData.napa,
                    campo_id: loteData.campo_id,
                });

                if (!response.ok) {
                    throw new Error("Error al actualizar el lote");
                }
            } else {
                // Create new lote
                const response = await api.post("/api/lotes", {
                    nombre: loteData.name,
                    estado: loteData.status,
                    latitud: loteData.latitude,
                    longitud: loteData.longitude,
                    hectareas: loteData.hectareas,
                    caracteristicas: loteData.caracteristicas,
                    ph: loteData.ph,
                    napa: loteData.napa,
                    campo_id: loteData.campo_id,
                });

                if (!response.ok) {
                    throw new Error("Error al crear el lote");
                }
            }

            onSubmit(loteData);
            onClose();
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Lote" : "Crear Nuevo Lote"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Estado</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="disponible">
                                        Disponible
                                    </SelectItem>
                                    <SelectItem value="produccion">
                                        En Producción
                                    </SelectItem>
                                    <SelectItem value="barbecho">
                                        Barbecho
                                    </SelectItem>
                                    <SelectItem value="preparacion">
                                        Preparación
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="latitude">Latitud</Label>
                            <Input
                                id="latitude"
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        latitude: parseFloat(e.target.value) || 0,
                                    })
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="longitude">Longitud</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        longitude: parseFloat(e.target.value) || 0,
                                    })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="hectareas">Hectáreas</Label>
                            <Input
                                id="hectareas"
                                type="number"
                                step="any"
                                value={formData.hectareas}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        hectareas: parseFloat(e.target.value) || 0,
                                    })
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="ph">pH</Label>
                            <Input
                                id="ph"
                                type="number"
                                step="any"
                                value={formData.ph}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ph: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="napa">Profundidad de Napa (m)</Label>
                            <Input
                                id="napa"
                                type="number"
                                step="any"
                                value={formData.napa}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        napa: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="caracteristicas">Características</Label>
                        <Textarea
                            id="caracteristicas"
                            value={formData.caracteristicas}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    caracteristicas: e.target.value,
                                })
                            }
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? "Guardando..."
                                : initialData
                                ? "Actualizar"
                                : "Crear"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}