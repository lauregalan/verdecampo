import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserModal from "@/components/ui/UserModal";

interface BackendUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    updated_at: string | null;
    email_verified_at: string | null;
}

interface UserManagmentProps {
    header?: ReactNode;
}

const formatDate = (value: string | null) => {
    if (!value) return "Sin datos";
    return new Date(value).toLocaleString("es-AR");
};

const getRoleBadgeClass = (role: string) => {
    const normalized = role.toLowerCase();
    if (normalized === "productor") return "bg-blue-500";
    if (normalized === "ingeniero") return "bg-green-700";
    if (normalized === "empleado") return "bg-orange-500";
    return "bg-gray-500";
};

const rolePriority: Record<string, number> = {
    productor: 0,
    ingeniero: 1,
    empleado: 2,
};

const getUserRolePriority = (roles: string[]) => {
    if (!Array.isArray(roles) || roles.length === 0) return 99;
    return roles.reduce((best, role) => {
        const current = rolePriority[role.toLowerCase()] ?? 99;
        return Math.min(best, current);
    }, 99);
};

export default function UserManagment({ header }: UserManagmentProps) {
    const [users, setUsers] = useState<BackendUser[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Invite collaborator state
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteEmailError, setInviteEmailError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
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
            setInviteEmailError("Por favor ingresa un correo electrónico válido.");
            return;
        }
        setInviteEmailError(null);
        setInviteLoading(true);
        try {
    const response = await fetch("api/invitar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ email: inviteEmail.trim() }),
    });


    const data = await response.json() as { status?: string; message?: string; error?: string };
            if (!response.ok || data.status !== "success") {
                throw new Error(data.error ?? "Error al enviar la invitación.");
            }
            handleCloseInvite();
            showToast("success", "✓ Correo de invitación enviado correctamente.");
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Error al enviar la invitación.");
        } finally {
            setInviteLoading(false);
        }
    };

    const reloadUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/users", {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("No se pudo obtener el listado de usuarios.");
            }

            const payload = (await response.json()) as BackendUser[];
            setUsers(Array.isArray(payload) ? payload : []);
            setError(null);
        } catch (err) {
            setError("Error al cargar usuarios desde el backend.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reloadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        const base = term
            ? users.filter((user) => {
                const primaryRole = user.roles[0] ?? "Sin rol";
                return (
                    user.name.toLowerCase().includes(term) ||
                    user.email.toLowerCase().includes(term) ||
                    primaryRole.toLowerCase().includes(term)
                );
            })
            : [...users];

        return base.sort((a, b) => {
            const byRole = getUserRolePriority(a.roles) - getUserRolePriority(b.roles);
            if (byRole !== 0) return byRole;
            return a.name.localeCompare(b.name, "es");
        });
    }, [search, users]);

    const availableRoles = [
        {
            name: "Productor",
            description: "Puede ver y gestionar campos, planes de cultivo y producción. Ademas de gestionar usuarios",
        },
        {
            name: "Ingeniero",
            description: "Accede a datos técnicos, informes y tareas de supervisión de campo.",
        },
        {
            name: "Empleado",
            description: "Realiza tareas de campo asignadas y actualiza estados de actividades.",
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
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        {filteredUsers.length} results
                    </InputGroupAddon>
                </InputGroup>

                <ScrollArea className="min-h-0 flex-1 w-full rounded-lg border border-black/10 bg-white/70 pr-1 lg:pr-3">
                    <Table className="w-full min-w-[820px] table-fixed lg:min-w-[1040px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-14"></TableHead>
                                <TableHead className="w-[220px]">Nombre y apellido</TableHead>
                                <TableHead className="w-[280px]">Correo electronico</TableHead>
                                <TableHead className="w-[150px]">Rol</TableHead>
                                <TableHead className="hidden w-[210px] text-center lg:table-cell">Ultimo acceso</TableHead>
                                <TableHead className="w-[140px] text-center">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                                        Cargando usuarios...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && error && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-red-600">
                                        {error}
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && !error && filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                                        No hay usuarios para mostrar.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading &&
                                !error &&
                                filteredUsers.map((user) => {
                                    const primaryRole = user.roles[0] ?? "Sin rol";
                                    const estado = user.email_verified_at ? "Activo" : "Pendiente";

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
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
                                                </div>
                                            </TableCell>
                                            <TableCell className="truncate font-medium" title={user.name}>{user.name}</TableCell>
                                            <TableCell className="truncate" title={user.email}>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${getRoleBadgeClass(primaryRole)} cursor-pointer hover:opacity-80 transition-opacity`}
                                                    onClick={() => {
                                                        setSelectedRole(primaryRole);
                                                        setSelectedUserId(user.id.toString());
                                                    }}
                                                >
                                                    {primaryRole}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden whitespace-nowrap text-center lg:table-cell">
                                                {formatDate(user.updated_at)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id={`user-${user.id}`}
                                                            checked={estado === "Activo"}
                                                            disabled
                                                            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                                                        />
                                                        <Label
                                                            htmlFor={`user-${user.id}`}
                                                            className="min-w-[50px] text-xs font-medium text-gray-500"
                                                        >
                                                            {estado}
                                                        </Label>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );




                                })}
                        </TableBody>
                    </Table>
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
                                <h3 className="text-lg font-bold text-gray-900">Invitar Colaborador</h3>
                                <p className="text-sm text-gray-500">Se enviará un enlace de acceso por correo.</p>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label htmlFor="invite-email" className="mb-1.5 block text-sm font-semibold text-gray-700">
                                Correo electrónico
                            </label>
                            <input
                                id="invite-email"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => {
                                    setInviteEmail(e.target.value);
                                    if (inviteEmailError) setInviteEmailError(null);
                                }}
                                onKeyDown={(e) => { if (e.key === "Enter") void handleSendInvite(); }}
                                placeholder="colaborador@ejemplo.com"
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition-all focus:ring-2 ${inviteEmailError
                                        ? "border-red-400 focus:ring-red-200"
                                        : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                                    }`}
                            />
                            {inviteEmailError && (
                                <p className="mt-1.5 text-xs text-red-500">{inviteEmailError}</p>
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
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
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
                    className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg transition-all duration-300 ${toast.type === "success"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                >
                    <span className="text-sm font-semibold">{toast.message}</span>
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
