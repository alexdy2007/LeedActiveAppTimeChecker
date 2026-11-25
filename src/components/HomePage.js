import { useState, useEffect } from 'react';
import {generateAuthToken} from '../api/auth';
import { getSportCenters, getSports} from '../data/ActiveCodes';
import { useTheme } from '@mui/material/styles';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
// import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

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
      maxWidth: 'calc(100vw - 32px)',
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
    const [error, setError] = useState(null);

    let defaultStartDate = dayjs()
    const [startDate] = useState(defaultStartDate); // Set default value

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
        if (!('token' in _storage)) {
            setError('Not signed in to Leeds Active yet - retrying...')
            _storage['authStarted'] = true
            generateAuthToken().then((token) => {
                _storage['token'] = token
                setError(null)
                getAvailableTimes()
            }).catch((e) => {
                console.error(e)
                _storage['authStarted'] = false
                setError(e.message)
            })
            return
        }
        let startDatestr = startDate.toISOString()
        getAvailableBookings(sportCenter, sport, startDatestr, _storage['token']).then((raw_data) =>
            {
                if (raw_data !== null) {
                    setError(null)
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
                setError('Could not load availability from Leeds Active.')
            })
    }

    const changeDate = (date) => {
        if (allTimeData[date] !== undefined) {
            let timeOrientedData = makeTimeBasedTableData(allTimeData[date])
            setTableData(timeOrientedData)
            let tableSportCenters= Object.keys(allTimeData[date]).sort()
            setTableSportCenters(tableSportCenters)
        }
        setSelectedDate(date)
    }
    
  
    useEffect(() => {
        if (!('token' in _storage) && !_storage['authStarted']) {
            _storage['authStarted'] = true
            generateAuthToken().then((token) => {
                _storage['token'] = token
                setError(null)
                getAvailableTimes()
            }).catch((e) => {
                console.error(e)
                _storage['authStarted'] = false
                setError(e.message)
            })
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
            <Box sx={{ flexGrow: 1, px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ fontWeight: 700, fontSize: { xs: '1.6rem', sm: '2.125rem' }, mb: 2 }}
                >
                    Leeds Active Sport
                </Typography>

                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel id="sportCenter">Sport Center</InputLabel>
                            <Select
                                labelId="sportCenter"
                                id="sportCenterSelect"
                                multiple
                                value={sportCenter}
                                onChange={handleCenterChange}
                                input={<OutlinedInput id="select-multiple-chip" label="Sport Center" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
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
                    <Grid size={{ xs: 12, sm: 8, md: 4 }}>
                        <FormControl fullWidth>
                            <InputLabel id="sport">Sport</InputLabel>
                            <Select
                                labelId="sport"
                                id="sportSelect"
                                multiple
                                value={sport}
                                onChange={handleSportChange}
                                input={<OutlinedInput id="sport-select-label" label="Sport" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
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
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <Button onClick={getAvailableTimes} variant="contained" size="large" fullWidth>
                            Search
                        </Button>
                    </Grid>
                </Grid>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}

                {availableDates.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            mb: 2,
                            pb: 1,
                            overflowX: 'auto',
                            flexWrap: { xs: 'nowrap', md: 'wrap' },
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {availableDates.map((date) => (
                            <Button
                                key={date}
                                onClick={() => changeDate(date)}
                                color={date === selectedDate ? 'success' : 'inherit'}
                                variant="contained"
                                sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                            >
                                {dayjs(date).format('ddd D MMM')}
                            </Button>
                        ))}
                    </Box>
                )}

                <SportTimeTable tableData={tableData} sportCenters={tableSportCenters}/>
            </Box>
    )

}

export default HomePage;