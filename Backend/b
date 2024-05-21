const mysql = require('mysql2/promise');
const {Connector} = require('@google-cloud/cloud-sql-connector');
const express = require("express");

const app = express();

// connectWithConnector initializes a connection pool for a Cloud SQL instance
// of MySQL using the Cloud SQL Node.js Connector.
const connectWithConnector = async config => {
  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName: "phonic-envoy-418008:europe-west1:ai-tools-postgresql",
    ipType: "PUBLIC",
  });
  const dbConfig = {
    ...clientOpts,
    user: "postgres", // e.g. 'my-db-user'
    password: "SU123456", // e.g. 'my-db-password'
    database: "AI_Tools_DB", // e.g. 'my-database'
    // ... Specify additional properties here.
    ...config,   
  };
  // Establish a connection to the database.
  const pool = mysql.createPool(dbConfig);
  return pool
};

app.get('/', async (req, res) => {
  try {
    const pool = await connectWithConnector();
    
    // Get all tables from the database
    const [rows, fields] = await pool.query("SHOW TABLES");
    
    // Extract table names from the result
    const tables = rows.map(row => Object.values(row)[0]);
    
    // Send the list of tables as a response
    res.json({ tables });
  } catch (error) {
    console.error("Error retrieving tables:", error);
    res.status(500).json({ error: error });
  }
});
const port = 8080;
app.listen(port, async () => {
  console.log(`helloworld: listening on port ${port}`);
});