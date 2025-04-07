import { Container, Grid, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { AppWidgetSummary } from '../../sections/@dashboard/app';
import AuthService from '../../services/AuthService';
import HttpService from '../../services/HttpService';

export default function Dashboard() {
  const [userWallets, setUserWallets] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [weeklyTransactionAmount, setWeeklyTransactionAmount] = useState(0);
  const [monthlyTransactionAmount, setMonthlyTransactionAmount] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
  const [weeklyDateRange, setWeeklyDateRange] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Format date as mm/dd
    const formatDate = (date) => {
      const month = date.getMonth() + 1; // getMonth() is zero-based
      const day = date.getDate();
      return `${month}/${day}`;
    };
    
    // Get current month name and weekly date range
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'];
    const today = new Date();
    const currentMonthName = monthNames[today.getMonth()];
    setCurrentMonth(currentMonthName);
    
    // Calculate weekly date range
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyRange = `${formatDate(oneWeekAgo)}-${formatDate(today)}`;
    setWeeklyDateRange(weeklyRange);
    
    const fetchUserData = async () => {
      try {
        // Get current user from local storage
        const currentUser = AuthService.getCurrentUser();
        console.log('Current user data:', currentUser);
        
        // Check if user exists and has an ID
        if (currentUser) {
          // The backend returns the user ID as 'id'
          const userId = currentUser.id;
          const username = currentUser.username;
          console.log('User ID:', userId, 'Username:', username);
          
          if (userId) {
            // Fetch wallets
            const walletsUrl = `/wallets/users/${userId}`;
            console.log('Fetching wallets from:', walletsUrl);
            
            const walletsResponse = await HttpService.getWithAuth(walletsUrl);
            console.log('Wallets API response:', walletsResponse);
            
            if (Array.isArray(walletsResponse)) {
              console.log(`Found ${walletsResponse.length} wallets for user`);
              setUserWallets(walletsResponse.length);
              
              // Calculate the total balance across all wallets
              const totalBalance = walletsResponse.reduce((sum, wallet) => {
                const balance = wallet.balance || 0;
                console.log(`Wallet ${wallet.name || wallet.id}: Balance ${balance}`);
                return sum + balance;
              }, 0);
              
              console.log(`Total balance across all wallets: ${totalBalance}`);
              setTotalAssets(totalBalance);
            } else {
              console.error('Wallets response is not an array:', walletsResponse);
              setUserWallets(0);
              setTotalAssets(0);
            }
            
            // Fetch user transactions
            const transactionsUrl = `/transactions/users/${userId}`;
            console.log('Fetching transactions from:', transactionsUrl);
            
            const transactionsResponse = await HttpService.getWithAuth(transactionsUrl);
            console.log('Transactions API response:', transactionsResponse);
            
            if (transactionsResponse && transactionsResponse.content) {
              // Calculate date ranges
              const today = new Date();
              
              // Weekly range: last 7 days
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              
              // Monthly range: 1st day of current month to today
              const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
              
              console.log(`Filtering for weekly transactions: ${oneWeekAgo.toISOString()} to ${today.toISOString()}`);
              console.log(`Filtering for monthly transactions: ${firstDayOfMonth.toISOString()} to ${today.toISOString()}`);
              
              // Filter transactions for the last week
              const weeklyTransactions = transactionsResponse.content.filter(transaction => {
                const transactionDate = new Date(transaction.createdAt);
                return transactionDate >= oneWeekAgo;
              });
              
              // Filter transactions for the current month
              const monthlyTransactions = transactionsResponse.content.filter(transaction => {
                const transactionDate = new Date(transaction.createdAt);
                return transactionDate >= firstDayOfMonth;
              });
              
              console.log(`Found ${weeklyTransactions.length} transactions in the last week`);
              console.log(`Found ${monthlyTransactions.length} transactions in the current month`);
              
              // Helper function to calculate transaction amounts
              const calculateNetAmount = (transactions, userId, username) => {
                return transactions.reduce((sum, transaction) => {
                  const amount = parseFloat(transaction.amount) || 0;
                  
                  // Determine sender and receiver
                  const senderName = transaction.fromWallet?.user?.username || 
                                    transaction.fromWallet?.userName || 
                                    (transaction.fromWallet?.userId === userId ? username : 'unknown');
                  
                  const receiverName = transaction.toWallet?.user?.username || 
                                      transaction.toWallet?.userName || 
                                      (transaction.toWallet?.userId === userId ? username : 'unknown');
                  
                  // Case 1: Self-transaction (sender = receiver = user)
                  if (senderName === username && receiverName === username) {
                    return sum; // Don't add anything for self-transactions
                  }
                  
                  // Case 2: User is sender (outgoing transaction)
                  if (senderName === username) {
                    return sum - amount; // Subtract amount (treat as negative)
                  }
                  
                  // Case 3: User is receiver (incoming transaction)
                  if (receiverName === username) {
                    return sum + amount; // Add amount (treat as positive)
                  }
                  
                  // Case 4: Neither sender nor receiver is user (shouldn't happen)
                  return sum;
                }, 0);
              };
              
              // Calculate weekly transaction amount
              const weeklyAmount = calculateNetAmount(weeklyTransactions, userId, username);
              console.log(`Total weekly transaction amount: ${weeklyAmount}`);
              setWeeklyTransactionAmount(weeklyAmount);
              
              // Calculate monthly transaction amount
              const monthlyAmount = calculateNetAmount(monthlyTransactions, userId, username);
              console.log(`Total monthly transaction amount: ${monthlyAmount}`);
              setMonthlyTransactionAmount(monthlyAmount);
            } else {
              console.error('Transactions response is invalid:', transactionsResponse);
              setWeeklyTransactionAmount(0);
              setMonthlyTransactionAmount(0);
            }
          } else {
            console.error('User object does not contain ID field');
            setUserWallets(0);
            setTotalAssets(0);
            setWeeklyTransactionAmount(0);
            setMonthlyTransactionAmount(0);
          }
        } else {
          console.warn('No user data found in local storage');
          setUserWallets(0);
          setTotalAssets(0);
          setWeeklyTransactionAmount(0);
          setMonthlyTransactionAmount(0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // If unauthorized, the token might be expired - try to handle it
        if (error.response && error.response.status === 401) {
          console.error('Authentication error - token may be expired');
          // Could redirect to login if needed
          // navigate('/login');
        }
        
        setUserWallets(0);
        setTotalAssets(0);
        setWeeklyTransactionAmount(0);
        setMonthlyTransactionAmount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="My Wallets" 
              total={userWallets} 
              icon={'ant-design:wallet-outlined'} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="My Assets" 
              total={totalAssets} 
              color="warning" 
              icon={'ant-design:money-collect-outlined'} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title={`Transactions (${weeklyDateRange})`}
              total={weeklyTransactionAmount}
              color="info"
              icon={'ant-design:transaction-outlined'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title={`${currentMonth} Transactions`}
              total={monthlyTransactionAmount}
              color="error"
              icon={'ant-design:calendar-outlined'}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
