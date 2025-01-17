

import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default function SportTimeTable(props) {

    let tabledata = props.tableData
    let sportCenter = props.sportCenters

    return (
        <TableContainer component={Paper}>
        <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
            <TableRow>
                <TableCell align="left">Time</TableCell>
                    {sportCenter.map((center) => (
                    <TableCell align="left">{center}</TableCell>
                    ))}
            </TableRow>
            </TableHead>
            <TableBody>
                {tabledata.map((row) => (
                    <TableRow key={row}>
                        {row.map((slot, i) => (
                            i === 0 ? 
                            <TableCell align='left'>{slot}</TableCell> :
                            <TableCell align='left'>{slot['available']}</TableCell>
                            ))}
                    </TableRow>
                ))}
            
            </TableBody>
        </Table>
        </TableContainer>
    );

}