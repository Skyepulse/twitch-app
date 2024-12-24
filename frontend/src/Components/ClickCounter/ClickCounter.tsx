import './ClickCounter.css';

interface ClickCounterProps {
    clicks: number;
}

const ClickCounter: React.FC<ClickCounterProps> = ({clicks}) => {
    return (
        <div className="click-counter-wrapper">
            <h1>{clicks}</h1>
        </div>
    )
};

export default ClickCounter;