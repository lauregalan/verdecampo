import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserManagment from '@/components/ui/Tabs/UserManagment';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <UserManagment />
        </AuthenticatedLayout>
    );
}