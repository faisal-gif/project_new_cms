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
        <div className={"join " +
            className} >
            <input
                {...props}
                type={showPassword ? "text" : "password"}
                className="input join-item w-full"
                ref={localRef}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn join-item rounded-r-lg"
            >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
        </div>

    );
});
