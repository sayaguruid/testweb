// 📱 JAVASCRIPT FOR SINGLE VENDOR E-COMMERCE

// ===== CONFIGURATION =====
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbwvf_yiXLGVKDBCb0HEekSfp_qzSWaNBfinRndXtrzSXyrPZlXM5L1s3856gFsHeazn/exec'; // Ganti dengan URL Web App Anda

// ===== UTILITY FUNCTIONS =====

// Format currency to Indonesian Rupiah
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Show error message
function showError(message) {
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const alertContainer = document.createElement('div');
    alertContainer.innerHTML = alertHtml;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertContainer, container.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alertContainer.parentNode) {
            alertContainer.remove();
        }
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const alertContainer = document.createElement('div');
    alertContainer.innerHTML = alertHtml;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertContainer, container.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alertContainer.parentNode) {
            alertContainer.remove();
        }
    }, 5000);
}

// Show loading spinner
function showLoading(elementId = 'loadingSpinner') {
    const spinner = document.getElementById(elementId);
    if (spinner) {
        spinner.style.display = 'block';
    }
}

// Hide loading spinner
function hideLoading(elementId = 'loadingSpinner') {
    const spinner = document.getElementById(elementId);
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (Indonesia format)
function validatePhone(phone) {
    const re = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
}

// Format phone number to standard format
function formatPhone(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add +62 prefix if needed
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('62')) {
        cleaned = '62' + cleaned.substring(2);
    } else if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }
    
    return cleaned;
}

// Generate random ID
function generateRandomId(prefix, length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix + '-';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Set URL parameter
function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('Tersalin ke clipboard!');
        }).catch(err => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showSuccess('Tersalin ke clipboard!');
    } catch (err) {
        showError('Gagal menyalin teks');
    }
    
    document.body.removeChild(textArea);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Smooth scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== PRODUCT FUNCTIONS =====

// Load all products
function loadProducts() {
    showLoading();
    
    fetch(`${API_BASE_URL}/products`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.status === 'success') {
                displayProducts(data.data);
            } else {
                showError('Gagal memuat produk');
            }
        })
        .catch(error => {
            hideLoading();
            showError('Terjadi kesalahan. Silakan coba lagi.');
        });
}

// Display products in grid
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    if (!grid) return;
    
    if (products.length === 0) {
        grid.style.display = 'none';
        if (noProducts) noProducts.style.display = 'block';
        return;
    }
    
    grid.style.display = 'flex';
    if (noProducts) noProducts.style.display = 'none';
    
    grid.innerHTML = products.map(product => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card product-card h-100">
                <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     class="card-img-top" alt="${product.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description ? product.description.substring(0, 100) + '...' : 'Tidak ada deskripsi'}</p>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <div class="product-stock">
                        <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">
                            ${product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                        </span>
                    </div>
                    <div class="mt-auto">
                        <div class="btn-group w-100" role="group">
                            <a href="product.html?id=${product.id}" class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-eye me-1"></i>Detail
                            </a>
                            <a href="order.html?product_id=${product.id}&product_name=${encodeURIComponent(product.name)}&price=${product.price}&quantity=1&total=${product.price}" 
                               class="btn btn-primary btn-sm">
                                <i class="fas fa-shopping-cart me-1"></i>Beli
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        loadProducts();
        return;
    }
    
    showLoading();
    
    fetch(`${API_BASE_URL}/products`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.status === 'success') {
                const filteredProducts = data.data.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.category && product.category.toLowerCase().includes(searchTerm))
                );
                displayProducts(filteredProducts);
            } else {
                showError('Gagal mencari produk');
            }
        })
        .catch(error => {
            hideLoading();
            showError('Terjadi kesalahan. Silakan coba lagi.');
        });
}

// Filter products by category
function filterByCategory(category) {
    // Update button states
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (category === 'all') {
        loadProducts();
        return;
    }
    
    showLoading();
    
    fetch(`${API_BASE_URL}/products`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.status === 'success') {
                const filteredProducts = data.data.filter(product => 
                    product.category === category
                );
                displayProducts(filteredProducts);
            } else {
                showError('Gagal memfilter produk');
            }
        })
        .catch(error => {
            hideLoading();
            showError('Terjadi kesalahan. Silakan coba lagi.');
        });
}

