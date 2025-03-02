/**
 * API Servis Sınıfı
 * Backend ile iletişim kurmak için gerekli metotları içerir
 */
class ApiService {
    constructor() {
        this.baseUrl = 'https://api.seekcasino.io/api'; // Gerçek API URL'nizi buraya ekleyin
        
        // Geliştirme aşamasında yerel API kullanımı
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.baseUrl = 'https://localhost:50354/api';
        }
    }

    /**
     * Casinoları getirir
     * @param {Object} filters - Filtre parametreleri
     * @param {number} pageNumber - Sayfa numarası
     * @param {number} pageSize - Sayfa başına eleman sayısı
     * @returns {Promise<Object>} - Casino listesi ve sayfalama bilgileri
     */
    async getCasinos(filters = {}, pageNumber = 1, pageSize = 9) {
        try {
            // Query parametrelerini oluştur
            const params = new URLSearchParams();
            params.append('pageNumber', pageNumber);
            params.append('pageSize', pageSize);
            
            // Filtreleri ekle
            if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
            if (filters.licenceId) params.append('licenceId', filters.licenceId);
            if (filters.providerId) params.append('providerId', filters.providerId);
            if (filters.gameTypeId) params.append('gameTypeId', filters.gameTypeId);
            if (filters.languageId) params.append('languageId', filters.languageId);
            if (filters.paymentMethodId) params.append('paymentMethodId', filters.paymentMethodId);
            
            const response = await fetch(`${this.baseUrl}/Casinos?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Casinoları getirirken hata oluştu:', error);
            throw error;
        }
    }

    /**
     * Casino detaylarını getirir
     * @param {string} id - Casino ID
     * @returns {Promise<Object>} - Casino detayları
     */
    async getCasinoById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/Casinos/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Casino detayları getirilirken hata oluştu (ID: ${id}):`, error);
            throw error;
        }
    }

    /**
     * Tüm lisansları getirir
     * @returns {Promise<Array>} - Lisans listesi
     */
    async getLicences() {
        try {
            const response = await fetch(`${this.baseUrl}/Licences`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Lisansları getirirken hata oluştu:', error);
            throw error;
        }
    }

    /**
     * Tüm sağlayıcıları getirir
     * @returns {Promise<Array>} - Sağlayıcı listesi
     */
    async getProviders() {
        try {
            const response = await fetch(`${this.baseUrl}/Providers`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Sağlayıcıları getirirken hata oluştu:', error);
            throw error;
        }
    }

    /**
     * Tüm oyun türlerini getirir
     * @returns {Promise<Array>} - Oyun türleri listesi
     */
    async getGameTypes() {
        try {
            const response = await fetch(`${this.baseUrl}/GameTypes`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Oyun türlerini getirirken hata oluştu:', error);
            throw error;
        }
    }

    /**
     * Tüm dilleri getirir
     * @returns {Promise<Array>} - Dil listesi
     */
    async getLanguages() {
        try {
            const response = await fetch(`${this.baseUrl}/Languages`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Dilleri getirirken hata oluştu:', error);
            throw error;
        }
    }

    /**
     * Tüm ödeme yöntemlerini getirir
     * @returns {Promise<Array>} - Ödeme yöntemleri listesi
     */
    async getPaymentMethods() {
        try {
            const response = await fetch(`${this.baseUrl}/PaymentMethods`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Ödeme yöntemlerini getirirken hata oluştu:', error);
            throw error;
        }
    }

    /**
     * En yüksek puanlı casinoları getirir
     * @param {number} count - Kaç casino getirileceği
     * @returns {Promise<Array>} - Casino listesi
     */
    async getTopRatedCasinos(count = 5) {
        try {
            const response = await fetch(`${this.baseUrl}/Casinos/top-rated?count=${count}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('En yüksek puanlı casinoları getirirken hata oluştu:', error);
            throw error;
        }
    }

    /**
     * API çalışıyor mu diye kontrol eder
     * @returns {Promise<boolean>} - API'nin durumu
     */
    async checkApiStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch (error) {
            console.error('API durum kontrolünde hata:', error);
            return false;
        }
    }
}

// Global olarak kullanılabilmesi için tek bir instance oluştur
const apiService = new ApiService();
