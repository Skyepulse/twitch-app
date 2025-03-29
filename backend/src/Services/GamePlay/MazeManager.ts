import { MazeGenerator, MazeInfo } from "./MazeGenerator.js";
import Deque from "../../Utils/Deque.js";
import { MazeMove } from "../../Interfaces/GameplayObjects/MazeMove.js";
import { MyTwitchDBEndpoint } from "../MyTwitchDBEndpoint.js";


//================================//
export class MazeManager {
    //================================//
    private static m_instance: MazeManager;
    public static readonly REQUEST_MOVE_TIME: number = 5.0;

    //================================//    
    private mazeGenerator: MazeGenerator;
    private currentMazeInfo: MazeInfo | null = null;
    private currentPlayPosition: [number, number] = [0, 0];
    private playerParticipationDictionary: { [key: string]: number } = {};
    private playerChoiceDictionary: Deque<MazeMove> | undefined;
    private onWaypoint: boolean = false;

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
        this.playerChoiceDictionary = new Deque<MazeMove>();
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

        MazeManager.m_instance.currentMazeInfo = this.m_instance.GenerateRandomMaze(width, height, [0, 0], [height-1, width-1]);
        MazeManager.m_instance.currentPlayPosition = [0, 0];
        MazeManager.m_instance.playerChoiceDictionary = new Deque<MazeMove>();
        MazeManager.m_instance.playerParticipationDictionary = {};
    }

    //================================//
    public static Left(): boolean {
        if ( MazeManager.m_instance == null ) return false;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return false;

        if ( MazeManager.m_instance.mazeGenerator.CanMoveLeft(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.currentPlayPosition = MazeManager.m_instance.mazeGenerator.MoveLeft(MazeManager.m_instance.PlayerPosition());
            this.UpdateParticipation("L");
        }
        
        return MazeManager.m_instance.CheckWinCondition();
    }

    //================================//
    public static Right(): boolean {
        if ( MazeManager.m_instance == null ) return false;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return false;

        if ( MazeManager.m_instance.mazeGenerator.CanMoveRight(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.currentPlayPosition = MazeManager.m_instance.mazeGenerator.MoveRight(MazeManager.m_instance.PlayerPosition());
            this.UpdateParticipation("R");
        }

        return MazeManager.m_instance.CheckWinCondition();
    }

    //================================//
    public static Up(): boolean {
        if ( MazeManager.m_instance == null ) return false;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return false;

        if ( MazeManager.m_instance.mazeGenerator.CanMoveUp(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.currentPlayPosition = MazeManager.m_instance.mazeGenerator.MoveUp(MazeManager.m_instance.PlayerPosition());
            this.UpdateParticipation("U");
        }

        return MazeManager.m_instance.CheckWinCondition();
    }

    //================================//
    public static Down(): boolean {
        if ( MazeManager.m_instance == null ) return false;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return false;

        if ( MazeManager.m_instance.mazeGenerator.CanMoveDown(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.currentPlayPosition = MazeManager.m_instance.mazeGenerator.MoveDown(MazeManager.m_instance.PlayerPosition());
            this.UpdateParticipation("D");
        }

        return MazeManager.m_instance.CheckWinCondition();
    }

    //================================//
    public static GetMazeInfo(): { grid: number[][], start: [number, number], end: [number, number], playerPos: [number, number], wayPoints: {[key: number]: number} } | null {
        if ( MazeManager.m_instance == null ) return null;

        return { grid: MazeManager.m_instance.currentMazeInfo!.grid, start: MazeManager.m_instance.currentMazeInfo!.startPosition, end: MazeManager.m_instance.currentMazeInfo!.endPosition, playerPos: MazeManager.m_instance.currentPlayPosition, wayPoints: MazeManager.m_instance.currentMazeInfo!.waypoints };
    }

    //================================//
    public static GetPlayerPosition(): [number, number] {
        if ( MazeManager.m_instance == null ) return [0, 0];

        return MazeManager.m_instance.currentPlayPosition;
    }

    //================================//
    public CheckWinCondition(): boolean {
        const win = this.currentPlayPosition[0] === this.currentMazeInfo!.endPosition[0] && this.currentPlayPosition[1] === this.currentMazeInfo!.endPosition[1];
        if (win) {
            this.AddPointsPerParticipation(1);
        }
        return win;
    }

    //================================//
    public static HasMaze(): { b: boolean, won: boolean, onWaypoint: boolean } {
        if ( MazeManager.m_instance == null ) return { b: false, won: false, onWaypoint: false };
        if ( MazeManager.m_instance.currentMazeInfo == null ) return { b: false, won: false, onWaypoint: false };

        return { b: true, won: MazeManager.m_instance.CheckWinCondition(), onWaypoint: MazeManager.m_instance.onWaypoint };
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
    public static AddLeft(player_id: string): void {
        if ( MazeManager.m_instance == null ) return;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return;

        if ( !MazeManager.m_instance.playerChoiceDictionary?.items.some(move => move.id === player_id)){
            MazeManager.m_instance.playerChoiceDictionary?.pushFront({id: player_id, direction: "L"});
        }

        if ( MazeManager.m_instance.mazeGenerator.CanMoveLeft(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.leftCount++;
        }
    }

    //================================//
    public static AddRight(player_id: string): void {
        if ( MazeManager.m_instance == null ) return;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return;
        if ( !MazeManager.m_instance.playerChoiceDictionary?.items.some(move => move.id === player_id)){
            MazeManager.m_instance.playerChoiceDictionary?.pushFront({id: player_id, direction: "R"});
        }
        if ( MazeManager.m_instance.mazeGenerator.CanMoveRight(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.rightCount++;
        }
    }

    //================================//
    public static AddUp(player_id: string): void {
        if ( MazeManager.m_instance == null ) return;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return;
        if ( !MazeManager.m_instance.playerChoiceDictionary?.items.some(move => move.id === player_id)){
            MazeManager.m_instance.playerChoiceDictionary?.pushFront({id: player_id, direction: "U"});
        }
        if ( MazeManager.m_instance.mazeGenerator.CanMoveUp(MazeManager.m_instance.MazeValue(...MazeManager.m_instance.PlayerPosition())) ) {
            MazeManager.m_instance.upCount++;
        }
    }

    //================================//
    public static AddDown(player_id: string): void {
        if ( MazeManager.m_instance == null ) return;
        if ( MazeManager.m_instance.currentMazeInfo == null ) return;
        if ( !MazeManager.m_instance.playerChoiceDictionary?.items.some(move => move.id === player_id)){
            MazeManager.m_instance.playerChoiceDictionary?.pushFront({id: player_id, direction: "D"});
        }
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
                break;
            case "right":
                MazeManager.Right();
                break;
            case "up":
                MazeManager.Up();
                break;
            case "down":
                MazeManager.Down();
                break;
        }

        MazeManager.resetValues();

        return true;
    }

    //================================//
    public static UpdateParticipation(direction: "L" | "U" | "D" | "R"): void {
        if (MazeManager.m_instance == null ) return;
        if (MazeManager.m_instance.playerChoiceDictionary == undefined) return;

        let safeExit: number = 0;
        let top5: number = 0;

        const isWaypoint: number = this.isWaypoint();
        MazeManager.m_instance.onWaypoint = isWaypoint > 0 ? true : false;

        while ( !MazeManager.m_instance.playerChoiceDictionary.isEmpty() && safeExit < 10000)
        {
            const move: MazeMove | undefined = MazeManager.m_instance.playerChoiceDictionary.popBack();
            
            if ( move != undefined && move.direction === direction)
            {
                const points: number = top5 < 5 ? 5: 1;
                if ( !(move.id in MazeManager.m_instance.playerParticipationDictionary))
                {
                    MazeManager.m_instance.playerParticipationDictionary[move.id] = points;
                }
                else
                {
                    MazeManager.m_instance.playerParticipationDictionary[move.id]+= points;
                }
                top5++;

                if (isWaypoint > 0)
                {
                    MazeManager.m_instance.AddWaypointPoints(isWaypoint, move.id);
                }
            }
            safeExit++;
        }

        MazeManager.m_instance.playerChoiceDictionary = new Deque<MazeMove>();
    }

    //================================//
    public AddPointsPerParticipation(mult: number): void {
        Object.keys(this.playerParticipationDictionary).forEach( key => 
        {
            const id = key;
            const points = this.playerParticipationDictionary[key];

            MyTwitchDBEndpoint.AddClick(key, points * mult);
        });
        this.playerParticipationDictionary = {};
    }

    //================================//
    public static isWaypoint(): number{
        if (MazeManager.m_instance == null ) return 0;
        if (MazeManager.m_instance.currentMazeInfo == null ) return 0;

        const currentPos = MazeManager.m_instance.PlayerPosition();
        const grid = MazeManager.m_instance.currentMazeInfo.grid;
        const waypoints = MazeManager.m_instance.currentMazeInfo.waypoints;

        let isWaypoint = 0;
        const cellUID = MazeGenerator.GetCellUid(currentPos, grid[0].length, grid.length);

        if (cellUID in waypoints) {
            isWaypoint = waypoints[cellUID];
            // remove the waypoint from the dictionary
            delete waypoints[cellUID];
        }

        return isWaypoint;
    }

    //================================//
    public AddWaypointPoints(points: number, player_id: string): void {
        MyTwitchDBEndpoint.AddClick(player_id, points);
    }
}