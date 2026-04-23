export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `label border border-input ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
