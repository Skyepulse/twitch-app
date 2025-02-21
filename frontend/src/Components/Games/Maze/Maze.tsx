import { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import './Maze.css';

//================================//
interface MazeProps {
    position: [number, number];
    grid: number[][];
}

export type MazeRef = {
    updateMaze: () => void;
};

//================================//
const Maze = forwardRef<MazeRef, MazeProps>(({ position, grid }, ref) => {
    if (!grid || grid.length === 0) {
        console.error("Maze grid is empty, nothing to display.");
        return ( <h1>Empty Maze</h1> );
    }

    const width = grid.length;
    const height = grid[0].length;
    

    return (
        <div className="maze-wrapper">
            <div className= "maze-under-wrapper" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div 
                        key={`${rowIndex}-${colIndex}`} 
                        className={`maze-cell ${getBorderClasses(cell)}`}
                    ></div>
                ))
            )}
        </div>
    </div>
    )
});

const getBorderClasses = (cellValue: number) => {
    const N = 1, S = 2, E = 4, W = 8;
    
    return [
        (cellValue & N) === 0 ? 'border-top' : '',
        (cellValue & S) === 0 ? 'border-bottom' : '',
        (cellValue & E) === 0 ? 'border-right' : '',
        (cellValue & W) === 0 ? 'border-left' : ''
    ].join(' ');
};

export default Maze;