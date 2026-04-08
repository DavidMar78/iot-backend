console.log("SERVER FILE LOADED"); // 👈 ICI (ligne 1)

const express = require('express');
// Framework pour créer une API

const cors = require('cors');
// Autorise les requêtes depuis React

const { SerialPort } = require('serialport');
// Permet d'accéder au port série (Arduino)

const { ReadlineParser } = require('@serialport/parser-readline');
// Permet de lire les données ligne par ligne

const app = express();
app.use(cors());

// Variables pour stocker les données
let humidity = 10;
let temperature = 20;

// ⚠️ Remplace COM5 par TON port Arduino
const port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 9600,
});

// On lit ligne par ligne
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Quand une donnée arrive depuis Arduino
parser.on('data', (data) => {
    console.log("Reçu brut :", data);

   const values = data.split(",");

   humidity = parseFloat(values[0]);
   temperature = parseFloat(values[1]);
});


// Route API
app.get('/data', async (req, res) => {
    console.log("API SEND:", humidity, temperature);

    const API_KEY = 'a71a09bd1141490caad125354260404';
    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=Jumet`)
    const weatherData = await response.json();

    const externalTemp = weatherData.current.temp_c;
    const externalHumidity = weatherData.current.humidity;

    res.json({
        humidity,
        temperature,
        externalTemp,
        externalHumidity
    });
});

// Lancement serveur
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
