//================================//
export interface IT_BuyableBonus {
    name: string,
    description: string,
    cost: number,
}

//================================//
export interface IBonusLevel<T extends IT_BuyableBonus> {
    level: number;
    data: T;
}

//================================//
export type BonusDictionary = Record<
    number,
    IBonusLevel<any>[]
>;