import { useEffect, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import './Maze.css';

//================================//
interface MazeProps {
    position: [number, number];
    grid: number[][];
    win: boolean;
    wayPoints: { [key: number]: number };
    onWayPoint: boolean;
}

export type MazeRef = {
    updateMaze: () => void;
};

//================================//
const Maze = forwardRef<MazeRef, MazeProps>(({ position, grid, wayPoints, win, onWayPoint }, ref) => {

    if (!grid || grid.length === 0) {
        return ( <h1>Empty Maze</h1> );
    }

    const height = grid.length;
    const width = grid[0].length; 
    
    

    
    return (
        <div className="maze-wrapper">
            <div className="maze-text" style={{ color: onWayPoint ? 'blue': win ? 'green' : 'black' }}>
                {onWayPoint ? 'Secret Waypoint Discovered!' : win ? 'You Win! Standby for new Maze Generation.' : 'Find the exit! (write !up, !down, !left, !right)'}   
            </div>
            <div className= "maze-under-wrapper" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div 
                        key={`${rowIndex}-${colIndex}`} 
                        className={`maze-cell ${getBorderClasses(cell, [rowIndex, colIndex], position, wayPoints, width, height)}`}
                    ></div>
                ))
            )}
        </div>
    </div>
    )
});

const getBorderClasses = (cellValue: number, cellPosition: [number, number], playerPos: [number, number], wayPoints: {[key: number]: number}, width: number, height: number) => {
    const N = 1, S = 2, E = 4, W = 8;
    const cellUid: number = GetCellUid(cellPosition, width, height);
    const hidden: boolean = isHidden(cellPosition, playerPos);
    return [
        (cellValue & N) === 0 ? 'border-top' : '',
        (cellValue & W) === 0 ? 'border-left' : '',
        // If we are at the border right or border bottom we need to add the border
        (cellPosition[0] === height - 1) ? 'border-bottom' : '',
        (cellPosition[1] === width - 1) ? 'border-right' : '',
        (cellPosition[0] === height - 1 && cellPosition[1] === width - 1) ? 'end-cell' : '',
        hidden ? 'hidden-cell' : '',
        (cellPosition[0] === playerPos[0] && cellPosition[1] === playerPos[1]) ? 'player-cell' : '',
    ].join(' ');
};

const GetCellUid = (cellPosition: [number, number], width: number, height: number): number => {
    if (cellPosition[0] < 0 || cellPosition[0] >= height || cellPosition[1] < 0 || cellPosition[1] >= width) {
        throw new Error('Cell position out of bounds');
    }
    return cellPosition[0] * width + cellPosition[1];
}

const isHidden = (cellPosition: [number, number], playerPos: [number, number]): boolean => {

    //We are hidden if we are further than 3 cells away from the player
    const distance = Math.abs(cellPosition[0] - playerPos[0]) + Math.abs(cellPosition[1] - playerPos[1]);
    return distance > 2;
}

export default Maze;