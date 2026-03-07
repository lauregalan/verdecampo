import { PropsWithChildren } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Body({ children }: PropsWithChildren) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

