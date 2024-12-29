import './AnimatedClick.css';

//================================//
interface AnimatedClickProps {
    clicks: number;
}

//================================//
const AnimatedClick: React.FC<AnimatedClickProps> = ({ clicks}) => {
    return (
        <h1>+{clicks}</h1>
    );
};

//================================//
export const getRandomPosition = (body: Element) => {
    const bodyRect = body.getBoundingClientRect();
    const x: number = Math.random() * (bodyRect.width - 50);
    const y: number = Math.random() * (bodyRect.height - 50);
    return { x, y };
};

export default AnimatedClick;