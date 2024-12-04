    //================================//
    export interface UserInfo {
        user_id: number;
        username: string;
    }

    //================================//
    export interface FullUserInfo extends UserInfo {
        click_count: number;
    }

    //================================//
    export interface UserClicks {
        user_id: number;
        click_count: number;
    }
    