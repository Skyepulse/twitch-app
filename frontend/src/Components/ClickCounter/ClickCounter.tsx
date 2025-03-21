import { useEffect, forwardRef, useImperativeHandle, useRef, useState } from 'react';
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
    forceRender: (length: number) => void;
};

//================================//
const ClickCounter = forwardRef<ClickCounterRef, ClickCounterProps>(({ clicks }, ref) => {
    const scoreRef = useRef<HTMLHeadingElement>(null);
    const [renderKey, setRenderKey] = useState(0);

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

        //Only render when grid is toggled in and out of the DOM
        forceRender: ( length: number) => {
            if (!scoreRef.current) return;

            if ( length > 0 && renderKey === 0 )
                setRenderKey(1);
            else if (length === 0 && renderKey === 1)
                setRenderKey(0);
        }
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
    <div className="click-counter-wrapper" key={renderKey}>
        <div className="click-counter-under-wrapper">
            {clicks.toString().length >= 3 ? (
                <fit-text>
                    <span className='score' ref={scoreRef}>{clicks}</span>
                </fit-text>
            ) : (
                <span className='score' style={{ fontSize: "30rem" }} ref={scoreRef}>{clicks}</span>
            )}
        </div>
    </div>
    );
});

export default ClickCounter;