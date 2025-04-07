import {
  Button,
  Card,
  Container,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import AuthService from '../../services/AuthService';
import HttpService from '../../services/HttpService';
import WalletListHead from './WalletListHead';

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false, firstColumn: true },
  { id: 'balance', label: 'Balance', alignRight: false },
  { id: 'userId', label: 'User', alignRight: false },
  { id: 'iban', label: 'IBAN', alignRight: false },
  { id: '' },
];

export default function Wallet() {
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

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

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchData();
  }, []);

  const fetchData = () => {
    const userId = AuthService.getCurrentUser()?.id;
    console.log('Fetching data for user ID:', userId);
    HttpService.getWithAuth(`/wallets/users/${userId}`)
      .then((response) => {
        console.log('Received wallet data:', response);
        setData(response);
        console.log('Data state after setting:', data);
      })
      .catch((error) => {
        console.error('Error fetching wallets:', error);
        if (error?.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.data?.errors) {
          error.response?.data?.errors.map((e) => enqueueSnackbar(e.message, { variant: 'error' }));
        } else if (error.response?.data?.message) {
          enqueueSnackbar(error.response?.data?.message, { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  console.log('Current data in render:', data);

  return (
    <>
      <Helmet>
        <title> Wallets | e-Wallet </title>
      </Helmet>
      <Container sx={{ minWidth: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h4" gutterBottom>
            My Wallets
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => navigate('/wallets/new')}
          >
            New Wallet
          </Button>
        </Stack>
        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <WalletListHead headLabel={TABLE_HEAD} />
                <TableBody>
                  {data && data.length > 0 ? (
                    data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      console.log('Rendering row:', row);
                      const { id, name, balance, user, iban } = row;
                      const selectedRecord = selected.indexOf(name) !== -1;
                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedRecord}>
                          <TableCell align="left" sx={{ paddingLeft: 5 }}>
                            {name}
                          </TableCell>
                          <TableCell align="left">{balance}</TableCell>
                          <TableCell align="left">{user.fullName}</TableCell>
                          <TableCell align="left">{iban}</TableCell>
                          <TableCell align="right">
                            <IconButton size="large" color="inherit" onClick={handleOpenMenu}>
                              <Iconify icon={'eva:more-vertical-fill'} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No wallets found
                      </TableCell>
                    </TableRow>
                  )}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={5} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data?.length > 0 ? data.length : 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem disabled>
          <Iconify icon={'material-symbols:edit'} sx={{ mr: 2 }} />
          <Link style={{ textDecoration: 'none' }}>Edit</Link>
        </MenuItem>
        <MenuItem disabled sx={{ color: 'error.main' }}>
          <Iconify icon={'material-symbols:delete-rounded'} sx={{ mr: 2 }} />
          <Link style={{ textDecoration: 'none' }}>Delete</Link>
        </MenuItem>
      </Popover>
    </>
  );
}
