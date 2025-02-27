import { MazeGenerator, MazeInfo } from "./MazeGenerator.js";

//================================//
export class MazeManager {
    //================================//
    private static m_instance: MazeManager;
    public static readonly REQUEST_MOVE_TIME: number = 5.0;

    //================================//    
    private mazeGenerator: MazeGenerator;
    private currentMazeInfo: MazeInfo | null = null;
    private currentPlayPosition: [number, number] = [0, 0];

    //================================//
    private leftCount: number = 0;
    private rightCount: number = 0;
    private upCount: number = 0;
    private downCount: number = 0;

    //================================//
    private MazeValue(x: number, y: number): number {
        if (this.currentMazeInfo == null) return 0;

        return this.currentMazeInfo.grid[x][y];
    }

    //================================//
    private PlayerPosition(): [number, number] {
        return this.currentPlayPosition;
    }

    //================================//
    constructor() {
        this.mazeGenerator = new MazeGenerator();
    }

    //================================//
    private static Init(): void {
        if (MazeManager.m_instance == null) {
            MazeManager.m_instance = new MazeManager();
        }
    }

    //================================//
    public GenerateRandomMaze = (width: number, height: number, start: [number, number], end: [number, number], verbose: boolean = false): MazeInfo => {
        return this.mazeGenerator.GenerateRandomMaze(width, height, start, end, verbose);
    }

    //================================//
    public static ResetMaze(width: number, height: number): void {
        if (MazeManager.m_instance == null) {
            MazeManager.Init();
        }

        MazeManager.m_instance.currentMazeInfo = this.m_instance.GenerateRandomMaze(width, height, [0, 0], [width-1, height-1]);
        MazeManager.m_instance.currentPlayPosition = [0, 0];
    }

    //================================//
    public static Left(): boolean {
        if ( MazeManager.m_instance == null ) return false;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return false;

        if ( MazeManager.m_instance.mazeGenerator.CanMoveLeft(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.currentPlayPosition = MazeManager.m_instance.mazeGenerator.MoveLeft(MazeManager.m_instance.PlayerPosition());
        }

        return MazeManager.m_instance.CheckWinCondition();
    }

    //================================//
    public static Right(): boolean {
        if ( MazeManager.m_instance == null ) return false;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return false;

        if ( MazeManager.m_instance.mazeGenerator.CanMoveRight(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.currentPlayPosition = MazeManager.m_instance.mazeGenerator.MoveRight(MazeManager.m_instance.PlayerPosition());
        }

        return MazeManager.m_instance.CheckWinCondition();
    }

    //================================//
    public static Up(): boolean {
        if ( MazeManager.m_instance == null ) return false;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return false;

        if ( MazeManager.m_instance.mazeGenerator.CanMoveUp(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.currentPlayPosition = MazeManager.m_instance.mazeGenerator.MoveUp(MazeManager.m_instance.PlayerPosition());
        }

        return MazeManager.m_instance.CheckWinCondition();
    }

    //================================//
    public static Down(): boolean {
        if ( MazeManager.m_instance == null ) return false;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return false;

        if ( MazeManager.m_instance.mazeGenerator.CanMoveDown(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.currentPlayPosition = MazeManager.m_instance.mazeGenerator.MoveDown(MazeManager.m_instance.PlayerPosition());
        }

        return MazeManager.m_instance.CheckWinCondition();
    }

    //================================//
    public static GetMazeInfo(): { grid: number[][], start: [number, number], end: [number, number], playerPos: [number, number] } | null {
        if ( MazeManager.m_instance == null ) return null;

        return { grid: MazeManager.m_instance.currentMazeInfo!.grid, start: MazeManager.m_instance.currentMazeInfo!.startPosition, end: MazeManager.m_instance.currentMazeInfo!.endPosition, playerPos: MazeManager.m_instance.currentPlayPosition };
    }

    //================================//
    public static GetPlayerPosition(): [number, number] {
        if ( MazeManager.m_instance == null ) return [0, 0];

        return MazeManager.m_instance.currentPlayPosition;
    }

    //================================//
    public CheckWinCondition(): boolean {
        return this.currentPlayPosition[0] === this.currentMazeInfo!.endPosition[0] && this.currentPlayPosition[1] === this.currentMazeInfo!.endPosition[1];
    }

    //================================//
    public static HasMaze(): { b: boolean, won: boolean} {
        if ( MazeManager.m_instance == null ) return { b: false, won: false };
        if ( MazeManager.m_instance.currentMazeInfo == null ) return { b: false, won: false };

        return { b: true, won: MazeManager.m_instance.CheckWinCondition() };
    }

    //================================//
    public static resetValues(): void {
        if ( MazeManager.m_instance == null ) return;

        MazeManager.m_instance.leftCount = 0;
        MazeManager.m_instance.rightCount = 0;
        MazeManager.m_instance.upCount = 0;
        MazeManager.m_instance.downCount = 0;
    }

    //================================//
    public static AddLeft(): void {
        if ( MazeManager.m_instance == null ) return;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return;
        if ( MazeManager.m_instance.mazeGenerator.CanMoveLeft(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.leftCount++;
        }
    }

    //================================//
    public static AddRight(): void {
        if ( MazeManager.m_instance == null ) return;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return;
        if ( MazeManager.m_instance.mazeGenerator.CanMoveRight(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.rightCount++;
        }
    }

    //================================//
    public static AddUp(): void {
        if ( MazeManager.m_instance == null ) return;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return;
        if ( MazeManager.m_instance.mazeGenerator.CanMoveUp(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.upCount++;
        }
    }

    //================================//
    public static AddDown(): void {
        if ( MazeManager.m_instance == null ) return;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return;
        if ( MazeManager.m_instance.mazeGenerator.CanMoveDown(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.downCount++;
        }
    }

    //================================//
    public static UpdateRequests(): boolean {
        if ( MazeManager.m_instance == null ) return false;

        const maxNum = Math.max(MazeManager.m_instance.leftCount, MazeManager.m_instance.rightCount, MazeManager.m_instance.upCount, MazeManager.m_instance.downCount);
        if ( maxNum === 0 ) return false;

        //Pick the one with maximum, if multiple pick at random between them
        const maxArray: string[] = [];
        if ( MazeManager.m_instance.leftCount === maxNum ) maxArray.push("left");
        if ( MazeManager.m_instance.rightCount === maxNum ) maxArray.push("right");
        if ( MazeManager.m_instance.upCount === maxNum ) maxArray.push("up");
        if ( MazeManager.m_instance.downCount === maxNum ) maxArray.push("down");

        const randomIndex = Math.floor(Math.random() * maxArray.length);

        switch (maxArray[randomIndex]) {
            case "left":
                MazeManager.Left();
                console.log("Left");
                break;
            case "right":
                MazeManager.Right();
                console.log("Right");
                break;
            case "up":
                MazeManager.Up();
                console.log("Up");
                break;
            case "down":
                MazeManager.Down();
                console.log("Down");
                break;
        }

        MazeManager.resetValues();

        return true;
    }
}