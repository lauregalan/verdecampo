import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
import { Mail, Plus, Search, X } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserModal from "@/components/Modals/UserModal";
import {
    DataTable,
    type ColumnDef,
    type PaginationMeta,
} from "@/components/ui/DataTable";
import api from "@/lib/api";

interface BackendUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    updated_at: string | null;
    last_login_at: string | null;
    email_verified_at: string | null;
    active: boolean;
}

interface UserManagmentProps {
    header?: ReactNode;
}

const formatDate = (value: string | null) => {
    if (!value) return "Aun no ha Iniciado Sesion";
    return new Date(value).toLocaleString("es-AR");
};

const getRoleBadgeClass = (role: string) => {
    const normalized = role.toLowerCase();
    if (normalized === "productor") return "bg-blue-500";
    if (normalized === "ingeniero") return "bg-green-700";
    return "bg-gray-500";
};

const rolePriority: Record<string, number> = { productor: 0, ingeniero: 1 };

const getUserRolePriority = (roles: string[]) => {
    if (!Array.isArray(roles) || roles.length === 0) return 99;
    return roles.reduce(
        (best, role) => Math.min(best, rolePriority[role.toLowerCase()] ?? 99),
        99,
    );
};

const PER_PAGE = 20;

export default function UserManagment({ header }: UserManagmentProps) {
    const [users, setUsers] = useState<BackendUser[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [processingUserId, setProcessingUserId] = useState<number | null>(
        null,
    );
    const [currentPage, setCurrentPage] = useState(1);

    const authUser = usePage().props.auth?.user as
        | { id?: number; roles?: string[] }
        | undefined;
    const canManageUsers = authUser?.roles?.includes("Productor") ?? false;

    // Invite collaborator state
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteEmailError, setInviteEmailError] = useState<string | null>(
        null,
    );
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (type: "success" | "error", message: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ type, message });
        toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    };

    const handleOpenInvite = () => {
        setInviteEmail("");
        setInviteEmailError(null);
        setShowInviteModal(true);
    };

    const handleCloseInvite = () => {
        setShowInviteModal(false);
        setInviteEmail("");
        setInviteEmailError(null);
    };

    const handleSendInvite = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!inviteEmail.trim() || !emailRegex.test(inviteEmail.trim())) {
            setInviteEmailError(
                "Por favor ingresa un correo electrónico válido.",
            );
            return;
        }
        setInviteEmailError(null);
        setInviteLoading(true);
        try {
            const response = await api.post("/api/invitar", {
                email: inviteEmail.trim(),
            });

            const data = (await response.json()) as {
                status?: string;
                message?: string;
                error?: string;
            };
            if (!response.ok || data.status !== "success") {
                throw new Error(data.error ?? "Error al enviar la invitación.");
            }
            handleCloseInvite();
            showToast(
                "success",
                "✓ Correo de invitación enviado correctamente.",
            );
        } catch (err) {
            showToast(
                "error",
                err instanceof Error
                    ? err.message
                    : "Error al enviar la invitación.",
            );
        } finally {
            setInviteLoading(false);
        }
    };

    const reloadUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/users");
            if (!response.ok) throw new Error();
            const payload = (await response.json()) as BackendUser[];
            setUsers(Array.isArray(payload) ? payload : []);
            setError(null);
        } catch {
            setError("Error al cargar usuarios desde el backend.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reloadUsers();
    }, []);
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const toggleUserActive = async (userId: number, nextActive: boolean) => {
        if (!canManageUsers) return;
        setProcessingUserId(userId);
        try {
            await window.axios.patch(
                `/api/users/${userId}/active`,
                { active: nextActive },
                { headers: { Accept: "application/json" } },
            );
            await reloadUsers();
        } catch (err) {
            const message =
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof (err as any).response?.data?.message === "string"
                    ? (err as any).response.data.message
                    : "No se pudo actualizar el estado del usuario.";
            alert(message);
        } finally {
            setProcessingUserId(null);
        }
    };

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        const base = term
            ? users.filter((u) => {
                  const primaryRole = u.roles[0] ?? "Sin rol";
                  return (
                      u.name.toLowerCase().includes(term) ||
                      u.email.toLowerCase().includes(term) ||
                      primaryRole.toLowerCase().includes(term)
                  );
              })
            : [...users];
        return base.sort((a, b) => {
            const byRole =
                getUserRolePriority(a.roles) - getUserRolePriority(b.roles);
            return byRole !== 0 ? byRole : a.name.localeCompare(b.name, "es");
        });
    }, [search, users]);

    const pagination: PaginationMeta = {
        currentPage,
        lastPage: Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE)),
        total: filteredUsers.length,
        perPage: PER_PAGE,
        from: filteredUsers.length === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1,
        to: Math.min(currentPage * PER_PAGE, filteredUsers.length),
    };

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE,
    );

    const availableRoles = [
        {
            name: "Productor",
            description:
                "Puede ver y gestionar campos, planes de cultivo y producción. Ademas de gestionar usuarios",
        },
        {
            name: "Ingeniero",
            description:
                "Accede a datos técnicos, informes y tareas de supervisión de campo.",
        },
    ];

    const columns: ColumnDef<BackendUser>[] = [
        {
            id: "avatar",
            header: "",
            headerClassName: "w-14",
            cell: (user) => (
                <Avatar className="h-9 w-9 border border-black/5 shadow-sm">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="bg-green-100 text-xs font-bold uppercase text-green-700">
                        {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                    </AvatarFallback>
                </Avatar>
            ),
        },
        {
            id: "nombre",
            header: "Nombre y apellido",
            headerClassName: "w-[220px]",
            cellClassName: "truncate font-medium",
            cell: (user) => <span title={user.name}>{user.name}</span>,
        },
        {
            id: "email",
            header: "Correo electronico",
            headerClassName: "w-[280px]",
            cellClassName: "truncate",
            cell: (user) => <span title={user.email}>{user.email}</span>,
        },
        {
            id: "rol",
            header: "Rol",
            headerClassName: "w-[150px]",
            cell: (user) => {
                const primaryRole = user.roles[0] ?? "Sin rol";
                return (
                    <Badge
                        className={`${getRoleBadgeClass(primaryRole)} cursor-pointer transition-opacity hover:opacity-80`}
                        onClick={() => {
                            setSelectedRole(primaryRole);
                            setSelectedUserId(user.id.toString());
                        }}
                    >
                        {primaryRole}
                    </Badge>
                );
            },
        },
        {
            id: "ultimo_acceso",
            header: "Ultimo acceso",
            headerClassName: "hidden w-[210px] text-center lg:table-cell",
            cellClassName: "hidden whitespace-nowrap text-center lg:table-cell",
            cell: (user) => formatDate(user.last_login_at),
        },
        {
            id: "estado",
            header: "Estado",
            headerClassName: "w-[140px] text-center",
            cellClassName: "text-center",
            cell: (user) => (
                <div className="flex items-center justify-center gap-2">
                    <Switch
                        id={`user-${user.id}`}
                        checked={user.active}
                        disabled={
                            !canManageUsers ||
                            processingUserId === user.id ||
                            authUser?.id === user.id
                        }
                        onCheckedChange={(checked) =>
                            toggleUserActive(user.id, checked)
                        }
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                    />
                    <Label
                        htmlFor={`user-${user.id}`}
                        className="min-w-[50px] text-xs font-medium text-gray-500"
                    >
                        {user.active ? "Activo" : "Inactivo"}
                    </Label>
                </div>
            ),
        },
    ];

    return (
        <Body>
            <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-4">
                {header && (
                    <header className="border-b border-black/5 pb-4">
                        <h1 className="text-2xl font-black uppercase tracking-tight text-[#0f2e1e]">
                            {header}
                        </h1>
                    </header>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-2">
                    <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
                        Gestión de usuarios
                    </h2>
                    <button
                        type="button"
                        onClick={handleOpenInvite}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Invitar Colaborador
                    </button>
                </div>

                <InputGroup className="max-w-full">
                    <InputGroupInput
                        placeholder="Buscar por nombre, email o rol..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        {filteredUsers.length} results
                    </InputGroupAddon>
                </InputGroup>

                <ScrollArea className="min-h-0 flex-1 w-full rounded-lg border border-black/10 bg-white/70 pr-1 lg:pr-3">
                    <DataTable
                        columns={columns}
                        data={error ? [] : paginatedUsers}
                        keyExtractor={(u) => u.id}
                        loading={loading}
                        emptyMessage={error ?? "No hay usuarios para mostrar."}
                        pagination={pagination}
                        onPageChange={setCurrentPage}
                        tableClassName="w-full min-w-[820px] table-fixed lg:min-w-[1040px]"
                    />
                </ScrollArea>
            </div>

            <UserModal
                show={selectedRole !== null}
                selectedRole={selectedRole}
                availableRoles={availableRoles}
                getRoleBadgeClass={getRoleBadgeClass}
                onClose={() => {
                    setSelectedRole(null);
                    setSelectedUserId(null);
                }}
                onSelectRole={(role) => setSelectedRole(role)}
                userId={selectedUserId ?? ""}
                onRoleUpdated={reloadUsers}
            />

            {/* Invite Collaborator Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleCloseInvite}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                        <button
                            type="button"
                            onClick={handleCloseInvite}
                            className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Cerrar"
                        >
                            <X size={18} />
                        </button>

                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                                <Mail size={20} className="text-green-700" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Invitar Colaborador
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Se enviará un enlace de acceso por correo.
                                </p>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label
                                htmlFor="invite-email"
                                className="mb-1.5 block text-sm font-semibold text-gray-700"
                            >
                                Correo electrónico
                            </label>
                            <input
                                id="invite-email"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => {
                                    setInviteEmail(e.target.value);
                                    if (inviteEmailError)
                                        setInviteEmailError(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                        void handleSendInvite();
                                }}
                                placeholder="colaborador@ejemplo.com"
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:ring-2 ${
                                    inviteEmailError
                                        ? "border-red-400 focus:ring-red-200"
                                        : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                                }`}
                            />
                            {inviteEmailError && (
                                <p className="mt-1.5 text-xs text-red-500">
                                    {inviteEmailError}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseInvite}
                                disabled={inviteLoading}
                                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleSendInvite()}
                                disabled={inviteLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95 disabled:opacity-60"
                            >
                                {inviteLoading ? (
                                    <>
                                        <svg
                                            className="h-4 w-4 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8z"
                                            />
                                        </svg>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Mail size={16} />
                                        Enviar invitación
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast notification */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg transition-all duration-300 ${
                        toast.type === "success"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                    }`}
                >
                    <span className="text-sm font-semibold">
                        {toast.message}
                    </span>
                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        className="rounded-lg p-0.5 opacity-80 hover:opacity-100"
                        aria-label="Cerrar notificación"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}
        </Body>
    );
}
