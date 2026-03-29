import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Badge } from "@/components/ui/badge";

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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && selectedRole && userRole === "Sin rol") {
            setUserRole(selectedRole);
        }

        if (!show) {
            setUserRole("Sin rol");
        }
    }, [show, selectedRole, userRole]);

    const isApplyDisabled = !selectedRole || !userId || loading;

    const handleApply = async () => {
        if (!selectedRole || !userId) return;

        setLoading(true);

        try {
            await window.axios.put(
                `/api/users/${userId}/roles`,
                {
                    roles: [selectedRole],
                },
                {
                    headers: {
                        Accept: "application/json",
                    },
                },
            );

            onClose();

            if (onRoleUpdated) {
                await onRoleUpdated();
            }
        } catch (error) {
            const message =
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof error.response === "object" &&
                error.response !== null &&
                "data" in error.response &&
                typeof error.response.data === "object" &&
                error.response.data !== null &&
                "message" in error.response.data &&
                typeof error.response.data.message === "string"
                    ? error.response.data.message
                    : "Error al actualizar el rol.";

            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Informacion del rol
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-m font-medium text-gray-700">
                            Rol actual:
                        </label>
                        <Badge className={userRole ? getRoleBadgeClass(userRole) : ""}>
                            {userRole}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        {availableRoles.map((role) => (
                            <div key={role.name} className="rounded-md border bg-gray-50 p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getRoleBadgeClass(role.name)}>
                                                {role.name}
                                            </Badge>
                                            {selectedRole === role.name && (
                                                <span className="text-xs font-semibold text-green-600">
                                                    Seleccionado
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">
                                            {role.description}
                                        </p>
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

                    <div className="flex justify-end border-t border-gray-200 px-4 pt-4">
                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={isApplyDisabled}
                            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent" />
                                    Aplicando...
                                </span>
                            ) : (
                                "Aplicar cambios"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