// ===== ORDER FUNCTIONS =====

// Submit order
function submitOrder(orderData) {
    showLoading();
    
    fetch(`${API_BASE_URL}/order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.status === 'success') {
            // Redirect to success page
            window.location.href = `success.html?order_id=${data.data.order_id}&tracking_link=${encodeURIComponent(data.data.tracking_link)}`;
        } else {
            showError(data.message || 'Gagal membuat pesanan');
        }
    })
    .catch(error => {
        hideLoading();
        showError('Terjadi kesalahan. Silakan coba lagi.');
    });
}

// ===== TRACKING FUNCTIONS =====

// Track order by ID
function trackOrder(orderId) {
    showLoading();
    
    fetch(`${API_BASE_URL}/track?id=${orderId}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.status === 'success') {
                displayOrderDetails(data.data);
            } else {
                showError('Pesanan tidak ditemukan');
            }
        })
        .catch(error => {
            hideLoading();
            showError('Terjadi kesalahan. Silakan coba lagi.');
        });
}

// ===== ADMIN FUNCTIONS =====

// Admin login
function adminLogin(username, password) {
    showLoading();
    
    fetch(`${API_BASE_URL}/admin?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.status === 'success') {
                // Store admin session
                const adminData = {
                    username: data.data.username,
                    email: data.data.email,
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('adminData', JSON.stringify(adminData));
                
                showSuccess('Login berhasil!');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1000);
            } else {
                showError('Username atau password salah');
            }
        })
        .catch(error => {
            hideLoading();
            showError('Terjadi kesalahan. Silakan coba lagi.');
        });
}

// Check admin authentication
function checkAdminAuth() {
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    try {
        const admin = JSON.parse(adminData);
        const loginTime = new Date(admin.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        // Auto logout after 24 hours
        if (hoursDiff > 24) {
            localStorage.removeItem('adminData');
            window.location.href = 'admin-login.html';
            return false;
        }
        
        return admin;
    } catch (error) {
        localStorage.removeItem('adminData');
        window.location.href = 'admin-login.html';
        return false;
    }
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminData');
    window.location.href = 'admin-login.html';
}

// Update order status
function updateOrderStatus(orderId, status) {
    return fetch(`${API_BASE_URL}/admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'update-order-status',
            order_id: orderId,
            status: status
        })
    });
}

// Update payment status
function updatePaymentStatus(orderId, status) {
    return fetch(`${API_BASE_URL}/admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'update-payment-status',
            order_id: orderId,
            status: status
        })
    });
}

// Create product
function createProduct(productData) {
    return fetch(`${API_BASE_URL}/admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'create-product',
            ...productData
        })
    });
}

// Edit product
function editProduct(productData) {
    return fetch(`${API_BASE_URL}/admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'edit-product',
            ...productData
        })
    });
}

// Delete product
function deleteProduct(productId) {
    return fetch(`${API_BASE_URL}/admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'delete-product',
            id: productId
        })
    });
}

// ===== INITIALIZATION =====

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.className = 'btn btn-primary position-fixed';
    scrollToTopBtn.style.cssText = 'bottom: 20px; right: 20px; z-index: 1000; display: none; width: 50px; height: 50px; border-radius: 50%;';
    scrollToTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
});

// Export functions for global use
window.EcommerceApp = {
    formatCurrency,
    showError,
    showSuccess,
    showLoading,
    hideLoading,
    validateEmail,
    validatePhone,
    formatPhone,
    generateRandomId,
    getUrlParameter,
    setUrlParameter,
    copyToClipboard,
    debounce,
    isInViewport,
    scrollToElement,
    loadProducts,
    searchProducts,
    filterByCategory,
    submitOrder,
    trackOrder,
    adminLogin,
    checkAdminAuth,
    adminLogout,
    updateOrderStatus,
    updatePaymentStatus,
    createProduct,
    editProduct,
    deleteProduct
};
