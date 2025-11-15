// script.js (Versi Hackathon - Simulasi Somnia Data Streams)

const pairs = [
    "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT",
    "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "TONUSDT", "LINKUSDT"
];

const container = document.getElementById("crypto-container");
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
    // Inisialisasi harga di memori
    currentPrices[pair] = 0; 
});


// Fungsi untuk mendapatkan data harga baru (disimulasikan dari SDS)
function getSimulatedStreamData() {
    const data = [];
    
    // Setiap 1 detik, buat perubahan harga acak
    pairs.forEach(pair => {
        let lastPrice = currentPrices[pair];
        // Set harga awal jika masih 0
        if (lastPrice === 0) {
             lastPrice = 10000 + Math.random() * 50000; 
        }

        // Tentukan perubahan acak (naik/turun -1% hingga +1%)
        const changeFactor = 1 + (Math.random() * 0.02 - 0.01); 
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
    streamData.forEach(item => {
        const symbol = item.symbol;
        const el = document.querySelector(`#${symbol} .price`);
        const oldPrice = currentPrices[symbol];
        const newPrice = parseFloat(item.price);

        if (oldPrice !== 0) { 
            // Tentukan warna berdasarkan perubahan harga
            if (newPrice > oldPrice) {
                el.className = "price up";
            } else if (newPrice < oldPrice) {
                el.className = "price down";
            } else {
                el.className = "price";
            }
        } else {
            // Hapus "Waiting" setelah data pertama
            el.className = "price"; 
        }

        // Update tampilan dan simpan harga baru
        el.textContent = "$" + newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        currentPrices[symbol] = newPrice;
    });
}


// MENGAKTIFKAN SIMULASI STREAM
function activateSomniaDataStreamSimulation() {
    // Panggil fungsi pembaruan setiap 1000ms (1 detik)
    setInterval(() => {
        const streamData = getSimulatedStreamData();
        // Mendorong data ke fungsi listener
        handleStreamUpdate(streamData); 
    }, 1000); 
}

// Mulai Proyek!
activateSomniaDataStreamSimulation();
