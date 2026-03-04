import { Link } from '@inertiajs/react';

interface TabProps {
    label: string;
    href?: string;
    active?: boolean;
}

export default function SidebarTab({ label, href = '#', active = false }: TabProps) {
    return (
        <Link
            href={href}
            className={`
                flex items-center gap-3 px-4 py-2.5 w-full transition-all duration-200 group rounded-lg font-medium text-sm
                ${active ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}
            `}
        >
            {/*icon && <span className="text-lg opacity-80 group-hover:opacity-100">{icon}</span>*/}
            
            <span>{label}</span>
        </Link>
    );
}
