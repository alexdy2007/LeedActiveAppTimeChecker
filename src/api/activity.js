

import { getLocationCodeGivenName, getGeneratedSportCode } from '../data/ActiveCodes';

// This function is used to get the available bookings for a given sports center, activity, date
export const getAvailableBookings = async (sports_centers, sport, date_from, auth_token) => {

    // https://activeleeds.gladstonego.cloud/api/availability/V2/sessions?webBookableOnly=true&siteIds=AIRE,ARML,FEAR&activityIds=AIACT00001,FEACT00001&dateFrom=2025-01-16T23:06:00.000Z


    const generateUrlsGivenSites= (sportCenterList, dateFromStr) => {
        let urls = []
        for(let i = 0; i < sportCenterList.length; i+=3){
            let sportCenterTrio = sportCenterList.slice(i, i+3)
            let siteCodesCombined = sportCenterTrio.map((center) => center[0]).join(',')
            let sportCodesCombined = sportCenterTrio.map((center) => center[1]).join(',')
            let url = `https://activeleeds.gladstonego.cloud/api/availability/V2/sessions?webBookableOnly=true&siteIds=${siteCodesCombined}&activityIds=${sportCodesCombined}&dateFrom=${dateFromStr}`
            urls.push(url)
        }
        return urls
    }


    if (sports_centers === null || sport === null || sport.length===0 || date_from === null || auth_token === null) {
        alert('Please fill in all the fields: sports_center, sport, date_from')
        return []
    }

    let sportCenterList = []
    for (let center of sports_centers){
        let site_id = getLocationCodeGivenName(center)
        let sport_id = getGeneratedSportCode(center, sport[0])
        sportCenterList.push([site_id, sport_id])
    }

    let date_from_iso = date_from
    let urls = generateUrlsGivenSites(sportCenterList, date_from_iso)

    let headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "authorization": `Bearer ${auth_token}`,
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
    }
    

    let requests = urls.map(async (url) => {
        return fetch(url, {
            method: 'GET',
            headers: headers
        }).then( async (res) => {
            let data =  await res.json()
            return data
        }).catch((e) => {
            console.error(e)
            throw new Error(e, 'Error fetching data')
        })
 
    })

    let response_data = []

    return Promise.all(requests)
    .then((responses) => {
        return responses.flat(1)
    });
    
}



export default getAvailableBookings;