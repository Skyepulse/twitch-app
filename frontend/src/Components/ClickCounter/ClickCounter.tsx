import { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import './ClickCounter.css';
import { GetFixedNumber } from '../../Utilities/MathUtilities';
//------------Members-------------//
const MaxScale: number = 2.0;
const BaseScale: number = 1.05;
const root: HTMLElement = document.querySelector(':root') as HTMLElement;

//================================//
interface ClickCounterProps {
    clicks: number;
}

export type ClickCounterRef = {
    updateScore: () => void;
};

//================================//
const ClickCounter = forwardRef<ClickCounterRef, ClickCounterProps>(({ clicks }, ref) => {
    const scoreRef = useRef<HTMLHeadingElement>(null);

    //------------References-------------//
    useImperativeHandle(ref, () => ({
        updateScore: () => {
            if (!scoreRef.current) return;

            const score = scoreRef.current;
            score.style.animation = 'none';
            void score.offsetWidth; // Trigger reflow

            const currentScale = GetFixedNumber(
                parseFloat(getComputedStyle(root).getPropertyValue('--pop-scale')),
                3
            );
            const nextScale = Math.min(currentScale + GetFixedNumber(0.05, 3), MaxScale);
            root.style.setProperty('--pop-scale', nextScale.toString());

            score.style.animation = 'score-pop 0.5s';
        },
    }));

    //------------Effects-------------//
    useEffect(() => {
        const interval = setInterval(() => {
            const currentScale = GetFixedNumber(parseFloat(
                getComputedStyle(root).getPropertyValue('--pop-scale')
            ), 3);
            const nextScale = Math.max(currentScale - GetFixedNumber(0.05, 3), BaseScale);
            root.style.setProperty('--pop-scale', nextScale.toString());
        }, 1000);
    
        return () => clearInterval(interval);
      }, []);

    return (
        <div className="click-counter-wrapper">
            <fit-text>
                <span className='score' ref={scoreRef}>{clicks}</span>
            </fit-text>
        </div>
    )
});

export default ClickCounter;