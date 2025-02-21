import fs from 'fs';
import path from 'path';

//==============TRIVIA==================//
// We tackle the randon maze generation problem
// of an n x m grid by using graph theory.
//
// " A maze can be generated by starting with a predetermined arrangement
//  of cells (most commonly a rectangular grid but other arrangements are possible) 
// with wall sites between them. This predetermined arrangement can be considered as a 
// connected graph with the edges representing possible wall sites and the nodes representing cells. 
// The purpose of the maze generation algorithm can then be considered to be making a subgraph in which 
// it is challenging to find a route between two particular nodes.
// If the subgraph is not connected, then there are regions of the graph that are wasted 
// because they do not contribute to the search space. If the graph contains loops, 
// then there may be multiple paths between the chosen nodes. Because of this, maze 
// generation is often approached as generating a random spanning tree. Loops, 
// which can confound naive maze solvers, may be introduced by adding random edges to 
// the result during the course of the algorithm."
//
// Source: https://en.wikipedia.org/wiki/Maze_generation_algorithm
//================================//

// I choose the recursive BackTracking algorithm to generate the maze

//structure containing a grid, a startPosition, and endPosition
export interface MazeInfo {
    grid: number[][];
    startPosition: [number, number];
    endPosition: [number, number];
}

export class MazeGenerator{
    //===============Constants=================//
    private readonly N = 1;
    private readonly S = 2;
    private readonly E = 4;
    private readonly W = 8;
    private readonly DX: { [key: number]: number } = { [this.E]: 1, [this.W]: -1, [this.N]: 0, [this.S]: 0 };
    private readonly DY: { [key: number]: number } = { [this.E]: 0, [this.W]: 0, [this.N]: -1, [this.S]: 1 };
    private readonly OPPOSITE: { [key: number]: number } = { [this.E]: this.W, [this.W]: this.E, [this.N]: this.S, [this.S]: this.N };

    //===============Members=================//
    private grid: number[][] = [];
    private visitOrder: number[][] = [];
    private currentVisitOrder: number = 1;

    //================================//
    private InitializeGrid = (width: number, height: number): void => {
        this.grid = Array.from({ length: height }, () => Array(width).fill(0));
        this.visitOrder = Array.from({ length: height }, () => Array(width).fill(0));
        this.currentVisitOrder = 1;
    }

    //================================//
    private CarvePassageFrom = (currentRow: number, currentColumn: number): void => { 
        this.visitOrder[currentRow][currentColumn] = this.currentVisitOrder
        this.currentVisitOrder++; 

        // Random directions
        const directions = [this.N, this.S, this.E, this.W].sort(() => Math.random() - 0.5);

        directions.forEach((dir) => {
            const nextTile: [number, number] = [currentRow + this.DY[dir], currentColumn + this.DX[dir]];
            if (this.IsValidTile(nextTile)) {
                if (currentRow === 0 && currentColumn === 0) {
                    console.log(dir, this.OPPOSITE[dir]);
                }
                const [nextRow, nextColumn] = nextTile;
                this.grid![currentRow][currentColumn] |= dir;
                this.grid![nextRow][nextColumn] |= this.OPPOSITE[dir];
                this.CarvePassageFrom(nextRow, nextColumn);
            }
        });
    }

    //================================//
    private IsValidTile = ([row, column]: [number, number]): boolean => {
        if (!this.grid || this.grid.length === 0) return false;
        return row >= 0 && row < this.grid.length && column >= 0 && column < this.grid[0].length && this.grid[row][column] === 0;
    }

    //================================//
    private ShowMaze = (grid: number[][]): void => {
        if (!grid || grid.length === 0) {
            console.error("Maze grid is empty, nothing to display.");
            return;
        }

        let mazeString = '';
        const height = grid.length;
        const width = grid[0].length;

        mazeString += width + ' ' + height + '\n';

        const totalCells = width * height;
        const padding = Math.floor(Math.log10(totalCells)) + 1;

        for (let row = 0; row < height; row++) {
            for (let column = 0; column < width; column++) {
                mazeString += grid[row][column].toString().padStart(padding, '0') + ' ';
            }
            mazeString += '\n';
        }

        mazeString += '\n';
        for (let row = 0; row < height; row++) {
            for (let column = 0; column < width; column++) {
                mazeString += this.visitOrder[row][column].toString().padStart(padding, '0') + ' ';
            }
            mazeString += '\n';
        }

        // Save to file
        const mazePath = path.resolve(process.cwd(), 'frontend/public/maze.txt');
        try {
            fs.writeFileSync(mazePath, mazeString);
            console.log(`Maze saved to ${mazePath}`);
        } catch (error: any) {
            console.error(`Error saving maze: ${error.message}`);
        }
    }

    //================================//
    public GenerateRandomMaze = (width: number, height: number, startPos: [number, number], endPos: [number, number], verbose: boolean = false): MazeInfo => {
        if (width <= 0 || height <= 0) {
            console.error("Invalid maze dimensions");
            return {
                grid: [],
                startPosition: [0, 0],
                endPosition: [0, 0]
            };
        }

        if (startPos[0] < 0 || startPos[0] >= height || startPos[1] < 0 || startPos[1] >= width) {
            console.error("Invalid start position");
            return {
                grid: [],
                startPosition: [0, 0],
                endPosition: [0, 0]
            };
        }

        this.InitializeGrid(width, height);
        this.CarvePassageFrom(startPos[0], startPos[1]);
        if (verbose) {
            this.ShowMaze(this.grid!);
        }

        return {
            grid: this.grid,
            startPosition: startPos,
            endPosition: endPos
        };
    }

    //================================//
    public CanMoveLeft(cellValue: number){
        return (cellValue & this.W) === 0;
    }

    //================================//
    public CanMoveRight(cellValue: number){
        return (cellValue & this.E) === 0;
    }

    //================================//
    public CanMoveUp(cellValue: number){
        return (cellValue & this.N) === 0;
    }

    //================================//
    public CanMoveDown(cellValue: number){
        return (cellValue & this.S) === 0;
    }

    //================================//
    public MoveLeft = (position: [number, number]): [number, number] => {
        return [position[0] + this.DY[this.W], position[1] + this.DX[this.W]];
    }

    //================================//
    public MoveRight = (position: [number, number]): [number, number] => {
        return [position[0] + this.DY[this.E], position[1] + this.DX[this.E]];
    }

    //================================//
    public MoveUp = (position: [number, number]): [number, number] => {
        return [position[0] + this.DY[this.N], position[1] + this.DX[this.N]];
    }

    //================================//
    public MoveDown = (position: [number, number]): [number, number] => {
        return [position[0] + this.DY[this.S], position[1] + this.DX[this.S]];
    }
}

//=============TEST===============//
//const mg:MazeGenerator = new MazeGenerator();
//mg.GenerateRandomMaze(30, 40, true);
//================================//