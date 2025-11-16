// script.js (Versi Final Hackathon - Advanced SDS Simulation)

// Daftar Pair yang Fokus pada Somnia Ecosystem
const pairs = [
    "SOMUSDT", "SOMETH", "SOMBNB", "SOMUSDC", "NIAUSDT", 
    "NIASOMI", "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT" 
];

const VOLATILITY_THRESHOLD = 0.5; 
const container = document.getElementById("crypto-container");
const logElement = document.getElementById("activity-log");
const alertContainer = document.getElementById("alert-container");

// Inisialisasi Indikator Kesehatan Stream
const healthIndicator = document.createElement('span');
healthIndicator.id = 'stream-health';
document.querySelector('header h1').appendChild(healthIndicator);

let currentPrices = {}; 
let historicalData = {}; // Menyimpan riwayat harga untuk grafik
const MAX_HISTORY = 60; // Menyimpan 60 data poin (60 detik)
let myChart = null; // Variabel untuk menyimpan instance Chart.js

// Inisialisasi tampilan awal
pairs.forEach(pair => {
    const card = document.createElement("div");
    card.className = "card";
    card.id = pair.replace('/', ''); 

    // Menambahkan placeholder untuk Persentase Volatilitas
    card.innerHTML = `
        <h2>${pair}</h2>
        <div class="percentage-change">-</div>
        <div class="price">Waiting for Stream...</div>
    `;

    container.appendChild(card);
    currentPrices[pair] = 0; 
    historicalData[pair] = []; // Inisialisasi riwayat harga
    
    // TAMBAHKAN CLICK LISTENER KE KARTU
    card.addEventListener('click', () => {
        showChart(pair);
    });
});


// Fungsi untuk mendapatkan data harga baru (disimulasikan dari SDS)
function getSimulatedStreamData() {
    const data = [];
    
    pairs.forEach(pair => {
        let lastPrice = currentPrices[pair];
        if (lastPrice === 0) {
             // Beri harga awal yang masuk akal
             if (pair.includes("SOM") || pair.includes("NIA")) {
                lastPrice = 0.5 + Math.random() * 5; 
             } else {
                lastPrice = 10000 + Math.random() * 50000; 
             }
        }

        const changeFactor = 1 + (Math.random() * 0.03 - 0.015); 
        let newPrice = lastPrice * changeFactor;
        
        // Sesuaikan presisi desimal
        newPrice = parseFloat(newPrice.toFixed(pair.includes("SOM") || pair.includes("NIA") ? 4 : 2)); 

        data.push({
            symbol: pair,
            price: newPrice.toString()
        });
    });

    return data;
}

// Fungsi PENDENGAR (Listener) Data Stream
function handleStreamUpdate(streamData) {
    // --- LOGIKA INDIKATOR KESEHATAN BARU ---
    healthIndicator.style.animation = 'blink 0.1s linear';
    setTimeout(() => {
        healthIndicator.style.animation = 'none';
    }, 100); 
    // ------------------------------------
    
    alertContainer.innerHTML = ''; 

    streamData.forEach(item => {
        const symbol = item.symbol;
        const cardId = symbol.replace('/', ''); 
        
        const elPrice = document.querySelector(`#${cardId} .price`);
        const elPercentage = document.querySelector(`#${cardId} .percentage-change`);
        const card = document.getElementById(cardId);
        
        const oldPrice = currentPrices[symbol];
        const newPrice = parseFloat(item.price);
        
        let logMessage = `[${new Date().toLocaleTimeString()}] Stream Received: ${symbol} $${newPrice.toLocaleString('en-US')}`;
        
        if (oldPrice !== 0) { 
            const percentageChange = ((newPrice - oldPrice) / oldPrice) * 100;
            
            // --- Logika Volatilitas Alert ---
            if (Math.abs(percentageChange) >= VOLATILITY_THRESHOLD) {
                card.classList.add('volatile');
                
                const alertType = percentageChange > 0 ? 'Surge' : 'Drop';
                alertContainer.innerHTML += `<p class="alert alert-${alertType.toLowerCase()}">🚨 VOLATILITY ALERT: ${symbol} experienced a ${alertType} of ${percentageChange.toFixed(2)}%!</p>`;
                
                logMessage += ` (ALERT: ${alertType} >${VOLATILITY_THRESHOLD}%)`;
            } else {
                card.classList.remove('volatile');
            }
            
            // --- Logika Visual Persentase & Harga ---
            const sign = percentageChange >= 0 ? '+' : '';
            elPercentage.textContent = `${sign}${percentageChange.toFixed(2)}%`;

            if (newPrice > oldPrice) {
                elPrice.className = "price up";
                elPercentage.className = "percentage-change up";
            } else if (newPrice < oldPrice) {
                elPrice.className = "price down";
                elPercentage.className = "percentage-change down";
            } else {
                elPrice.className = "price";
                elPercentage.className = "percentage-change";
            }
        } else {
            // Setelah data pertama
            elPrice.className = "price"; 
            elPercentage.className = "percentage-change";
            elPercentage.textContent = '0.00%';
            card.classList.remove('volatile');
        }

        // Update tampilan dan simpan harga baru
        elPrice.textContent = "$" + newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        currentPrices[symbol] = newPrice;
        
        // --- Logika Penyimpanan Data Historis ---
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        historicalData[symbol].push({
            t: now,
            y: newPrice
        });
        
        if (historicalData[symbol].length > MAX_HISTORY) {
            historicalData[symbol].shift(); 
        }
        // ------------------------------------

        // --- Log Aktivitas ---
        const newLogEntry = document.createElement('p');
        newLogEntry.innerHTML = logMessage;
        logElement.prepend(newLogEntry); 
        
        if (logElement.children.length > 15) {
            logElement.removeChild(logElement.lastChild);
        }
    });
}

// Fungsi untuk menampilkan Grafik Garis
function showChart(pair) {
    const modal = document.getElementById('chart-modal');
    const closeBtn = document.querySelector('.close-button');
    const chartCtx = document.getElementById('myChart').getContext('2d');
    
    // Tampilkan Modal
    modal.style.display = 'block';
    document.getElementById('chart-title').textContent = `${pair} - Price History (Last ${MAX_HISTORY} Seconds)`;
    
    // Tutup Modal ketika tombol (x) diklik
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        if (myChart) {
            myChart.destroy(); 
        }
    }
    
    // Tutup Modal ketika area luar modal diklik
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            if (myChart) {
                myChart.destroy();
            }
        }
    }

    // Ambil data untuk Chart.js
    const dataPoints = historicalData[pair];
    const labels = dataPoints.map(p => p.t);
    const prices = dataPoints.map(p => p.y);
    
    // Hancurkan chart lama jika ada
    if (myChart) {
        myChart.destroy();
    }

    // Buat Chart Baru (Tipe Garis)
    myChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${pair} Price`,
                data: prices,
                borderColor: '#b98fff', // Warna garis ungu Somnia
                borderWidth: 2,
                tension: 0.1,
                fill: false,
                pointRadius: 3 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)',
                        color: '#e3d7ff'
                    },
                    ticks: {
                        color: '#e3d7ff'
                    },
                    grid: {
                        color: '#ffffff1a' 
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        color: '#e3d7ff'
                    },
                    ticks: {
                        color: '#e3d7ff'
                    },
                    grid: {
                        color: '#ffffff1a'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e3d7ff'
                    }
                }
            }
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
