import EventEmitter from "events";

//================================//
class EventSystem extends EventEmitter {
    public static m_instance: EventSystem;

    //================================//
    constructor() {
        super();
    }

    //================================//
    public static Subscribe(_event: string, _callback: (...args: any[]) => void): void {
        if (EventSystem.m_instance == null) {
            EventSystem.m_instance = new EventSystem();
        }

        EventSystem.m_instance.on(_event, _callback);
    }

    //================================//
    public static Unsubscribe(_event: string, _callback: (...args: any[]) => void): void {
        if (EventSystem.m_instance == null) {
            return;
        }

        EventSystem.m_instance.off(_event, _callback);
    }

    //================================//
    public static Emit(_event: string, ..._args: any[]): void {
        if (EventSystem.m_instance == null) {
            return;
        }

        EventSystem.m_instance.emit(_event, _args);
    }
}

export default EventSystem;