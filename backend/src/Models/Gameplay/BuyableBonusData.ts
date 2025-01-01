import { IT_BuyableBonus, BonusDictionary } from "../../Interfaces/IT_BuyableBonus";
import fs from 'fs';
import chalk from "chalk";

//================================//
export class BuyableBonusData {
    //------------Members-------------//
    private static _instance: BuyableBonusData;
    private _bonusDictionary: BonusDictionary = {};

    //================================//
    public static initialize(_jsonFilePath: string) {
        if (this._instance) {
            console.error(chalk.red('BuyableBonusData already initialized'));
            return;
        }

        this._instance = new BuyableBonusData(_jsonFilePath);
    }

    //================================//
    protected constructor(_jsonFilePath: string) {
        const data = JSON.parse(fs.readFileSync(_jsonFilePath, 'utf8'));
        this.populateDictionary(data.bonuses);
    }

    //================================//
    private populateDictionary(bonuses: any[]) {
        bonuses.forEach((bonus) => {
            const { id, type, levels } = bonus;

            this._bonusDictionary[id] = levels.map((level: any) => ({
                level: level.level,
                data: {
                    ...level,
                    id
                }
            }));
        });
    }

    //================================//
    public static getBonusLevels<T extends IT_BuyableBonus>(id: number, level: number): T | null {
        const levels = this._instance._bonusDictionary[id];
        if (!levels){
            console.error(chalk.red(`No bonus found with ID: ${id}`));
            return null;
        }

        const bonusLevel = levels.find((levelData) => levelData.level === level);
        if (!bonusLevel){
            console.error(chalk.red(`No bonus level found with ID: ${id} and level: ${level}`));
            return null;
        }
        return bonusLevel.data as T;
    }
}