let ALL_PRODUCTS = [];

document.addEventListener("DOMContentLoaded", async () => {
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const productsGrid = document.getElementById("productsGrid");

    try {
        // Ambil data dari Google Spreadsheet
        const res = await fetch(API_URL);
        ALL_PRODUCTS = await res.json();

        // Matikan loading skeleton
        loadingState.classList.remove("active");

        if (ALL_PRODUCTS.length === 0) {
            emptyState.classList.remove("hidden");
            return;
        }

        renderProducts(ALL_PRODUCTS);
        setupSearchAndSort();

    } catch (err) {
        console.error("Gagal mengambil data:", err);
        loadingState.classList.remove("active");
        emptyState.classList.remove("hidden");
    }
});

// Render tampilan produk
function renderProducts(products) {
    const productsGrid = document.getElementById("productsGrid");

    productsGrid.innerHTML = products.map(p => `
        <div class="bg-white rounded-lg shadow-sm overflow-hidden product-card">
            <img src="${p.image}" class="h-48 w-full object-cover" alt="${p.name}">
            <div class="p-4">
                <h3 class="text-lg font-semibold">${p.name}</h3>
                <p class="text-gray-600 text-sm mb-2">${p.description}</p>
                <p class="text-green-600 font-bold">${formatRupiah(p.price)}</p>
            </div>
        </div>
    `).join("");
}

// Event search + sorting
function setupSearchAndSort() {
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const emptyState = document.getElementById("emptyState");

    function updateDisplay() {
        let results = filterProducts(ALL_PRODUCTS, searchInput.value);
        results = sortProducts(results, sortSelect.value);

        if (results.length === 0) {
            emptyState.classList.remove("hidden");
        } else {
            emptyState.classList.add("hidden");
        }

        renderProducts(results);
    }

    searchInput.addEventListener("input", updateDisplay);
    sortSelect.addEventListener("change", updateDisplay);
}
