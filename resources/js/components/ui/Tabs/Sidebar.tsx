import {
    CalendarDays,
    ChevronRight,
    ChevronUp,
    GroupIcon,
    LayoutDashboard,
    LogOut,
    Settings,
    Sprout,
    Wheat,
    BugOff,
} from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function AppSidebar() {
    const { url, props } = usePage();
    const currentPath = url.split("?")[0];
    const user = props.auth?.user;
    const hasProductorRole = Array.isArray(user?.roles)
        ? user.roles.some((role) => role.toLowerCase() === "productor")
        : false;
    const roleLabel =
        Array.isArray(user?.roles) && user.roles.length > 0
            ? user.roles.join(", ")
            : "Sin rol";

    return (
        <Sidebar
            className=" h-full rounded-xl rounded-tr-none rounded-br-none bg-[#0f2e1e] bg-blend-multiply border-white/5 backdrop-blur-none text-white flex flex-col shadow-xl border-none"
            collapsible="none"
        >
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Sprout size={22} className="text-white" />
                    </div>
                    <span className="font-semibold text-xl tracking-wide">
                        VERDECAMPO
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-green-400/70 text-base uppercase font-medium mb-4 px-2">
                        Gestion
                    </SidebarGroupLabel>

                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath.startsWith("/dashboard")}
                                className="hover:bg-[#1a4030] text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                            >
                                <Link href="/dashboard">
                                    <LayoutDashboard size={18} />
                                    <span className="font-medium">
                                        Dashboard
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {hasProductorRole && (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={currentPath.startsWith(
                                        "/usuarios",
                                    )}
                                    className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                                >
                                    <Link href="/usuarios">
                                        <GroupIcon size={18} />
                                        <span className="font-medium">
                                            Gestion Usuarios
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath.startsWith("/campo")}
                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                            >
                                <Link href="/campo">
                                    <Sprout size={18} />
                                    <span className="font-medium">
                                        Mis Campos
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath.startsWith("/lotes")}
                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                            >
                                <Link href="/lotes">
                                    <Sprout size={18} />
                                    <span className="font-medium">
                                        Mis Lotes
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath.startsWith("/cultivos")}
                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                            >
                                <Link href="/cultivos">
                                    <Wheat size={18} />
                                    <span className="font-medium">
                                        Cultivos
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath.startsWith("/campania")}
                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                            >
                                <Link href="/campania">
                                    <CalendarDays size={18} />
                                    <span className="font-medium">
                                        Campañas
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <Collapsible
                            key="aplicaciones"
                            asChild
                            className="group/collapsible"
                            defaultOpen={currentPath === "/aplicaciones" || currentPath === "/productos" || currentPath === "/tipos"}
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                                    >
                                        <BugOff size={18} />
                                        <span>Mis Aplicaciones</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />

                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                                                isActive={currentPath === "/aplicaciones"}
                                            >
                                                <Link href="/aplicaciones">
                                                    <span className="font-medium">
                                                        Aplicaciones
                                                    </span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                                                isActive={currentPath === "/productos"}
                                            >
                                                <Link href="/productos">
                                                    <span className="font-medium">
                                                        Productos
                                                    </span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                                                isActive={currentPath === "/tipos"}
                                            >
                                                <Link href="/tipos">
                                                    <span className="font-medium">
                                                        Tipos
                                                    </span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 mt-auto border-t border-white/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="h-12 hover:bg-white/10 w-full flex items-center gap-3 p-2 rounded-xl transition">
                                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-xs font-bold">
                                        {user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div className="flex flex-col items-start text-sm">
                                        <span className="font-semibold">
                                            {user?.name || "Usuario"}
                                        </span>
                                        <span className="text-sm opacity-80 text-green-100">
                                            {roleLabel}
                                        </span>
                                    </div>
                                    <ChevronUp
                                        size={14}
                                        className="ml-auto opacity-50"
                                    />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="center"
                                className="w-56 bg-[#0f2e1e] border-white/10 text-white rounded-xl shadow-2xl mb-2"
                            >
                                <DropdownMenuItem
                                    className="hover:bg-[#1a4030] cursor-pointer flex gap-2"
                                    asChild
                                >
                                    <Link href="/profile">
                                        <Settings size={16} /> Configuracion
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="hover:bg-red-500/20 text-red-400 cursor-pointer flex gap-2"
                                    asChild
                                >
                                    <Link href="/logout" method="post">
                                        <LogOut size={16} /> Cerrar Sesion
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
