import dayjs from 'dayjs';

const convertToTime= (dateString) => {
    let date = dayjs(dateString);
    return date.format('HH:mm:ss');
};

export const generateHourlyTimes = (dateTimeStr) => {
    let day = dayjs(dateTimeStr).startOf('day');
    let times = [];
    dayjs().startOf('year')
    for (let hour = 6; hour < 22; hour++) {
        let time = day.add(hour, 'hour');
        times.push(time.format('HH:mm:ss'));
    }
    return times;
};

export const getTimes = (sport_time_data) => {
    let times = Set()
    for (let item in sport_time_data){
        for (let location in item.locations){
            for (let slot in location.slots){
                times.add(slot.startTime)
            }
        }
    }
    return times
}

//TODO make date at top of dict

export const processAvailabilityTabular = (sport_time_data, startDateStr) => {
    //Returns a list of dictionaries in following format
    // time x sportcenteravilable
    // i.e [[{available: 1,time:dateJS(00:00:00) courts: ['Sports Hall 2 Court 1']}, {available: 0, time:dateJS(01:00:00), courts: []}, ...], ...]
    
    let siteAvailablity = {};

    for (let item of sport_time_data){
        if (!(item.date in siteAvailablity)){
            siteAvailablity[item.date] = {}
        }
        if (!(item.siteId in siteAvailablity[item.date])){
            siteAvailablity[item.date][item.siteId] = {}
        }
        for (let location of item.locations){
            for (let slot of location.slots){
                let startTime = convertToTime(slot.startTime)
                if (slot['availability']['inCentre'] === 1 && slot['status'] === 'Available'){
                    let slotRefObj = JSON.parse(slot['slotReferences']['inCentre'])
                    siteAvailablity[item.date][item.siteId]['siteRef'] = slotRefObj['ActivityId']
                    if(startTime in siteAvailablity[item.date][item.siteId]){
                        siteAvailablity[item.date][item.siteId][startTime].push(location.locationNameToDisplay)
                    }else{
                        siteAvailablity[item.date][item.siteId][startTime] = [location.locationNameToDisplay]
                    }
                }
            }
        }
    }
    

    let availability_data_full = {};

    if (Object.keys(siteAvailablity).length > 0){

        let hourlyTimes = generateHourlyTimes(startDateStr)

        //Fill in the missing times with empty locations

        Object.keys(siteAvailablity).forEach(availableDate => { 
            let temp_key = (' ' + availableDate).slice(1);
            availability_data_full[temp_key] = []
            for (const time of hourlyTimes) {
                Object.keys(siteAvailablity[availableDate]).forEach(siteId => {
                    if (!(siteId in availability_data_full[availableDate])){
                        availability_data_full[availableDate][siteId] = []
                    }
                    if ((time in siteAvailablity[availableDate][siteId])){
             
                        availability_data_full[availableDate][siteId].push({'available': 1, 'time':time, 'courts': siteAvailablity[availableDate][siteId][time], 'siteRef':siteAvailablity[availableDate][siteId]['siteRef'], 'startTimeRef':dayjs(availableDate).toISOString()});
                    }else{
                        availability_data_full[availableDate][siteId].push({'available': 0, 'time':time, 'courts': []});
                    }
                });
            };
        });
    }

    return availability_data_full
};

export const makeTimeBasedTableData = (tabledata) => {
    ///Returns in format {time:[{availability:1, courts:[]},{avaliability:0},{availability:0}]}
    if (Object.keys(tabledata).length > 0){
        let firstKey = Object.keys(tabledata)[0]; // "used to generate all times"
        let timeOrientedData = tabledata[firstKey].map((item) => [item.time])
        let orderedkeys = Object.keys(tabledata).sort()

        for (let key of orderedkeys){
            let centerData = tabledata[key]
            for (let i = 0; i < centerData.length; i++){
                timeOrientedData[i].push(centerData[i])
            }
        }
        return timeOrientedData
    }
    return []
   
}


export default processAvailabilityTabular;

