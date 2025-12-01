// Format harga ke format Rupiah
function formatRupiah(value) {
    if (!value) return "0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(value);
}

// Filter produk berdasarkan kata kunci
function filterProducts(products, keyword) {
    keyword = keyword.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword)
    );
}

// Sorting produk
function sortProducts(products, method) {
    let sorted = [...products];

    switch (method) {
        case "price-low":
            sorted.sort((a, b) => a.price - b.price);
            break;
        case "price-high":
            sorted.sort((a, b) => b.price - a.price);
            break;
        default:
        case "name":
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    return sorted;
}
