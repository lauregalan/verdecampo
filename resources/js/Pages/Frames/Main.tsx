import { PropsWithChildren, ReactNode } from 'react';
import UserManagment from '@/components/ui/Tabs/UserManagment';
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
  SidebarProvider,
} from "@/components/ui/sidebar"
import { 
    LayoutDashboard, 
    Sprout, 
    Settings, 
    LogOut, 
    User,
    ChevronUp, 
} from "lucide-react"; 
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";


import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

import { Bell } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";


interface AuthenticatedLayoutProps {
    header?: ReactNode;
}

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    const { url } = usePage();
    const currentPath = url.split("?")[0];

    return (
        
        <SidebarProvider defaultOpen={true}>
            <div className="flex items-center justify-center min-h-screen w-full bg-fondo-agro bg-cover bg-center bg-no-repeat p-4">
                
                <div className="m-1 flex w-full max-w-8xl h-[93vh] bg-white/80 p-1.5 rounded-xl shadow-2xl overflow-hidden">
                    
                    {/* SIDEBAR */}
                    <Sidebar 
                        className="w-80 h-full rounded-xl rounded-tr-none rounded-br-none bg-[#0f2e1e] text-white flex flex-col shadow-xl border-none"
                        collapsible="none"
                    >
                        {/* HEADER */}
                        <SidebarHeader className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <Sprout size={22} className="text-white" />
                                </div>
                                <span className="font-bold text-lg tracking-wide">VERDECAMPO</span>
                            </div>
                        </SidebarHeader>

                        {/* CONTENT */}
                        <SidebarContent className="px-4">
                            <SidebarGroup>
                                <SidebarGroupLabel className="text-green-500/50 text-lg uppercase font-black mb-4 px-2">
                                    Gestión
                                </SidebarGroupLabel>
                                
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={currentPath === "/dashboard"}
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
                                            isActive={currentPath.startsWith("/campo")}
                                            className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                                        >
                                            <Link href="/campo">
                                                <Sprout size={18} />
                                                <span className="font-medium">Mis campos</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroup>
                        </SidebarContent>

                        {/* FOOTER CON DROPDOWN (Opciones de usuario) */}
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
                                        
                                        <DropdownMenuContent side="top" align="center" className="w-56 bg-[#0f2e1e] border-white/10 text-white rounded-xl shadow-2xl mb-2">
                                            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex gap-2">
                                                <Settings size={16} /> Configuración
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:bg-red-500/20 text-red-400 cursor-pointer flex gap-2">
                                                <LogOut size={16} /> Cerrar Sesión
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
         
                    </Sidebar>
                    <div className="flex-1 flex flex-col min-w-0 bg-transparent h-full">

                        <div className="mx-1 bg-transparent h-20 w-full flex items-center px-6 rounded-tr-xl justify-between">

                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/">Home</Link>
                                    </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Link href="/">Manteca</Link>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/">Anashe</Link>
                                    </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                    <BreadcrumbPage>Alonso</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>

                            <div className="flex flex-row gap-5">
                
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </div>

                        </div>

                        <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <UserManagment/>
                        </main>
                        
                    </div>
                </div>
                
            </div>
            
        </SidebarProvider>
        
    );
}
