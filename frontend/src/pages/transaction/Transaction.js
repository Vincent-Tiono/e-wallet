import {
  Card,
  Container,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { sentenceCase } from 'change-case';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Iconify from '../../components/iconify';
import Label from '../../components/label';
import Scrollbar from '../../components/scrollbar';
import AuthService from '../../services/AuthService';
import HttpService from '../../services/HttpService';
import TransactionListHead from './TransactionListHead';

const TABLE_HEAD = [
  { id: 'fromWallet', label: 'Sender', alignRight: false, firstColumn: true },
  { id: 'toWallet', label: 'Receiver', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: true },
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'createdAt', label: 'Time of Transaction', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

export default function Transaction() {
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const userId = AuthService.getCurrentUser()?.id;
    console.log('Fetching transactions for user:', userId);
    HttpService.getWithAuth(`/transactions/users/${userId}`)
      .then((response) => {
        console.log('Received transactions data:', response);
        if (response?.content && Array.isArray(response.content)) {
          setData(response.content);
        } else {
          console.error('Invalid response format:', response);
          enqueueSnackbar('Invalid data format received from server', { variant: 'error' });
          setData([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
        if (error?.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.data?.errors) {
          error.response?.data?.errors.map((e) => enqueueSnackbar(e.message, { variant: 'error' }));
        } else if (error.response?.data?.message) {
          enqueueSnackbar(error.response?.data?.message, { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
        setData([]);
      });
  };

  return (
    <>
      <Helmet>
        <title> Transactions | e-Transaction </title>
      </Helmet>
      <Container sx={{ minWidth: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h4" gutterBottom>
            My Transactions
          </Typography>
        </Stack>
        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TransactionListHead headLabel={TABLE_HEAD} />
                <TableBody>
                  {data && data.length > 0 ? (
                    data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      console.log('Rendering transaction row:', row);
                      const { id, amount, description, createdAt, fromWallet, toWallet, type, status } = row;
                      const selectedRecord = selected.indexOf(id) !== -1;
                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedRecord}>
                          <TableCell align="left" sx={{ paddingLeft: 5 }}>
                            {`${fromWallet?.user?.firstName || ''} ${fromWallet?.user?.lastName || ''}`}
                          </TableCell>
                          <TableCell align="left">{`${toWallet?.user?.firstName || ''} ${toWallet?.user?.lastName || ''}`}</TableCell>
                          <TableCell align="right">{amount}</TableCell>
                          <TableCell align="left">{description}</TableCell>
                          <TableCell align="left">{createdAt}</TableCell>
                          <TableCell align="left">{type?.name || ''}</TableCell>
                          <TableCell align="left">
                            <Label color={status === 'SUCCESS' ? 'success' : 'warning'}>{sentenceCase(status)}</Label>
                          </TableCell>
                          <TableCell align="right" width="20">
                            <IconButton size="large" color="inherit" onClick={handleOpenMenu}>
                              <Iconify icon={'eva:more-vertical-fill'} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={8} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
