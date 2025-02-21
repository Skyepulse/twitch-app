import { MazeGenerator, MazeInfo } from "./MazeGenerator";

//================================//
export class MazeManager {
    //================================//
    private static m_instance: MazeManager;

    //================================//    
    private mazeGenerator: MazeGenerator;
    private currentMazeInfo: MazeInfo | null = null;
    private currentPlayPosition: [number, number] = [0, 0];

    //================================//
    private MazeValue(x: number, y: number): number {
        if (this.currentMazeInfo == null) return 0;

        return this.currentMazeInfo.grid[y][x];
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
    public static GetMazeInfo(): MazeInfo | null {
        if ( MazeManager.m_instance == null ) return null;

        return MazeManager.m_instance.currentMazeInfo;
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
}