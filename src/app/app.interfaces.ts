export interface Client {
    client_id:          number;
	client_name:        string;

    address_id?:        number; 
	cnpj?:              string; 
 
    status?:            Status;
    users?:             User[];
    voyages?:           Voyage[];
    staff?:             Person[];
    devices?:           Vessel[];
};


export interface Person {
	client_id:           number;
	person_id?:          number;
	person_name?:        string;
    address_id?:         number; 
    master?:             boolean;

	cpf?:                string;
	pis?:                string;
	birthday?:           Date;
    
	rgi_number?:         string;
	rgi_issuer?:         string;
	rgi_issued?:         Date;
	rgi_expire?:         Date;

	ric_number?:         string;
	ric_issued?:         Date;
	ric_expire?:         Date;

	rgp_number?:         string;
	rgp_permit?:         number;
	rgp_issued?:         Date;
	rgp_expire?:         Date;
    created_at?:         Date;
};


export interface Vessel {
    client_id:           number;
    vessel_id?:          number;
    vessel_name?:        string;
    esn?:                string;
    tank_capacity?:      number;
    insc_number?:        number;
    insc_issued?:        Date;
    insc_expire?:        Date;
    crew_number?:        number;
    draught_min?:        number;
    draught_max?:        number;
    ship_breadth?:       number;
    ship_lenght?:        number;
    created_at?:         Date;
};

export interface Scape {
    client_id:           number;
    client_name?:        string;
    vessel_id?:          number;
    vessel_name?:        string;
    esn?:                string;
    lat?:                number;
    lon?:                number;
    sog?:                number;
    head?:               number;
    lastseen?:           Date;
}


export interface Voyage {
    voyage_id?:          number;
    voyage_desc?:        string;
    ata?:                Date;
    atd?:                Date;
    vessel_id?:          number;
    status_id?:          number;
    fishingtype_id?:     number;
    target_fish_id?:     number;
    master_id?:          number;    
    crew?:               Crew[]; 
    lances?:             Lance[]; 
    vessel?:             Vessel;
    created_at?:         Date;
};


export interface Lance {
	voyage_id:          number;
 	lance_id?:           number;
	fish_id?:            number;
	weight?:             number;
	winddir_id?:         number;
	wind_id?:            number;
    temp?:               number;
    depth?:              number;
    lat?:                number;
    lon?:                number;
    lance_start?:        Date;
    lance_end?:          Date;
	created_at?:         Date;
};


export interface Crew {
    voyage_id?:         number;
    person_id?:         number;
//    editing?:           boolean; 
};


export interface WindDir {
    winddir_id:         number;
    windir_desc:        string;
};


export interface Wind {
    wind_id:            number;
    wind_desc:          string;
};


export interface Fish {
    fish_id:            number;
	fish_name:          string;    
    fishingtype_id:     number;
};


export interface FishingType {
    fishingtype_id:     number;
	fishingtype_desc:   string;    
};


export interface Address {
    address_id:         number; 
    logradouro:         string; 
    numeral:            string; 
    complemento:        string; 
    cep:                string; 
    cidade:             string; 
    estado:             string;     
};


export interface Area {
    geometry_id:        number;
    geometry_name:      string;
    
};


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
};


export interface Status { 
    fleet:      number;
    dock:       number;
    miss:       number;
    lost:       number;
    sail:       number;
};
