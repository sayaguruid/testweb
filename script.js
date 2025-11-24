// Global configuration
const API_BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Authentication functions
function isAdminLoggedIn() {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    return token !== null;
}

function getAdminToken() {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsername');
    window.location.href = 'admin-login.html';
}

// API helper functions
async function makeAPIRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add authorization token for admin endpoints
    if (endpoint.includes('/admin/') && isAdminLoggedIn()) {
        defaultOptions.headers.Authorization = `Bearer ${getAdminToken()}`;
    }

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Product functions
async function getProducts() {
    return await makeAPIRequest('/products');
}

async function getProduct(productId) {
    return await makeAPIRequest(`/product?id=${productId}`);
}

async function createProduct(productData) {
    return await makeAPIRequest('/admin/create-product', {
        method: 'POST',
        body: JSON.stringify(productData),
    });
}

async function updateProduct(productData) {
    return await makeAPIRequest('/admin/edit-product', {
        method: 'POST',
        body: JSON.stringify(productData),
    });
}

async function deleteProduct(productId) {
    return await makeAPIRequest('/admin/delete-product', {
        method: 'POST',
        body: JSON.stringify({ id: productId }),
    });
}

// Order functions
async function createOrder(orderData) {
    return await makeAPIRequest('/order', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
}

async function trackOrder(orderId) {
    return await makeAPIRequest(`/track?id=${orderId}`);
}

async function getOrders() {
    return await makeAPIRequest('/admin/orders');
}

async function updateOrderStatus(orderData) {
    return await makeAPIRequest('/admin/update-order-status', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
}

// Admin authentication
async function adminLogin(credentials) {
    return await makeAPIRequest('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

// Form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^08[0-9]{8,12}$/;
    return re.test(phone.replace(/[^0-9]/g, ''));
}

function validateRequired(fields) {
    const errors = [];
    fields.forEach(field => {
        if (!field.value || field.value.trim() === '') {
            errors.push(`${field.name || field.id} is required`);
        }
    });
    return errors;
}

// File handling
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('File must be an image (JPG, PNG, or GIF)');
    }
    
    if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
    }
    
    return true;
}

// Loading states
function showLoading(element, text = 'Loading...') {
    element.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">${text}</span>
            </div>
            <p class="mt-2">${text}</p>
        </div>
    `;
}

function hideLoading(element) {
    element.innerHTML = '';
}

// URL helpers
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function updateURLParameter(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url);
}

// Local storage helpers
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve();
    }
}

// WhatsApp integration
function createWhatsAppMessage(phone, message) {
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

function openWhatsApp(phone, message) {
    const url = createWhatsAppMessage(phone, message);
    window.open(url, '_blank');
}

// Image generation placeholder
function generatePlaceholderImage(text, width = 300, height = 200) {
    return `https://picsum.photos/seed/${text}/${width}/${height}.jpg`;
}

// Error handling
function handleAPIError(error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    let message = defaultMessage;
    if (error.message) {
        message = error.message;
    }
    
    showAlert(message, 'danger');
}

// Debounce function for search inputs
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

// Export functions for use in other scripts
window.TokoOnline = {
    API_BASE_URL,
    formatNumber,
    formatDate,
    showAlert,
    isAdminLoggedIn,
    getAdminToken,
    logout,
    makeAPIRequest,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    trackOrder,
    getOrders,
    updateOrderStatus,
    adminLogin,
    validateEmail,
    validatePhone,
    validateRequired,
    readFileAsDataURL,
    validateImageFile,
    showLoading,
    hideLoading,
    getURLParameter,
    updateURLParameter,
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage,
    copyToClipboard,
    createWhatsAppMessage,
    openWhatsApp,
    generatePlaceholderImage,
    handleAPIError,
    debounce
};
