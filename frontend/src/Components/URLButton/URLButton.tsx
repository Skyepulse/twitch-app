import { useEffect, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import './URLButton.css';

//================================//
interface URLButtonProps {
    url: string;
    text: string;
}

//================================//
const OnButtonClick = (url: string) => {
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
        newWindow.opener = null; // Prevent the new window from being able to navigate the original window
    }
}

//================================//
const URLButton: React.FC<URLButtonProps> = forwardRef(({ url, text }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => ({
        buttonRef: buttonRef.current,
    }));

    return (
        <button className="url-button" ref={buttonRef} onClick={() => OnButtonClick(url)}>
            {text}
        </button>
    );
});

export default URLButton;