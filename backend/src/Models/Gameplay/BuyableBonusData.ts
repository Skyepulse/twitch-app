import { IT_BuyableBonus, BonusDictionary } from "../../Interfaces/IT_BuyableBonus";
import fs from 'fs';
import chalk from "chalk";

//================================//
export class BuyableBonusData {
    //------------Members-------------//
    private static m_instance: BuyableBonusData;
    private m_bonusDictionary: BonusDictionary = {};
    private m_nameToIdDictionary: { [name: string] : number} = {};

    //================================//
    public static initialize(_jsonFilePath: string) {
        if (this.m_instance) {
            console.error(chalk.red('BuyableBonusData already initialized'));
            return;
        }

        this.m_instance = new BuyableBonusData(_jsonFilePath);
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

            this.m_nameToIdDictionary[type] = id;

            this.m_bonusDictionary[id] = levels.map((level: any) => ({
                level: level.level,
                data: {
                    ...level,
                    id
                }
            }));
        });
    }

    //================================//
    public static getBonusLevelById<T extends IT_BuyableBonus>(id: number, level: number): T | null {
        const levels = this.m_instance.m_bonusDictionary[id];
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

    //================================//
    public static getBonusLevelByName<T extends IT_BuyableBonus>(name: string, level: number): T | null {
        const id = this.m_instance.m_nameToIdDictionary[name];
        if (!id){
            console.error(chalk.red(`No bonus found with name: ${name}`));
            return null;
        }

        return this.getBonusLevelById(id, level);
    }

    //================================//
    public static getBonusInfoText(bonusesInfo: { bonus_id: number, bonus_level: number }[]): string {
        let result = '';

        for (const [name, id] of Object.entries(this.m_instance.m_nameToIdDictionary)) {
            const bonusInfo = bonusesInfo.find(info => info.bonus_id === id);
            const levels = this.m_instance.m_bonusDictionary[id];

            if (!bonusInfo) {
                const initialLevel = levels.find(levelData => levelData.level === 1);
                if (initialLevel) {
                    result += `${name} [ID ${id}]: Level 1, Price: ${initialLevel.data.cost}\n`;
                }
            } else {
                const currentLevel = bonusInfo.bonus_level;
                const nextLevel = levels.find(levelData => levelData.level === currentLevel + 1);

                if (nextLevel) {
                    result += `${name} [ID ${id}]: Level ${currentLevel + 1}, Price: ${nextLevel.data.cost}\n`;
                } else {
                    result += `${name} [ID ${id}]: You have reached max level\n`;
                }
            }
        }

        return result;
    }
}