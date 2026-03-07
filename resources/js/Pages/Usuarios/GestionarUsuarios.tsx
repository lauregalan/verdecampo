import { ReactNode, useEffect, useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Search } from "lucide-react";
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

export default function UserManagment({ header }: UserManagmentProps) {
    const [users, setUsers] = useState<BackendUser[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadUsers = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/users", {
                    headers: {
                        Accept: "application/json",
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("No se pudo obtener el listado de usuarios.");
                }

                const payload = (await response.json()) as BackendUser[];
                setUsers(Array.isArray(payload) ? payload : []);
                setError(null);
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                setError("Error al cargar usuarios desde el backend.");
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();

        return () => controller.abort();
    }, []);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;

        return users.filter((user) => {
            const primaryRole = user.roles[0] ?? "Sin rol";
            return (
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                primaryRole.toLowerCase().includes(term)
            );
        });
    }, [search, users]);

    return (
        <AuthenticatedLayout>
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
                                                <Badge className={getRoleBadgeClass(primaryRole)}>
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
        </AuthenticatedLayout>
    );
}
