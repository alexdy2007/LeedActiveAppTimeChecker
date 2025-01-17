let sportCenterCodes = {
    'Airebrough':'AIRE',
    'Armley':'ARML',
    'Fearnville':'FEAR',
    'Garforth':'GARF',
    'Holt Park':'HOLT',
    'John Charles':'JCCS',
    'Kippax':'KIPP',
    'Kirkstall':'KIRK',
    'Scott Hall':'SCOT',
    'Pudsey':'PUDS',
}

let sportCodes = {
    'badminton': 'ACT00001'
}

export const getSportCenters = () => { return Object.keys(sportCenterCodes)};
export const getSports= () => { return Object.keys(sportCodes)};

export const getLocationCodeGivenName = (name) => {
    return sportCenterCodes[name];
};

export const getGeneratedSportCode = (sports_center, sport) =>{
    if (sports_center.split(' ').length > 1){
        return sports_center = sports_center.split(' ').map((w) => w[0]).join("").toUpperCase() + sportCodes[sport];
    }else{
        return getLocationCodeGivenName(sports_center).slice(0,2) + sportCodes[sport];
    }
}