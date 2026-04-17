import DangerButton from '@/components/Buttons/DangerButton';
import ModalEliminarCuenta from '@/components/Modals/ModalEliminarCuenta';
import { useState } from 'react';

export default function DeleteUserForm({ className = '' }: { className?: string }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Delete Account</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data will be permanently
                    deleted. Before deleting your account, please download any data or information
                    that you wish to retain.
                </p>
            </header>

            <DangerButton onClick={() => setConfirmingUserDeletion(true)}>
                Delete Account
            </DangerButton>

            <ModalEliminarCuenta
                show={confirmingUserDeletion}
                onClose={() => setConfirmingUserDeletion(false)}
            />
        </section>
    );
}
