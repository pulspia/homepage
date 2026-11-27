const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = 8002;

// Supabase client setup
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get current server metrics
app.get('/api/metrics', async (req, res) => {
  try {
    const [cpu, mem, disk] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize()
    ]);

    const metrics = {
      cpu: {
        usage: cpu.currentLoad.toFixed(2),
        cores: cpu.cpus.length
      },
      memory: {
        total: (mem.total / 1024 / 1024 / 1024).toFixed(2), // GB
        used: (mem.used / 1024 / 1024 / 1024).toFixed(2), // GB
        free: (mem.free / 1024 / 1024 / 1024).toFixed(2), // GB
        usage: ((mem.used / mem.total) * 100).toFixed(2) // %
      },
      disk: {
        total: (disk[0].size / 1024 / 1024 / 1024).toFixed(2), // GB
        used: (disk[0].used / 1024 / 1024 / 1024).toFixed(2), // GB
        available: (disk[0].available / 1024 / 1024 / 1024).toFixed(2), // GB
        usage: disk[0].use.toFixed(2) // %
      },
      timestamp: new Date().toISOString()
    };

    // Save to Supabase
    await supabase.from('server_metrics').insert({
      cpu_usage: parseFloat(metrics.cpu.usage),
      memory_usage: parseFloat(metrics.memory.usage),
      disk_usage: parseFloat(metrics.disk.usage),
      cpu_cores: metrics.cpu.cores,
      memory_total_gb: parseFloat(metrics.memory.total),
      disk_total_gb: parseFloat(metrics.disk.total)
    });

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);

    // Log error to Supabase
    await supabase.from('system_logs').insert({
      log_level: 'error',
      message: 'Failed to fetch server metrics',
      error_details: error.message,
      source: 'monitor-server'
    });

    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get system information
app.get('/api/system-info', async (req, res) => {
  try {
    const [osInfo, system, time] = await Promise.all([
      si.osInfo(),
      si.system(),
      si.time()
    ]);

    res.json({
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch
      },
      system: {
        manufacturer: system.manufacturer,
        model: system.model
      },
      uptime: time.uptime
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({ error: 'Failed to fetch system info' });
  }
});

// Test database connection
app.get('/api/db-health', async (req, res) => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('admin_settings')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      throw error;
    }

    res.json({
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    await supabase.from('system_logs').insert({
      log_level: 'error',
      message: 'Database health check failed',
      error_details: error.message,
      source: 'monitor-server'
    });

    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get recent error logs
app.get('/api/error-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Clear old logs (older than 30 days)
app.delete('/api/logs/cleanup', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('system_logs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) throw error;

    res.json({ message: 'Logs cleaned up successfully' });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({ error: 'Failed to clean up logs' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Monitoring server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  // Log server start
  supabase.from('system_logs').insert({
    log_level: 'info',
    message: 'Monitoring server started',
    source: 'monitor-server'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down monitoring server...');

  await supabase.from('system_logs').insert({
    log_level: 'info',
    message: 'Monitoring server stopped',
    source: 'monitor-server'
  });

  process.exit(0);
});
