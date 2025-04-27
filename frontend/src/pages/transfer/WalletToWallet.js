import { LoadingButton } from '@mui/lab';
import { Autocomplete, Button, Card, Grid, Stack, TextField, Typography, CircularProgress, Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import HttpService from '../../services/HttpService';

export default function WalletToWallet() {
  const defaultValues = {
    amount: '',
    fromWalletIban: '',
    toWalletIban: '',
    description: '',
    typeId: 1, // set as Transfer by default
  };

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formValues, setFormValues] = useState(defaultValues);
  const [fromWalletIbans, setFromWalletIbans] = useState([]);
  const [fromWalletIban, setFromWalletIban] = useState();
  const [receiverName, setReceiverName] = useState('');
  const [receiverUserId, setReceiverUserId] = useState(null);
  const [isFetchingReceiver, setIsFetchingReceiver] = useState(false);
  const [receiverFetchError, setReceiverFetchError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    if (name === 'toWalletIban') {
      setReceiverName('');
      setReceiverUserId(null);
      setReceiverFetchError('');
    }
  };

  useEffect(() => {
    const userId = AuthService.getCurrentUser()?.id;
    HttpService.getWithAuth(`/wallets/users/${userId}`)
      .then((result) => {
        if (Array.isArray(result?.data)) {
          setFromWalletIbans(result.data);
        } else {
          console.error(
            'Fetched sender wallets: Expected an array directly in result.data but received:',
            result?.data
          );
          setFromWalletIbans([]);
          enqueueSnackbar('Failed to load sender wallets: Invalid format received', { variant: 'error' });
        }
      })
      .catch((error) => {
        console.error('Error fetching sender wallets:', error);
        if (error.response?.data?.errors) {
          error.response?.data?.errors.map((e) => enqueueSnackbar(e.message, { variant: 'error' }));
        } else if (error.response?.data?.message) {
          enqueueSnackbar(error.response?.data?.message, { variant: 'error' });
        } else {
          enqueueSnackbar('Failed to load sender wallets', { variant: 'error' });
        }
        setFromWalletIbans([]);
      });
  }, [enqueueSnackbar]);

  const handleWalletChange = (event, selectedWallet) => {
    if (selectedWallet?.iban) {
      setFromWalletIban(selectedWallet.iban);
      setFormValues((prevValues) => ({
        ...prevValues,
        fromWalletIban: selectedWallet.iban,
      }));
    } else {
      setFromWalletIban(undefined);
      setFormValues((prevValues) => ({
        ...prevValues,
        fromWalletIban: '',
      }));
    }
  };

  const handleIbanBlur = () => {
    const iban = formValues.toWalletIban;
    if (iban && iban.trim().length > 0) {
      setIsFetchingReceiver(true);
      setReceiverName('');
      setReceiverUserId(null);
      setReceiverFetchError('');
      HttpService.getWithAuth(`/wallets/iban/${iban}`)
        .then((response) => {
          const walletData = response.data;
          if (walletData && walletData.user) {
            setReceiverName(`${walletData.user.firstName} ${walletData.user.lastName}`);
            setReceiverUserId(walletData.user.id);
          } else {
            setReceiverFetchError('Receiver details not found.');
          }
          setIsFetchingReceiver(false);
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            setReceiverFetchError('Receiver IBAN not found.');
          } else if (error.response?.data?.message) {
            setReceiverFetchError(`Error: ${error.response.data.message}`);
          } else {
            setReceiverFetchError('Failed to fetch receiver details.');
            enqueueSnackbar('Failed to fetch receiver details.', { variant: 'error' });
          }
          setReceiverUserId(null);
          setIsFetchingReceiver(false);
        });
    } else {
      setReceiverName('');
      setReceiverUserId(null);
      setReceiverFetchError('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    HttpService.postWithAuth('/wallets/transfer', formValues)
      .then((response) => {
        enqueueSnackbar('Transfer completed successfully', { variant: 'success' });
        console.log('Receiver User ID saved during transfer:', receiverUserId);
        navigate('/transactions');
      })
      .catch((error) => {
        if (error.response?.data?.errors) {
          error.response?.data?.errors.map((e) => enqueueSnackbar(e.message, { variant: 'error' }));
        } else if (error.response?.data?.message) {
          enqueueSnackbar(error.response?.data?.message, { variant: 'error' });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };

  return (
    <>
      <Helmet>
        <title> Wallet to Wallet Transfer | e-Wallet </title>
      </Helmet>
      <Card>
        <Grid container alignItems="left" justify="left" direction="column" sx={{ width: 400, padding: 5 }}>
          <Stack spacing={3}>
            <TextField
              id="amount"
              name="amount"
              label="Amount"
              autoFocus
              required
              value={formValues.amount}
              onChange={handleInputChange}
              type="number"
            />
            <Autocomplete
              ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
              required
              disablePortal
              id="fromWalletIban"
              noOptionsText="no records"
              options={fromWalletIbans}
              getOptionLabel={(fromWalletIban) => fromWalletIban.name}
              isOptionEqualToValue={(option, value) => option.name === value.name}
              onChange={(event, newValue) => {
                handleWalletChange(event, newValue);
              }}
              renderInput={(params) => <TextField {...params} label="Sender Wallet" />}
            />
            <TextField
              id="toWalletIban"
              name="toWalletIban"
              label="IBAN of Receiver Wallet"
              autoComplete="toWalletIban"
              required
              value={formValues.toWalletIban}
              onChange={handleInputChange}
              onBlur={handleIbanBlur}
            />
            <Box sx={{ minHeight: 24, display: 'flex', alignItems: 'center', pl: 1 }}>
              {isFetchingReceiver && <CircularProgress size={20} />}
              {!isFetchingReceiver && receiverName && (
                <Typography variant="body2" color="text.secondary">
                  Receiver: {receiverName} (ID: {receiverUserId})
                </Typography>
              )}
              {!isFetchingReceiver && receiverFetchError && (
                <Typography variant="body2" color="error">
                  {receiverFetchError}
                </Typography>
              )}
            </Box>
            <TextField
              id="description"
              name="description"
              label="Description"
              autoComplete="description"
              required
              value={formValues.description}
              onChange={handleInputChange}
              disabled={isFetchingReceiver}
            />
          </Stack>
          <Stack spacing={2} direction="row" alignItems="right" justifyContent="end" sx={{ mt: 4 }}>
            <Button sx={{ width: 120 }} variant="outlined" onClick={() => navigate('/wallets')}>
              Cancel
            </Button>
            <LoadingButton
              sx={{ width: 120 }}
              size="large"
              type="submit"
              variant="contained"
              onClick={handleSubmit}
              loading={isFetchingReceiver}
              disabled={!receiverUserId && formValues.toWalletIban.length > 0}
            >
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Card>
    </>
  );
}
