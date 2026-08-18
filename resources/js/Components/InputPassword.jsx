import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Eye, EyeOff } from "lucide-react";

export default forwardRef(function InputPassword(
    { className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <div className={"flex " + className} >
            <input
                {...props}
                type={showPassword ? "text" : "password"}
                className="h-9 w-full rounded-l-md border border-input bg-transparent px-3 text-sm outline-none focus:border-ring"
                ref={localRef}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="inline-flex items-center justify-center rounded-r-md border border-l-0 border-input px-3 hover:bg-muted"
            >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
        </div>

    );
});
