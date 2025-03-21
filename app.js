import express from "express"
import {fetchStockData} from "./stockpriceapi.js"
const app=express()
import mysql from 'mysql2' 
import dotenv from 'dotenv'
dotenv.config();

var db = mysql.createConnection({
    host:process.env.MYSQL_HOST ,
    user:process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database: "Stocks"
  });

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.set('view engine', 'ejs')
app.use(express.static("public"));
app.get("/:stockname", async (req, res) => {
  if (req.params.stockname === "favicon.ico") {
    return res.status(204).end();  // Return a "No Content" response for favicon
  }

  let array;
  try {
    array = await fetchStockData(req.params.stockname, 1);
    if (!array || !array[0]) {
      throw new Error("No stock data returned");
    }
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return res.status(500).json({ error: "Failed to fetch stock data" });
  }

  const [cur_stock] = await db.promise().query("SELECT * FROM StockNames WHERE ticker = ?", [req.params.stockname]);
  const [companies] = await db.promise().query("SELECT * FROM StockNames",);
 res.render("test", { stock_price_array:array[0],  stockdata:cur_stock[0],  days:array[1],allstocks:companies});
});

app.get("/:stockname/:timeframe", async (req, res) => {
  let timePeriod = req.params.timeframe || 1;

  let array;
  try {
    
    array = await fetchStockData(req.params.stockname, timePeriod);
    if (!array || !array[0]) {
      throw new Error("No stock data returned");
    }
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return res.status(500).json({ error: "Failed to fetch stock data" });
  }
  const [cur_stock] = await db.promise().query("SELECT * FROM StockNames WHERE ticker = ?", [req.params.stockname]);
  const [companies] = await db.promise().query("SELECT * FROM StockNames",);
  
  res.render("test", { stock_price_array:array[0],  stockdata:cur_stock[0],  days:array[1],allstocks:companies,timePeriod:timePeriod});
});

app.listen(3000, () => {  
  console.log("Server running on port 3000");
});
