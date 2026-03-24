import { Head } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
export default function Dashboard() {
    return (
        <Body>
            <Head title="Dashboard" />
            <div className="min-h-full p-8 font-sans">
                <div className="mx-auto mb-10 max-w-7xl">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                </div>

                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-stone-200 bg-[#fdf8f0] p-6 shadow-sm">
                        <div className="text-gray-900">You are logged in!</div>
                    </div>
                </div>
            </div>
        </Body>
    );
}
