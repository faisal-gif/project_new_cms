import { usePage } from '@inertiajs/react';

export function useAuthorization() {
    const { auth } = usePage().props;
    
    // Fallback array kosong jika user belum login atau tidak punya akses
    const roles = auth?.roles || [];
    const permissions = auth?.permissions || [];

    const hasRole = (role) => roles.includes(role);
    
    const hasAnyRole = (roleArray) => roleArray.some((r) => roles.includes(r));
    
    const hasPermission = (permission) => permissions.includes(permission);
    
    const hasAnyPermission = (permissionArray) => 
        permissionArray.some((p) => permissions.includes(p));

    return { hasRole, hasAnyRole, hasPermission, hasAnyPermission };
}