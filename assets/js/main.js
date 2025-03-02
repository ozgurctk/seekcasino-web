/**
 * SeekCasino Ana JavaScript Dosyası
 */
document.addEventListener('DOMContentLoaded', async function() {
    // DOM elementleri
    const casinoContainer = document.getElementById('casino-container');
    const paginationElement = document.getElementById('pagination');
    const paginationInfoElement = document.getElementById('pagination-info');
    const searchForm = document.getElementById('search-form');
    const searchTermInput = document.getElementById('searchTerm');
    const licenceFilterSelect = document.getElementById('licenceFilter');
    const providerFilterSelect = document.getElementById('providerFilter');
    const gameTypeFilterSelect = document.getElementById('gameTypeFilter');
    const sortOptionsSelect = document.getElementById('sortOptions');
    const casinoDetailModal = new bootstrap.Modal(document.getElementById('casinoDetailModal'));
    const casinoDetailContent = document.getElementById('casinoDetailContent');
    const visitCasinoButton = document.getElementById('visitCasinoButton');
    
    // State (Durum) değişkenleri
    let currentPage = 1;
    let currentPageSize = 9;
    let currentFilters = {};
    let currentSortOrder = 'point-desc';
    let casinos = [];
    let selectedCasino = null;
    
    // API durumunu kontrol et
    try {
        const apiStatus = await apiService.checkApiStatus();
        if (!apiStatus) {
            showApiErrorMessage();
            return;
        }
    } catch (error) {
        showApiErrorMessage();
        return;
    }
    
    // Sayfa yüklendiğinde casinoları getir
    await fetchAndDisplayCasinos();
    
    // Filtreleme verilerini getir
    await fetchAndPopulateFilters();
    
    // Event listeners (Olay dinleyicileri)
    searchForm.addEventListener('submit', handleSearch);
    sortOptionsSelect.addEventListener('change', handleSortChange);
    document.addEventListener('click', handleCasinoCardClick);
    
    // Casinoları getir ve görüntüle
    async function fetchAndDisplayCasinos() {
        showLoadingIndicator();
        
        try {
            const response = await apiService.getCasinos(currentFilters, currentPage, currentPageSize);
            casinos = response.casinos;
            
            if (currentSortOrder !== 'point-desc') {
                sortCasinos();
            }
            
            renderCasinos();
            renderPagination(response.pagination);
            updatePaginationInfo(response.pagination);
            
        } catch (error) {
            showErrorMessage('Casinolar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    }
    
    // Casinoları render et
    function renderCasinos() {
        casinoContainer.innerHTML = '';
        
        if (casinos.length === 0) {
            casinoContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i> Aramanıza uygun casino bulunamadı.
                    </div>
                </div>
            `;
            return;
        }
        
        casinos.forEach(casino => {
            const casinoCard = createCasinoCard(casino);
            casinoContainer.appendChild(casinoCard);
        });
    }
    
    // Casino kartını oluştur
    function createCasinoCard(casino) {
        const template = document.getElementById('casino-card-template');
        const casinoCard = template.content.cloneNode(true);
        
        // Logo ve puanlama
        const logoElement = casinoCard.querySelector('.casino-logo');
        logoElement.src = `assets/img/casino-logos/${casino.casinoLogoNameOnDisk}`;
        logoElement.alt = `${casino.name} Logo`;
        
        const ratingBadge = casinoCard.querySelector('.casino-rating .badge');
        ratingBadge.textContent = casino.point.toFixed(1);
        
        // Sınıflandırma ekle
        if (casino.point >= 8) {
            ratingBadge.classList.add('bg-success');
        } else if (casino.point >= 6) {
            ratingBadge.classList.add('bg-primary');
        } else if (casino.point >= 4) {
            ratingBadge.classList.add('bg-warning');
            ratingBadge.classList.add('text-dark');
        } else {
            ratingBadge.classList.add('bg-danger');
        }
        
        // İçerik
        casinoCard.querySelector('.card-title').textContent = casino.name;
        casinoCard.querySelector('.description').textContent = casino.description;
        
        // Lisanslar
        const licencesContainer = casinoCard.querySelector('.licences');
        casino.licences.forEach(licence => {
            const span = document.createElement('span');
            span.textContent = licence.name;
            licencesContainer.appendChild(span);
        });
        
        // Oyun türleri
        const gameTypesContainer = casinoCard.querySelector('.game-types');
        casino.gameTypes.forEach(gameType => {
            const span = document.createElement('span');
            span.textContent = gameType.name;
            gameTypesContainer.appendChild(span);
        });
        
        // Butonlar
        const viewDetailsBtn = casinoCard.querySelector('.view-details-btn');
        viewDetailsBtn.dataset.casinoId = casino.id;
        
        const visitBtn = casinoCard.querySelector('.visit-btn');
        visitBtn.href = casino.casinoExternalAddress;
        
        return casinoCard.querySelector('.col-lg-4');
    }
    
    // Sayfalama yapısını oluştur
    function renderPagination(pagination) {
        paginationElement.innerHTML = '';
        
        if (pagination.pageCount <= 1) {
            return;
        }
        
        // Önceki sayfa butonu
        const prevPageItem = document.createElement('li');
        prevPageItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        
        const prevPageLink = document.createElement('a');
        prevPageLink.className = 'page-link';
        prevPageLink.href = '#casino-listing';
        prevPageLink.innerHTML = '&laquo;';
        prevPageLink.setAttribute('aria-label', 'Önceki');
        prevPageLink.dataset.page = (currentPage - 1).toString();
        
        prevPageItem.appendChild(prevPageLink);
        paginationElement.appendChild(prevPageItem);
        
        // Sayfa numaraları
        for (let i = 1; i <= pagination.pageCount; i++) {
            // İlgili kapsamda sayfa numaralarını göster
            if (
                i === 1 || // İlk sayfa
                i === pagination.pageCount || // Son sayfa
                Math.abs(i - currentPage) <= 2 // Aktif sayfanın ±2 civarındaki sayfalar
            ) {
                const pageItem = document.createElement('li');
                pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
                
                const pageLink = document.createElement('a');
                pageLink.className = 'page-link';
                pageLink.href = '#casino-listing';
                pageLink.textContent = i;
                pageLink.dataset.page = i.toString();
                
                pageItem.appendChild(pageLink);
                paginationElement.appendChild(pageItem);
            } else if (
                (i === currentPage - 3 && currentPage > 3) ||
                (i === currentPage + 3 && currentPage < pagination.pageCount - 2)
            ) {
                // Arada nokta (...)
                const ellipsisItem = document.createElement('li');
                ellipsisItem.className = 'page-item disabled';
                
                const ellipsisLink = document.createElement('a');
                ellipsisLink.className = 'page-link';
                ellipsisLink.href = '#';
                ellipsisLink.textContent = '...';
                
                ellipsisItem.appendChild(ellipsisLink);
                paginationElement.appendChild(ellipsisItem);
            }
        }
        
        // Sonraki sayfa butonu
        const nextPageItem = document.createElement('li');
        nextPageItem.className = `page-item ${currentPage === pagination.pageCount ? 'disabled' : ''}`;
        
        const nextPageLink = document.createElement('a');
        nextPageLink.className = 'page-link';
        nextPageLink.href = '#casino-listing';
        nextPageLink.innerHTML = '&raquo;';
        nextPageLink.setAttribute('aria-label', 'Sonraki');
        nextPageLink.dataset.page = (currentPage + 1).toString();
        
        nextPageItem.appendChild(nextPageLink);
        paginationElement.appendChild(nextPageItem);
        
        // Sayfa numaralarına tıklama olayını dinle
        paginationElement.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', handlePageClick);
        });
    }
    
    // Sayfalama bilgisini güncelle
    function updatePaginationInfo(pagination) {
        const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
        const endItem = Math.min(startItem + pagination.pageSize - 1, pagination.totalCount);
        
        paginationInfoElement.textContent = `${startItem}-${endItem} / ${pagination.totalCount} casino gösteriliyor`;
    }
    
    // Filtreleme verilerini getir ve selectbox'lara doldur
    async function fetchAndPopulateFilters() {
        try {
            // Lisanslar
            const licences = await apiService.getLicences();
            populateSelectWithOptions(licenceFilterSelect, licences, 'id', 'name');
            
            // Sağlayıcılar
            const providers = await apiService.getProviders();
            populateSelectWithOptions(providerFilterSelect, providers, 'id', 'name');
            
            // Oyun türleri
            const gameTypes = await apiService.getGameTypes();
            populateSelectWithOptions(gameTypeFilterSelect, gameTypes, 'id', 'name');
            
        } catch (error) {
            console.error('Filtreleme verileri yüklenirken hata oluştu:', error);
        }
    }
    
    // Select elementlerine options ekle
    function populateSelectWithOptions(selectElement, options, valueProperty, textProperty) {
        if (!options || options.length === 0) return;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option[valueProperty];
            optionElement.textContent = option[textProperty];
            selectElement.appendChild(optionElement);
        });
    }
    
    // Arama/filtreleme formunu işle
    function handleSearch(event) {
        event.preventDefault();
        
        // Filtreleri temizle
        currentFilters = {};
        
        // Yeni filtreleri ekle
        const searchTerm = searchTermInput.value.trim();
        if (searchTerm) {
            currentFilters.searchTerm = searchTerm;
        }
        
        const licenceId = licenceFilterSelect.value;
        if (licenceId) {
            currentFilters.licenceId = licenceId;
        }
        
        const providerId = providerFilterSelect.value;
        if (providerId) {
            currentFilters.providerId = providerId;
        }
        
        const gameTypeId = gameTypeFilterSelect.value;
        if (gameTypeId) {
            currentFilters.gameTypeId = gameTypeId;
        }
        
        // İlk sayfadan başla
        currentPage = 1;
        
        // Casinoları getir
        fetchAndDisplayCasinos();
    }
    
    // Sayfa tıklamasını işle
    function handlePageClick(event) {
        event.preventDefault();
        
        if (!event.target.dataset.page) {
            return;
        }
        
        const clickedPage = parseInt(event.target.dataset.page);
        
        if (clickedPage === currentPage) {
            return;
        }
        
        currentPage = clickedPage;
        fetchAndDisplayCasinos();
    }
    
    // Sıralama değişikliğini işle
    function handleSortChange(event) {
        currentSortOrder = event.target.value;
        sortCasinos();
        renderCasinos();
    }
    
    // Casinoları sırala
    function sortCasinos() {
        if (!casinos.length) return;
        
        switch (currentSortOrder) {
            case 'point-desc':
                casinos.sort((a, b) => b.point - a.point);
                break;
            case 'point-asc':
                casinos.sort((a, b) => a.point - b.point);
                break;
            case 'name-asc':
                casinos.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                casinos.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
    }
    
    // Casino kartına tıklamayı işle
    function handleCasinoCardClick(event) {
        const viewDetailsBtn = event.target.closest('.view-details-btn');
        
        if (!viewDetailsBtn) {
            return;
        }
        
        const casinoId = viewDetailsBtn.dataset.casinoId;
        if (casinoId) {
            showCasinoDetails(casinoId);
        }
    }
    
    // Casino detaylarını göster
    async function showCasinoDetails(casinoId) {
        try {
            // Modal'ı göster ve yükleniyor içeriğini göster
            casinoDetailContent.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Yükleniyor...</span>
                    </div>
                    <p class="mt-2">Casino detayları yükleniyor...</p>
                </div>
            `;
            
            casinoDetailModal.show();
            
            // Casino detaylarını getir
            const casino = await apiService.getCasinoById(casinoId);
            selectedCasino = casino;
            
            // Ziyaret butonunu ayarla
            visitCasinoButton.href = casino.casinoExternalAddress;
            
            // Modal başlığını ayarla
            document.querySelector('#casinoDetailModal .modal-title').textContent = casino.name;
            
            // Modal içeriğini oluştur
            casinoDetailContent.innerHTML = createCasinoDetailHTML(casino);
            
        } catch (error) {
            casinoDetailContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Casino detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                </div>
            `;
        }
    }
    
    // Casino detay HTML'ini oluştur
    function createCasinoDetailHTML(casino) {
        return `
            <div class="casino-detail-header">
                <img src="assets/img/casino-logos/${casino.casinoLogoNameOnDisk}" alt="${casino.name} Logo" class="casino-detail-logo">
                <div>
                    <h3>${casino.name}</h3>
                    <p>Sahibi: ${casino.owner} | İşletici: ${casino.operator}</p>
                </div>
                <div class="casino-detail-rating">${casino.point.toFixed(1)}</div>
            </div>
            
            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="detail-section">
                        <h4 class="detail-title">Casino Açıklaması</h4>
                        <p>${casino.description}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4 class="detail-title">Ekran Görüntüleri</h4>
                        <div class="screenshot-gallery">
                            ${casino.screenShots.map(screenshot => `
                                <div class="screenshot-item">
                                    <img src="assets/img/screenshots/${screenshot.imageNameOnDisc}" alt="${screenshot.name}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4 class="detail-title">Artılar ve Eksiler</h4>
                        <div class="pros-cons-container">
                            <div class="pros">
                                <h5 class="text-success">Artılar</h5>
                                <ul class="pros-list">
                                    ${casino.positives.map(positive => `
                                        <li>${positive.detail}</li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div class="cons">
                                <h5 class="text-danger">Eksiler</h5>
                                <ul class="cons-list">
                                    ${casino.negatives.map(negative => `
                                        <li>${negative.detail}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4 class="detail-title">İlginç Bilgiler</h4>
                        <ul>
                            ${casino.interestedFacts.map(fact => `
                                <li>${fact.detail}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">Casino Bilgileri</h5>
                        </div>
                        <div class="card-body">
                            <div class="detail-item">
                                <strong>Kuruluş Yılı:</strong> ${casino.establishedDate}
                            </div>
                            <div class="detail-item">
                                <strong>Yıllık Gelir:</strong> ${casino.annualRevenue}
                            </div>
                            <div class="detail-item">
                                <strong>Lisanslar:</strong>
                                <div class="licence-icons">
                                    ${casino.licences.map(licence => `
                                        <span>${licence.name}</span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="detail-item">
                                <strong>Diller:</strong>
                                <div class="language-icons">
                                    ${casino.languages.map(language => `
                                        <span>${language.name}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">Oyun ve Ödeme Bilgileri</h5>
                        </div>
                        <div class="card-body">
                            <div class="detail-item">
                                <strong>Oyun Türleri:</strong>
                                <div class="game-type-icons">
                                    ${casino.gameTypes.map(gameType => `
                                        <span>${gameType.name}</span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="detail-item">
                                <strong>Sağlayıcılar:</strong>
                                <div class="provider-icons">
                                    ${casino.providers.map(provider => `
                                        <span>${provider.name}</span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="detail-item">
                                <strong>Ödeme Yöntemleri:</strong>
                                <div class="payment-icons">
                                    ${casino.paymentMethods.map(payment => `
                                        <span>${payment.name}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">Bonuslar</h5>
                        </div>
                        <div class="card-body">
                            <div class="detail-item">
                                <strong>Para Yatırma Bonusları:</strong>
                                <ul class="mt-2">
                                    ${casino.depositBonuses.map(bonus => `
                                        <li>${bonus.detail}</li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div class="detail-item">
                                <strong>Para Yatırmasız Bonuslar:</strong>
                                <ul class="mt-2">
                                    ${casino.noDepositBonuses.map(bonus => `
                                        <li>${bonus.detail}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Yükleniyor göstergesini göster
    function showLoadingIndicator() {
        casinoContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Yükleniyor...</span>
                </div>
                <p class="mt-2">Casinolar yükleniyor...</p>
            </div>
        `;
    }
    
    // Hata mesajını göster
    function showErrorMessage(message) {
        casinoContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    ${message}
                </div>
            </div>
        `;
    }
    
    // API Hatası mesajını göster
    function showApiErrorMessage() {
        document.querySelector('main').innerHTML = `
            <div class="container py-5">
                <div class="alert alert-danger">
                    <h4><i class="bi bi-exclamation-triangle-fill me-2"></i> API Bağlantı Hatası</h4>
                    <p>API hizmetine erişim sağlanamıyor. Lütfen şunları kontrol edin:</p>
                    <ul>
                        <li>API hizmetinin çalışır durumda olduğundan emin olun.</li>
                        <li>Ağ bağlantınızı kontrol edin.</li>
                        <li>CORS (Çapraz Kaynak Paylaşımı) ayarlarının doğru yapılandırıldığından emin olun.</li>
                    </ul>
                    <p>Sorun devam ederse, lütfen sistem yöneticinizle iletişime geçin.</p>
                    <button class="btn btn-primary mt-3" onclick="location.reload()">Sayfayı Yenile</button>
                </div>
            </div>
        `;
    }
    
    // Demo amaçlı görsel dizinlerini kontrol et
    function checkImagePaths() {
        // Demo amaçlı, gerçek uygulamada bu kısım olmayabilir
        const imageDirectories = ['casino-logos', 'screenshots'];
        
        imageDirectories.forEach(dir => {
            const path = `assets/img/${dir}`;
            // Sadece konsola uyarı yazdır
            console.log(`Not: Görsel dizini kontrol edilmeli: ${path}`);
        });
    }
    
    // Demo amaçlı görsel dizinlerini kontrol et
    checkImagePaths();
});
