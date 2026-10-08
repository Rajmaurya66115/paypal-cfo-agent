const express = require('express');
const cors = require('cors');

const app = express();

// ENABLE CORS FOR FRONTEND
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/paypal', require('./routes/paypalRoutes'));
app.use('/api/agent', require('./routes/agentRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));