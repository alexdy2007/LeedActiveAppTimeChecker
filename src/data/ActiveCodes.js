let sportCenterCodes = {
    'Airebrough':'AIRE',
    'Armley':'ARML',
    'Fearnville':'FEAR',
    'Garforth':'GARF',
    'Holt Park':'HOLT',
    'Kippax':'KIPP',
    'Scott Hall':'SCOT',
    'Pudsey':'PUDS',
    'Middleton':'MIDD',
    'Morley':'MORL',
}

let reversedSportCenterCodes = {
    'AIRE': 'Airebrough',
    'ARML': 'Armley',
    'FEAR': 'Fearnville',
    'GARF': 'Garforth',
    'HOLT': 'Holt Park',
    'KIPP': 'Kippax',
    'SCOT': 'Scott Hall',
    'PUDS': 'Pudsey',
    'MIDD': 'Middleton',
    'MORL': 'Morley',
};


let sportCodes = {
    'badminton': {'basecode':'ACT00001', 'Kippax':'KX'}
}

export const getSportCenters = () => { return Object.keys(sportCenterCodes)};
export const getSports= () => { return Object.keys(sportCodes)};

export const getSportCenterNameGivenCode = (code) => {return reversedSportCenterCodes[code]};

export const getLocationCodeGivenName = (sportsCenter) => {
    return sportCenterCodes[sportsCenter];
};

export const getGeneratedSportCode = (sportsCenter, sport) =>{

    if (sportsCenter in sportCodes[sport]){
        return sportCodes[sport][sportsCenter] + sportCodes[sport]['basecode'];
    }

    if (sportsCenter.split(' ').length > 1){
        return sportsCenter.split(' ').map((w) => w[0]).join("").toUpperCase() + sportCodes[sport]['basecode'];
    }else{
        return getLocationCodeGivenName(sportsCenter).slice(0,2) + sportCodes[sport]['basecode'];
    }
}


