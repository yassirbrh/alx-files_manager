import loadRoutes from './routes/index';

const express = require('express');

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

loadRoutes(app);

module.exports = app;
