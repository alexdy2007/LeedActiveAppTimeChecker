

import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import {Tooltip} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {getSportCenterNameGivenCode} from '../data/ActiveCodes';


const stickyCol = {
    position: 'sticky',
    left: 0,
    backgroundColor: 'background.paper',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    borderRight: 1,
    borderRightColor: 'divider',
};

const cellSx = {
    px: { xs: 0.75, sm: 2 },
    py: { xs: 0.25, sm: 0.75 },
};

export default function SportTimeTable(props) {

    let tabledata = props.tableData
    let sportCenter = props.sportCenters

    if (sportCenter.length === 0) {
        return null
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: { xs: '70vh', md: '75vh' }, overflowX: 'auto' }}>
                <Table size="small" stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{ ...cellSx, ...stickyCol, zIndex: 3 }}>Time</TableCell>
                            {sportCenter.map((center) => (
                                <TableCell
                                    key={center}
                                    align="center"
                                    sx={{
                                        ...cellSx,
                                        fontWeight: 600,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        minWidth: { xs: 72, sm: 110 },
                                        lineHeight: 1.2,
                                        verticalAlign: 'bottom',
                                    }}
                                >
                                    {getSportCenterNameGivenCode(center)}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tabledata.map((row, rowIndex) => (
                            <TableRow key={rowIndex} hover>
                                {row.map((slot, i) => (
                                    i === 0 ?
                                    <TableCell key={i} align='left' sx={{ ...cellSx, ...stickyCol, zIndex: 1 }}>{slot}</TableCell> :
                                    <TableCell key={i} align='center' sx={cellSx}>{slot['available']===1 ?
                                        <Tooltip title={slot['courts'].join(', ')} enterTouchDelay={0}>
                                            <IconButton
                                                color='success'
                                                component={Link}
                                                href={`https://activeleeds.gladstonego.cloud/book/calendar/${slot['siteRef']}?activityDate=${slot['startTimeRef']}`}
                                                aria-label="Book this slot"
                                            >
                                                <DoneRoundedIcon/>
                                            </IconButton>
                                        </Tooltip>:
                                        <IconButton disabled aria-label="Unavailable">
                                            <CloseRoundedIcon/>
                                        </IconButton>}
                                    </TableCell>
                                    ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

}
