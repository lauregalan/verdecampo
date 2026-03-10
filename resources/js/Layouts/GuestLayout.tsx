import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-fondo-agro bg-cover bg-center bg-no-repeat pt-6 sm:justify-center sm:pt-0">
            <div className="w-full overflow-hidden border border-[#d8dece] bg-white/95 px-7 py-8 shadow-xl backdrop-blur-sm sm:max-w-md sm:rounded-2xl">
                {children}
            </div>
        </div>
    );
}
