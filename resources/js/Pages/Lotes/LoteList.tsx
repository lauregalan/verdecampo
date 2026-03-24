import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function LoteList() {
    return (
        <AuthenticatedLayout>
            <Head title="Lotes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">Listado de Lotes</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
