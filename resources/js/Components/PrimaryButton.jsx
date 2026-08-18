import { Button } from '@/Components/ui/button';

// Wrapper legacy: teruskan ke shadcn Button (default variant = primary).
export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <Button {...props} className={className} disabled={disabled}>
            {children}
        </Button>
    );
}
