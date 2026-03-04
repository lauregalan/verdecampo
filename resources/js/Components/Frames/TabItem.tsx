import { Link } from '@inertiajs/react';

interface TabProps {
    label: string;
    active?: boolean;
}

export default function SidebarTab({ label, active = false }: TabProps) {
    return (
        <a
            className={`
                flex items-center gap-3 px-4 py-2.5 w-full transition-all duration-200 group rounded-lg font-medium text-sm
            `}
        >
            {/*icon && <span className="text-lg opacity-80 group-hover:opacity-100">{icon}</span>*/}
            
            <span>{label}</span>
        </a>
    );
}