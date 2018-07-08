export interface User {
    client_id:          number;
    user_id:            number;
    name:               string;
    nickname:           string;
    picture:            string;
    email:              string;
    email_verified:     boolean;
    created_at:         Date;
    updated_at:         Date;
    last_login:         Date;
    last_ip:            string;
    app_metadata?:      any;
    user_metadata?:     any;
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
export interface Client {
    client_id:      number;
    client_name:    string;
    
    users?:          User[];
    devices?:        Device[];
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
export interface Device {
    esn:            string;
    vessel_id:      number;
    client_id:      number;
    vessel_name:    string;
}
