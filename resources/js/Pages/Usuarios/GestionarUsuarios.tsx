import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
import { Search, X } from "lucide-react";
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
import UserModal from "@/components/ui/UserModal";
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
    const [processingUserId, setProcessingUserId] = useState<number | null>(
        null,
    );

    const authUser = usePage().props.auth?.user as
        | { id?: number; roles?: string[] }
        | undefined;
    const canManageUsers = authUser?.roles?.includes("Productor") ?? false;

    const reloadUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/users");

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

    const toggleUserActive = async (userId: number, nextActive: boolean) => {
        if (!canManageUsers) return;

        setProcessingUserId(userId);

        try {
            await window.axios.patch(
                `/api/users/${userId}/active`,
                { active: nextActive },
                {
                    headers: {
                        Accept: "application/json",
                    },
                },
            );

            await reloadUsers();
        } catch (err) {
            const message =
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof err.response === "object" &&
                err.response !== null &&
                "data" in err.response &&
                typeof err.response.data === "object" &&
                err.response.data !== null &&
                "message" in err.response.data &&
                typeof err.response.data.message === "string"
                    ? err.response.data.message
                    : "No se pudo actualizar el estado del usuario.";

            alert(message);
        } finally {
            setProcessingUserId(null);
        }
    };

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
            const byRole =
                getUserRolePriority(a.roles) - getUserRolePriority(b.roles);
            if (byRole !== 0) return byRole;
            return a.name.localeCompare(b.name, "es");
        });
    }, [search, users]);

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

                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    Gestion de usuarios
                </h2>

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
                                <TableHead className="w-[220px]">
                                    Nombre y apellido
                                </TableHead>
                                <TableHead className="w-[280px]">
                                    Correo electronico
                                </TableHead>
                                <TableHead className="w-[150px]">Rol</TableHead>
                                <TableHead className="hidden w-[210px] text-center lg:table-cell">
                                    Ultimo acceso
                                </TableHead>
                                <TableHead className="w-[140px] text-center">
                                    Estado
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-sm text-gray-500"
                                    >
                                        Cargando usuarios...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && error && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-sm text-red-600"
                                    >
                                        {error}
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading &&
                                !error &&
                                filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-sm text-gray-500"
                                        >
                                            No hay usuarios para mostrar.
                                        </TableCell>
                                    </TableRow>
                                )}

                            {!loading &&
                                !error &&
                                filteredUsers.map((user) => {
                                    const primaryRole =
                                        user.roles[0] ?? "Sin rol";
                                    const estado = user.active
                                        ? "Activo"
                                        : "Inactivo";

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-black/5 shadow-sm">
                                                        <AvatarImage
                                                            src=""
                                                            alt={user.name}
                                                        />
                                                        <AvatarFallback className="bg-green-100 text-xs font-bold uppercase text-green-700">
                                                            {user.name
                                                                .split(" ")
                                                                .map(
                                                                    (n) => n[0],
                                                                )
                                                                .join("")
                                                                .substring(
                                                                    0,
                                                                    2,
                                                                )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="truncate font-medium"
                                                title={user.name}
                                            >
                                                {user.name}
                                            </TableCell>
                                            <TableCell
                                                className="truncate"
                                                title={user.email}
                                            >
                                                {user.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${getRoleBadgeClass(primaryRole)} cursor-pointer hover:opacity-80 transition-opacity`}
                                                    onClick={() => {
                                                        setSelectedRole(
                                                            primaryRole,
                                                        );
                                                        setSelectedUserId(
                                                            user.id.toString(),
                                                        );
                                                    }}
                                                >
                                                    {primaryRole}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden whitespace-nowrap text-center lg:table-cell">
                                                {formatDate(user.last_login_at)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                id={`user-${user.id}`}
                                                                checked={
                                                                    user.active
                                                                }
                                                                disabled={
                                                                    !canManageUsers ||
                                                                    processingUserId ===
                                                                        user.id ||
                                                                    authUser?.id ===
                                                                        user.id
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    toggleUserActive(
                                                                        user.id,
                                                                        checked,
                                                                    )
                                                                }
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
        </Body>
    );
}
