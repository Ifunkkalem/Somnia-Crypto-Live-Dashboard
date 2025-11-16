// script.js (Versi Hackathon - Simulasi Somnia Data Streams)

const pairs = [
    "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT",
    "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "TONUSDT", "LINKUSDT"
];

const VOLATILITY_THRESHOLD = 0.5; // Batas Volatilitas: 0.5%
const container = document.getElementById("crypto-container");
const logElement = document.getElementById("activity-log");
const alertContainer = document.getElementById("alert-container");

const healthIndicator = document.createElement('span');
healthIndicator.id = 'stream-health';
document.querySelector('header h1').appendChild(healthIndicator);

let currentPrices = {}; // Menyimpan harga terakhir

// Inisialisasi tampilan awal
pairs.forEach(pair => {
    const card = document.createElement("div");
    card.className = "card";
    card.id = pair;

    card.innerHTML = `
        <h2>${pair}</h2>
        <div class="price">Waiting for Stream...</div>
    `;

    container.appendChild(card);
    currentPrices[pair] = 0; // Inisialisasi harga di memori
});


// Fungsi untuk mendapatkan data harga baru (disimulasikan dari SDS)
function getSimulatedStreamData() {
    const data = [];
    
    pairs.forEach(pair => {
        let lastPrice = currentPrices[pair];
        if (lastPrice === 0) {
             lastPrice = 10000 + Math.random() * 50000; 
        }

        // Tentukan perubahan acak (sedikit lebih volatile: -1.5% hingga +1.5%)
        const changeFactor = 1 + (Math.random() * 0.03 - 0.015); 
        let newPrice = lastPrice * changeFactor;
        
        newPrice = parseFloat(newPrice.toFixed(2));

        data.push({
            symbol: pair,
            price: newPrice.toString()
        });
    });

    return data;
}

// Fungsi PENDENGAR (Listener) Data Stream
function handleStreamUpdate(streamData) {
    // Kosongkan peringatan lama
    alertContainer.innerHTML = ''; 

    streamData.forEach(item => {
        const symbol = item.symbol;
        const el = document.querySelector(`#${symbol} .price`);
        const card = document.getElementById(symbol);
        const oldPrice = currentPrices[symbol];
        const newPrice = parseFloat(item.price);
        
        let logMessage = `[${new Date().toLocaleTimeString()}] Stream Received: ${symbol} $${newPrice.toLocaleString('en-US')}`;
        
        if (oldPrice !== 0) { 
            // Hitung perubahan persentase
            const percentageChange = ((newPrice - oldPrice) / oldPrice) * 100;
            
            // --- Logika Volatilitas BARU ---
            if (Math.abs(percentageChange) >= VOLATILITY_THRESHOLD) {
                // Tambahkan kelas border tebal untuk highlight
                card.classList.add('volatile');
                
                // Tambahkan Peringatan ke Header
                const alertType = percentageChange > 0 ? 'Surge' : 'Drop';
                alertContainer.innerHTML += `<p class="alert alert-${alertType.toLowerCase()}">🚨 VOLATILITY ALERT: ${symbol} experienced a ${alertType} of ${percentageChange.toFixed(2)}%!</p>`;
                
                logMessage += ` (ALERT: ${alertType} >${VOLATILITY_THRESHOLD}%)`;
            } else {
                card.classList.remove('volatile');
            }
            
            // Tentukan warna (Up/Down)
            if (newPrice > oldPrice) {
                el.className = "price up";
            } else if (newPrice < oldPrice) {
                el.className = "price down";
            } else {
                el.className = "price"; 
            }
        } else {
            // Setelah data pertama
            el.className = "price"; 
            card.classList.remove('volatile');
        }

        // Update tampilan dan simpan harga baru
        el.textContent = "$" + newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        currentPrices[symbol] = newPrice;
        
        // --- Log Aktivitas BARU ---
        const newLogEntry = document.createElement('p');
        newLogEntry.innerHTML = logMessage;
        logElement.prepend(newLogEntry); // Tambahkan di atas
        
        // Batasi log agar tidak terlalu panjang
        if (logElement.children.length > 15) {
            logElement.removeChild(logElement.lastChild);
        }
    });
}


// MENGAKTIFKAN SIMULASI STREAM
function activateSomniaDataStreamSimulation() {
    setInterval(() => {
        const streamData = getSimulatedStreamData();
        handleStreamUpdate(streamData); 
    }, 1000); 
}

// Mulai Proyek!
activateSomniaDataStreamSimulation();

