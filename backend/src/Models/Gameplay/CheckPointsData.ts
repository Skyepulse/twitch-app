import { CheckPointData } from "../../Interfaces/GameplayObjects/CheckPoint";
import fs from 'fs';
import chalk from "chalk";

//================================//
export class CheckPointsData{
    private static m_instance: CheckPointsData;
    private m_checkPoints: { [name: string] : { id: number, cap: number } } = {};
    
    //================================//
    public static initialize(_jsonFilePath: string) {
        if (this.m_instance) {
            console.error(chalk.red('CheckPointsData already initialized'));
            return;
        }

        this.m_instance = new CheckPointsData(_jsonFilePath);
    }

    //================================//
    protected constructor(_jsonFilePath: string) {
        const data = JSON.parse(fs.readFileSync(_jsonFilePath, 'utf8'));
        this.populateCheckPoints(data.checkPoints);
    }

    //================================//
    protected populateCheckPoints(checkPoints: CheckPointData[]) {
        checkPoints.forEach((checkPoint) => {
            const { id, name, cap } = checkPoint;
            this.m_checkPoints[name] = { id, cap };
        });
    }

    //================================//
    public static HasCheckPoint(name: string, currentCap: number): boolean {
        const checkPoint = this.m_instance.m_checkPoints[name];
        if (!checkPoint){
            console.error(chalk.red(`No checkpoint found with name: ${name}`));
            return false;
        }

        return currentCap >= checkPoint.cap;
    }
}