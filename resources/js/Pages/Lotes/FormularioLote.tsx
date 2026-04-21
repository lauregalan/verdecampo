import { FormEvent, useCallback, useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import MapaInteractivo, { Coord } from '../Campos/MapaInteractivo'; // Reusing the map component
import type { LoteCard, LoteDraft, StatusColor } from './types';
import { X } from 'lucide-react';

interface FormularioLoteProps {
    show: boolean;
    onClose: () => void;
    // Pass campoId to onSubmit for associating the lote with a specific campo
    onSubmit: (lote: LoteDraft, campoId: number | string) => Promise<boolean>;
    initialData?: LoteCard | null;
    campoId: number | string; // The ID of the parent field
}

const STATUS_OPTIONS: { label: string; value: string; color: StatusColor }[] = [
    { label: 'En Producción', value: 'En Produccion', color: 'verde' },
    { label: 'En Preparación', value: 'En Preparacion', color: 'naranja' },
    { label: 'En Barbecho', value: 'En Barbecho', color: 'violeta' },
];

const PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400';

export default function FormularioLote({
    show,
    onClose,
    onSubmit,
    initialData,
    campoId,
}: FormularioLoteProps) {
    // --- Estado del formulario ---
    const [name, setName] = useState('');
    const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
    const [statusColor, setStatusColor] = useState<StatusColor>(STATUS_OPTIONS[0].color);
    const [lastCrop, setLastCrop] = useState('');
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [surface, setSurface] = useState<number>(0);
    const [polygon, setPolygon] = useState<Coord[]>([]);

    useEffect(() => {
        if (show && initialData) {
            setName(initialData.name);
            setStatus(initialData.status);
            setStatusColor(initialData.statusColor);
            setLastCrop(initialData.lastCrop);
            setLatitude(initialData.latitude);
            setLongitude(initialData.longitude);
            const numericSurface = parseFloat(initialData.surface.replace(/[^\d.-]/g, ''));
            setSurface(isNaN(numericSurface) ? 0 : numericSurface);

        if (initialData.polygon) {
            const formattedPolygon: Coord[] = initialData.polygon.map(
                point => [point.lat, point.lng] as Coord
            );
            setPolygon(formattedPolygon);
        }

        } else if (show && !initialData) {
            resetForm();
        }
    }, [show, initialData]);

    // --- Handlers del mapa ---
    const handleCenterChange = useCallback((lat: number, lng: number) => {
        setLatitude(parseFloat(lat.toFixed(6)));
        setLongitude(parseFloat(lng.toFixed(6)));
    }, []);

    const handleAreaChange = useCallback((ha: number) => {
        setSurface(ha);
    }, []);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        const match = STATUS_OPTIONS.find((o) => o.value === value);
        if (match) setStatusColor(match.color);
    };

    // --- Reset ---
    const resetForm = () => {
        setName('');
        setStatus(STATUS_OPTIONS[0].value);
        setStatusColor(STATUS_OPTIONS[0].color);
        setLastCrop('');
        setLatitude(0);
        setLongitude(0);
        setSurface(0);
        setPolygon([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // --- Submit ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const nuevoLote: LoteDraft = {
            name,
            surface: `${surface} Ha`,
            status,
            lastCrop,
            statusColor,
            imageUrl: PLACEHOLDER_IMAGE,
            latitude,
            longitude,
            polygon: polygon.map(([lat, lng]) => ({
                        lat,
                        lng
                    })),
        };

        const created = await onSubmit(nuevoLote, campoId); // Pass campoId here
        if (created) {
            resetForm();
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="2xl">
            <form onSubmit={handleSubmit} className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {initialData ? 'Editar lote' : 'Registrar nuevo lote'}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Nombre */}
                    <div>
                        <InputLabel htmlFor="lote-nombre" value="Nombre del lote" />
                        <TextInput
                            id="lote-nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Lote 1 - Maiz"
                            className="mt-1 w-full"
                            required
                        />
                    </div>

                    {/* Estado y Último cultivo (side by side) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="lote-status" value="Estado" />
                            <select
                                id="lote-status"
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="lote-cultivo" value="Último cultivo" />
                            <TextInput
                                id="lote-cultivo"
                                value={lastCrop}
                                onChange={(e) => setLastCrop(e.target.value)}
                                placeholder="Ej: Soja"
                                className="mt-1 w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* Mapa interactivo */}
                    <div>
                        <InputLabel value="Ubicación y área del lote" />
                        <p className="mb-2 text-xs text-gray-500">
                            Hacé clic en el mapa para dibujar el perímetro de tu lote.
                        </p>
                        <MapaInteractivo
                            polygon={polygon}
                            onPolygonChange={setPolygon}
                            onCenterChange={handleCenterChange}
                            onAreaChange={handleAreaChange}
                        />
                    </div>

                    {/* Latitud, Longitud, Superficie (en fila) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="lote-lat" value="Latitud" />
                            <TextInput
                                id="lote-lat"
                                type="number"
                                step="any"
                                value={latitude}
                                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                                className="mt-1 w-full"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="lote-lng" value="Longitud" />
                            <TextInput
                                id="lote-lng"
                                type="number"
                                step="any"
                                value={longitude}
                                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                                className="mt-1 w-full"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="lote-superficie" value="Superficie (Ha)" />
                            <TextInput
                                id="lote-superficie"
                                type="number"
                                step="0.01"
                                min="0"
                                value={surface}
                                onChange={(e) => setSurface(parseFloat(e.target.value) || 0)}
                                className="mt-1 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-[#1d4ed8] px-5 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700"
                    >
                        {initialData ? 'Guardar cambios' : 'Registrar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
