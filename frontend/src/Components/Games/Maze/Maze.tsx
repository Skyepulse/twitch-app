import { useEffect, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import './Maze.css';

//================================//
interface MazeProps {
    position: [number, number];
    grid: number[][];
    win: boolean;
    wayPoints: { [key: number]: number };
}

export type MazeRef = {
    updateMaze: () => void;
};

//================================//
const Maze = forwardRef<MazeRef, MazeProps>(({ position, grid, wayPoints, win }, ref) => {

    if (!grid || grid.length === 0) {
        return ( <h1>Empty Maze</h1> );
    }

    const height = grid.length;
    const width = grid[0].length; 
    
    

    
    return (
        <div className="maze-wrapper">
            <div className="maze-text" style={{ color: win ? 'green' : 'black' }}>
                {win ? 'You Win! Standby for new Maze Generation.' : 'Find the exit!'}
            </div>
            <div className= "maze-under-wrapper" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div 
                        key={`${rowIndex}-${colIndex}`} 
                        className={`maze-cell ${getBorderClasses(cell, [rowIndex, colIndex], position, wayPoints)}`}
                    ></div>
                ))
            )}
        </div>
    </div>
    )
});

const getBorderClasses = (cellValue: number, cellPosition: [number, number], playerPos: [number, number], wayPoints: {[key: number]: number}) => {
    const N = 1, S = 2, E = 4, W = 8;
    const cellUid = GetCellUid(cellPosition, cellValue, cellValue);
    const isWaypoint = wayPoints[cellUid] !== undefined;
    return [
        (cellValue & N) === 0 ? 'border-top' : '',
        (cellValue & S) === 0 ? 'border-bottom' : '',
        (cellValue & E) === 0 ? 'border-right' : '',
        (cellValue & W) === 0 ? 'border-left' : '',
        (cellPosition[0] === playerPos[0] && cellPosition[1] === playerPos[1]) ? 'player-cell' : '',
        isWaypoint ? 'waypoint-cell' : '',
    ].join(' ');
};

const GetCellUid = (cellPosition: [number, number], width: number, height: number): number => {
    if (cellPosition[0] < 0 || cellPosition[0] >= height || cellPosition[1] < 0 || cellPosition[1] >= width) {
        throw new Error('Cell position out of bounds');
    }
    return cellPosition[0] * width + cellPosition[1];
}

export default Maze;