// a = [{ "activityGroupId": "SPHALL",
//     "activityGroupDescription": "Sports Hall",
//     "id": "ARACT00002",
//     "name": "Badminton: Sph2",
//     "description": "",
//     "description": "", // Description intentionally left empty
//     "imageUrl": null,
//     "inCentre": true,
//     "virtual": false,
//     "siteId": "ARML",
//     "webBookable": true,
//     "webComments": "",
//     "capacity": {
//         "maxInCentreBookees": 1,
//         "maxVirtualBookees": 0
//     },
//     "typeInd": "activity",
//     "slotCount": 22,
//     "groupActivityDetails": {
//         "isGroupActivity": false,
//         "priceLevels": []
//     },
//     "locations": [
//         {
//             "locationNameToDisplay": "Sports Hall 2 Court 1",
//             "locationDetails": [
//                 {
//                     "locationId": "ARZSPH0101",
//                     "locationName": "Sports Hall 2 Court 1"
//                 }
//             ],
//             "slots": [
//                 {
//                     "startTime": "2025-01-16T11:00:00Z",
//                     "endTime": "2025-01-16T11:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T11:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T11:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T12:00:00Z",
//                     "endTime": "2025-01-16T12:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T12:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Available",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T12:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T13:00:00Z",
//                     "endTime": "2025-01-16T13:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T13:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Available",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T13:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T14:00:00Z",
//                     "endTime": "2025-01-16T14:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T14:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Available",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T14:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T15:00:00Z",
//                     "endTime": "2025-01-16T15:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T15:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T15:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T16:00:00Z",
//                     "endTime": "2025-01-16T16:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T16:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T16:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T17:00:00Z",
//                     "endTime": "2025-01-16T17:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T17:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T17:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T18:00:00Z",
//                     "endTime": "2025-01-16T18:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T18:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T18:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T19:00:00Z",
//                     "endTime": "2025-01-16T19:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T19:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T19:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T20:00:00Z",
//                     "endTime": "2025-01-16T20:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T20:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T20:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T21:00:00Z",
//                     "endTime": "2025-01-16T21:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T21:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Available",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T21:00:00Z\",\"ResourceIds\":[\"ARZSPH0101\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 }
//             ],
//             "translations": []
//         },
//         {
//             "locationNameToDisplay": "Sports Hall 2 Court 2",
//             "locationDetails": [
//                 {
//                     "locationId": "ARZSPH0102",
//                     "locationName": "Sports Hall 2 Court 2"
//                 }
//             ],
//             "slots": [
//                 {
//                     "startTime": "2025-01-16T11:00:00Z",
//                     "endTime": "2025-01-16T11:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T11:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T11:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T12:00:00Z",
//                     "endTime": "2025-01-16T12:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T12:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Available",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T12:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T13:00:00Z",
//                     "endTime": "2025-01-16T13:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T13:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Available",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T13:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T14:00:00Z",
//                     "endTime": "2025-01-16T14:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T14:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Available",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T14:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T15:00:00Z",
//                     "endTime": "2025-01-16T15:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T15:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T15:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T16:00:00Z",
//                     "endTime": "2025-01-16T16:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T16:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T16:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T17:00:00Z",
//                     "endTime": "2025-01-16T17:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T17:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T17:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T18:00:00Z",
//                     "endTime": "2025-01-16T18:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T18:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T18:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T19:00:00Z",
//                     "endTime": "2025-01-16T19:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T19:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T19:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T20:00:00Z",
//                     "endTime": "2025-01-16T20:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T20:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Unavailable",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T20:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 },
//                 {
//                     "startTime": "2025-01-16T21:00:00Z",
//                     "endTime": "2025-01-16T21:59:59Z",
//                     "bookableFrom": "2025-01-09T00:00:00Z",
//                     "bookableUntil": "2025-01-16T21:00:00Z",
//                     "availability": {
//                         "inCentre": 1,
//                         "virtual": 0
//                     },
//                     "alertListEnabled": false,
//                     "alertListCount": 0,
//                     "status": "Available",
//                     "slotReferences": {
//                         "inCentre": "{\"BookingId\":0,\"ActivityId\":\"ARACT00002\",\"StartDateTime\":\"2025-01-16T21:00:00Z\",\"ResourceIds\":[\"ARZSPH0102\"],\"InCentre\":true,\"Virtual\":false}",
//                         "virtual": null
//                     }
//                 }
//             ],
//             "translations": []
//         }
//     ],
//     "translations": [],
//     "activityGroupTranslations": [],
//     "tagGroups": []
// }];

