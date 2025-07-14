// src/components/admin/personnel/ToastNotifier.tsx
'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { usePathname, useRouter } from 'next/navigation';

interface ToastNotifierProps {
    successMessage?: string;
    errorMessage?: string;
}

// This component reads URL query params to show toasts and then clears them.
export default function ToastNotifier({ successMessage, errorMessage }: ToastNotifierProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            // Clean the URL
            router.replace(pathname, { scroll: false });
        }
        if (errorMessage) {
            toast.error(errorMessage);
            // Clean the URL
            router.replace(pathname, { scroll: false });
        }
    }, [successMessage, errorMessage, router, pathname]);

    return null; // This component does not render anything
}
