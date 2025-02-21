import { MyTwitchDBEndpoint } from "../MyTwitchDBEndpoint.js";

//================================//
export class AutoClickerManager{
    private m_activeAutoClickers : Map<string, { interval: NodeJS.Timeout; remainingTime: number }> = new Map();
    private static m_instance: AutoClickerManager;

    //================================//
    private constructor() {
    }

    //================================//
    public static Init(): void {
        if (AutoClickerManager.m_instance == null) {
            AutoClickerManager.m_instance = new AutoClickerManager();
        }
    }

    //================================//
    public static setOrResetAutoClicker(user_id: string, frequency: number, duration: number, points: number)
    {
        if ( this.m_instance == null ) {
            this.Init();
        }

        if (this.m_instance.m_activeAutoClickers.has(user_id)) {
            this.m_instance.clear(user_id);
        }

        const remainingTime = duration;
        const interval = setInterval(() => {
            const userEntry = this.m_instance.m_activeAutoClickers.get(user_id);
            if (!userEntry) {
                return;
            }
            MyTwitchDBEndpoint.AddClick(user_id, points);

            userEntry.remainingTime -= frequency;

            if (userEntry.remainingTime <= 0) {
                this.m_instance.clear(user_id);
            }
        }, frequency * 1000);

        this.m_instance.m_activeAutoClickers.set(user_id, { interval, remainingTime });
    }

    //================================//
    protected clear(userId: string) {
        const userEntry = this.m_activeAutoClickers.get(userId);
        if (userEntry) {
            clearInterval(userEntry.interval);
            this.m_activeAutoClickers.delete(userId);
        }
    }

    //================================// 
    protected clearAll() {
        for (const userId of this.m_activeAutoClickers.keys()) {
            this.clear(userId);
        }
    }
}