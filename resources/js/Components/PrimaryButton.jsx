export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `btn btn-primary ${
                    disabled && 'btn-disabled'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
