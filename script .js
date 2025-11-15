const pairs = [
    "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT",
    "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "TONUSDT", "LINKUSDT"
];

const container = document.getElementById("crypto-container");

pairs.forEach(pair => {
    const card = document.createElement("div");
    card.className = "card";
    card.id = pair;

    card.innerHTML = `
        <h2>${pair}</h2>
        <div class="price">Loading...</div>
    `;

    container.appendChild(card);
});

async function fetchPrices() {
    const url = "https://api.binance.com/api/v3/ticker/price";

    const response = await fetch(url);
    const data = await response.json();

    data.forEach(item => {
        if (pairs.includes(item.symbol)) {
            const el = document.querySelector(`#${item.symbol} .price`);
            const oldPrice = parseFloat(el.textContent) || null;
            const newPrice = parseFloat(item.price);

            if (oldPrice) {
                if (newPrice > oldPrice) {
                    el.className = "price up";
                } else if (newPrice < oldPrice) {
                    el.className = "price down";
                }
            }

            el.textContent = "$" + newPrice.toLocaleString();
        }
    });
}

fetchPrices();
setInterval(fetchPrices, 5000);
