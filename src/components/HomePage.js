import { useState, useEffect } from 'react';
import {generateAuthToken} from '../api/auth';
import { getSportCenters, getSports } from '../data/ActiveCodes';
import { useTheme } from '@mui/material/styles';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

import getAvailableBookings from '../api/activity';
import SportTimeTable from './SportTimeTable';
import { processAvailabilityTabular, makeTimeBasedTableData } from '../data/SportTimeMapping';


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
    return {
      fontWeight: personName.includes(name)
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
    };
  }

let _storage = {}


const HomePage = (props) => {

    const theme = useTheme();
    const sportCentersList = getSportCenters();
    const sportsList = getSports();

    const [sportCenter, setSportCenter] = useState(sportCentersList); // Set default value
    const [sport, setSport] = useState(['badminton']); // Set default value

    const [allTimeData, setAllTimeData] = useState([]); // Set default value
    const [availableDates, setAvailableDates] = useState([]); // Set default value
    const [selectedDate, setSelectedDate] = useState([]); // Set default value
    const [tableData, setTableData] = useState([]); // Set default value
    const [tableSportCenters, setTableSportCenters] = useState([]); // Set default value

    let defaultStartDate = dayjs()
    const [startDate, setStartDate] = useState(defaultStartDate); // Set default value


    const handleCenterChange = (event) => {
      const {
        target: { value },
      } = event;
      setSportCenter(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
      );
    };

    const handleSportChange = (event) => {
        const {
          target: { value },
        } = event;
        setSport(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
      };

    const getAvailableTimes = () => {
        let startDatestr = startDate.toISOString()
        getAvailableBookings(sportCenter, sport, startDatestr, _storage['token']).then((raw_data) =>
            {
                if (raw_data !== null) {
                    let allTableData = processAvailabilityTabular(raw_data, startDatestr)
                    let availableDates = Object.keys(allTableData)
                    setAvailableDates(availableDates)
                    setSelectedDate(availableDates[0])
                    setAllTimeData(allTableData)
                    let timeOrientedData = makeTimeBasedTableData(allTableData[availableDates[0]])
                    setTableData(timeOrientedData)
                    let tableSportCenters= Object.keys(allTableData[availableDates[0]]).sort()
                    setTableSportCenters(tableSportCenters)
                }
            }).catch((e) => {
                console.error(e)
            })
    }

    const changeDate = (date) => {
        if (allTimeData[date] !== undefined) {
            let timeOrientedData = makeTimeBasedTableData(allTimeData[date])
            setTableData(timeOrientedData)
            let tableSportCenters= Object.keys(allTimeData[availableDates[0]]).sort()
            setTableSportCenters(tableSportCenters)
        }
        setSelectedDate(date)
    }
    
  
    useEffect(() => {
        if (!('token' in _storage)) {
            generateAuthToken().then((token) => {
                _storage['token'] = token
            })
        }
    });

    return (

        <Paper elevation={1} sx={{ m:'1', height:'100%'}}>
            <h1>Leeds Active Sport</h1>

            <Box sx={{ flexGrow: 1, m: '2%'}}> 
                <Grid container spacing={1}>
                    <Grid item xs={6} md={3}>
                        <FormControl sx={{ m: 1, width:500}}>
                            <InputLabel id="sportCenter">Sport Center</InputLabel>
                                <Select fullWidth
                                    labelId="sportCenter"
                                    id="sportCenterSelect"
                                    multiple
                                    value={sportCenter}
                                    onChange={handleCenterChange}
                                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
)}
                                    MenuProps={MenuProps}
                                    inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                    {sportCentersList.map((name) => (
                                        <MenuItem
                                            key={name}
                                            value={name}
                                            style={getStyles(name, sportCenter, theme)}
                                            >
                                        {name}
                                        </MenuItem>
                                    ))}
                                </Select> 
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <FormControl sx={{ m: 1, width:300}}>
                        <InputLabel id="sport">Sport</InputLabel>
                        <Select fullWidth
                                labelId="Sport"
                                id="Sport"
                                multiple
                                value={sport}
                                onChange={handleSportChange}
                                input={<OutlinedInput id="sport-select-label" label="Chip" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                                >
                                {sportsList.map((name) => (
                                    <MenuItem
                                        key={name}
                                        value={name}
                                        style={getStyles(name, sport, theme)}
                                    >
                                    {name}
                                    </MenuItem>
                                ))}
                        </Select> 
                        </FormControl>
                    </Grid>
                    <Grid item xs={4} md={2} sx={{ m: 1}}>
                        <Button onClick={getAvailableTimes} variant="contained">Search</Button>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ flexGrow: 1, m: '2%'}}> 
                <Grid container spacing={1}>
                    {availableDates.map((date) => (
                        <Grid item xs={1} md={1} sx={{ m: 1}}>
                            <Button onClick={() => changeDate(date)} color={date==selectedDate ? 'success' : ''} variant="contained">{dayjs(date).format('DD/MM/YYYY')}</Button>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            
            <Box sx={{ flexGrow: 1, m: '3%'}}>
                <SportTimeTable tableData={tableData} sportCenters={tableSportCenters}/>
            </Box>
        </Paper>
    )

}

export default HomePage;