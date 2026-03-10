import {
    ChevronUp,
    GroupIcon,
    LayoutDashboard,
    LogOut,
    Settings,
    Sprout,
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
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
    const { url } = usePage();
    const currentPath = url.split("?")[0];

    return (
        <Sidebar
            className="w-80 h-full rounded-xl rounded-tr-none rounded-br-none bg-[#0f2e1e] text-white flex flex-col shadow-xl border-none"
            collapsible="none"
        >
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Sprout size={22} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-wide">VERDECAMPO</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-green-500/50 text-lg uppercase font-black mb-4 px-2">
                        Gestion
                    </SidebarGroupLabel>

                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath.startsWith("/dashboard")}
                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                            >
                                <Link href="/dashboard">
                                    <LayoutDashboard size={18} />
                                    <span className="font-medium">Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath.startsWith("/usuarios")}
                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                            >
                                <Link href="/usuarios">
                                    <GroupIcon size={18} />
                                    <span className="font-medium">Gestion Usuarios</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath.startsWith("/campo")}
                                className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                            >
                                <Link href="/campo">
                                    <Sprout size={18} />
                                    <span className="font-medium">Mis Campos</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
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
                                        L
                                    </div>
                                    <div className="flex flex-col items-start text-sm">
                                        <span className="font-bold">Laureano</span>
                                        <span className="text-[10px] opacity-50 text-green-200">Admin</span>
                                    </div>
                                    <ChevronUp size={14} className="ml-auto opacity-50" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="center"
                                className="w-56 bg-[#0f2e1e] border-white/10 text-white rounded-xl shadow-2xl mb-2"
                            >
                                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex gap-2">
                                    <Settings size={16} /> Configuracion
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-red-500/20 text-red-400 cursor-pointer flex gap-2">
                                    <LogOut size={16} /> Cerrar Sesion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
