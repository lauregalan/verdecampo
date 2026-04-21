import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { KeyRound, Sprout } from 'lucide-react';

interface Props {
    email: string;
}

export default function AceptarInvitacion({ email }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('invitation.set-password'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Establecer Contraseña" />

            <div className="mb-7">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f2e1e] shadow-md">
                        <Sprout size={24} className="text-[#d2e7d9]" />
                    </div>
                    <span className="text-[38px] font-extrabold tracking-tight text-[#194230]">
                        VERDECAMPO
                    </span>
                </div>

                <h1 className="text-4xl font-extrabold leading-tight text-[#1f3f31]">
                    Bienvenido
                </h1>
                <p className="mt-1 text-lg text-[#4d685a]">
                    Por favor establece tu nueva contraseña para acceder.
                </p>
                <div className="mt-2 text-sm font-semibold text-[#2f4d3f]">
                    Usuario: <span className="font-normal">{email}</span>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="password" value="Nueva Contraseña" className="text-base font-semibold text-[#2f4d3f]" />
                    <div className="relative mt-1">
                        <KeyRound size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#577465]" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder='**********'
                            className="block w-full rounded-xl border-[#4f6b5d] bg-[#eef4ee] py-2.5 pl-10 text-base focus:border-[#2f5f48] focus:ring-[#2f5f48]"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" className="text-base font-semibold text-[#2f4d3f]" />
                    <div className="relative mt-1">
                        <KeyRound size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#577465]" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder='**********'
                            className="block w-full rounded-xl border-[#4f6b5d] bg-[#eef4ee] py-2.5 pl-10 text-base focus:border-[#2f5f48] focus:ring-[#2f5f48]"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 w-full rounded-xl bg-[#2e7d52] px-4 py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-md transition hover:bg-[#1d5f3f] disabled:opacity-60"
                >
                    Guardar Contraseña y Continuar
                </button>
            </form>
        </GuestLayout>
    );
}
