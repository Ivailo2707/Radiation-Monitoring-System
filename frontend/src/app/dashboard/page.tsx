'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getReadings, Reading } from '../../lib/readings';
import { 
  Box, 
  Container, 
  Typography, 
  AppBar, 
  Toolbar, 
  Button, 
  Paper, 
  Alert, 
  AlertTitle,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  IconButton
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, subHours } from 'date-fns';
import { Logout, Warning, Close } from '@mui/icons-material';

interface FormattedReading {
  timestamp: Date;
  value: number;
}

const DASHBOARD_UPDATE_INTERVAL = 10000; // 10 seconds
const RADIATION_THRESHOLD = 1.0; // 1.0 μSv/h is the typical threshold for concern
const READINGS_LIMIT = 50; // Number of readings to fetch

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState<FormattedReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [highRadiationAlert, setHighRadiationAlert] = useState<{
    active: boolean;
    value?: number;
    timestamp?: Date;
  }>({ active: false });

  const fetchReadings = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await getReadings(READINGS_LIMIT);
      const formattedData = data.map(reading => ({
        timestamp: new Date(reading.timestamp),
        value: reading.value
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      setReadings(formattedData);
      checkForHighRadiation(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching readings:', err);
      setError('Failed to load radiation data');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial data load and setup polling
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Initial fetch
    fetchReadings();

    // Set up polling
    const interval = setInterval(fetchReadings, DASHBOARD_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [user, router, fetchReadings]);

  const checkForHighRadiation = (data: FormattedReading[]) => {
    if (data.length === 0) return;
    
    const latestReading = data[data.length - 1];
    if (latestReading.value > RADIATION_THRESHOLD) {
      setHighRadiationAlert({
        active: true,
        value: latestReading.value,
        timestamp: latestReading.timestamp,
      });
    } else if (highRadiationAlert.active) {
      setHighRadiationAlert({ active: false });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatXAxis = (date: Date) => {
    return format(new Date(date), 'HH:mm');
  };

  const getRadiationLevelSeverity = (value: number) => {
    if (value < 0.3) return { level: 'Low', color: '#4caf50' }; // Green
    if (value < 1.0) return { level: 'Moderate', color: '#ff9800' }; // Orange
    return { level: 'High', color: '#f44336' }; // Red
  };

  const currentRadiation = readings.length > 0 ? readings[readings.length - 1].value : 0;
  const severity = getRadiationLevelSeverity(currentRadiation);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isLoading && readings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Radiation Monitoring System
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {user?.username || 'User'}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {highRadiationAlert.active && (
          <Alert 
            severity="error" 
            icon={<Warning fontSize="inherit" />}
            sx={{ mb: 3 }}
          >
            <AlertTitle>High Radiation Alert!</AlertTitle>
            Radiation level has reached {highRadiationAlert.value?.toFixed(2)} μSv/h at {format(highRadiationAlert.timestamp || new Date(), 'PPpp')}.
            This exceeds the safe threshold of {RADIATION_THRESHOLD} μSv/h.
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Current Radiation Level
              </Typography>
              <Typography variant="h3" component="div" sx={{ color: severity.color }}>
                {currentRadiation.toFixed(2)} μSv/h
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {severity.level} Radiation
              </Typography>
              <Typography variant="body2">
                Last updated: {format(new Date(), 'PPpp')}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Safety Status
              </Typography>
              <Typography variant="h5" component="div" sx={{ color: severity.color }}>
                {severity.level === 'High' ? 'Warning' : 'Normal'}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {severity.level === 'High' 
                  ? 'Radiation levels are above safety threshold' 
                  : 'Radiation levels are within safe limits'}
              </Typography>
              <Typography variant="body2">
                Threshold: {RADIATION_THRESHOLD} μSv/h
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Radiation Levels (Last {readings.length} Readings)
          </Typography>
          <Box sx={{ height: 400, position: 'relative' }}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={readings}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxis}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'μSv/h', angle: -90, position: 'insideLeft' }}
                    domain={[0, (dataMax: number) => Math.max(RADIATION_THRESHOLD * 1.5, dataMax * 1.1)]}
                  />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'PPpp')}
                    formatter={(value) => [`${value} μSv/h`, 'Radiation Level']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Radiation Level"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => RADIATION_THRESHOLD}
                    name="Safety Threshold"
                    stroke="#ff4d4f"
                    strokeDasharray="5 5"
                    dot={false}
                    strokeWidth={1.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>


        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Radiation Level Guide
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: '#4caf50', color: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle1">Low</Typography>
              <Typography variant="body2">0 - 0.3 μSv/h</Typography>
              <Typography variant="body2">Normal background radiation</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: '#ff9800', color: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle1">Moderate</Typography>
              <Typography variant="body2">0.3 - 1.0 μSv/h</Typography>
              <Typography variant="body2">Elevated levels, monitor closely</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: '#f44336', color: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle1">High</Typography>
              <Typography variant="body2">Above 1.0 μSv/h</Typography>
              <Typography variant="body2">Dangerous levels, take action</Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
