import { X } from "lucide-react";
import Modal from "@/components/Modal";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

type RoleInfo = {
    name: string;
    description: string;
};

interface UserModalProps {
    show: boolean;
    selectedRole: string | null;
    availableRoles: RoleInfo[];
    getRoleBadgeClass: (role: string) => string;
    onClose: () => void;
    onSelectRole: (role: string) => void;
    userId: string;
    onRoleUpdated?: () => Promise<void> | void;
}

export default function UserModal({
    show,
    selectedRole,
    availableRoles,
    getRoleBadgeClass,
    onClose,
    onSelectRole,
    userId,
    onRoleUpdated,
}: UserModalProps) {

    const [userRole, setUserRole] = useState("Sin rol");

    useEffect(() => {
        if (show && selectedRole && userRole === "Sin rol") {
            setUserRole(selectedRole);
        }
        
        if (!show) {
            setUserRole("Sin rol");
        }
    }, [show, selectedRole]); // Se ejecuta cuando se oculta el modal o cambia el rol seleccionado


    const [loading, setLoading] = useState(false);

    // Función para enviar los datos al backend y actualizar el rol del usuario
    const handleApply = async () => {
        if (!selectedRole) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/users/${userId}/roles`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    roles: [selectedRole],
                }),
            });

            if (response.ok) {
                console.log("Rol actualizado con éxito", response.status);
                onClose();
                if (onRoleUpdated) {
                    await onRoleUpdated();
                }
            } else {
                const text = await response.text();
                console.error("Error al actualizar rol", response.status, text);
                alert("Error al actualizar el rol");
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert("Error de red al intentar actualizar el rol.");
        } finally {
            setLoading(false);
        }
    };





    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Información del Rol</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-m font-medium text-gray-700">Rol Actual:</label>
                        <Badge className={userRole ? getRoleBadgeClass(userRole) : ""}>
                            {userRole}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        {availableRoles.map((role) => (
                            <div key={role.name} className="border rounded-md bg-gray-50 p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getRoleBadgeClass(role.name)}>{role.name}</Badge>
                                            {selectedRole === role.name && (
                                                <span className="text-xs text-green-600 font-semibold">Seleccionado</span>
                                            )}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">{role.description}</p>
                                    </div>
                                    <button
                                        onClick={() => onSelectRole(role.name)}
                                        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                                    >
                                        Seleccionar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex justify-end px-4">
                        <button
                            onClick={handleApply}
                            className="text-red-500 hover:text-gray-700"
                        >
                            Aplicar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
