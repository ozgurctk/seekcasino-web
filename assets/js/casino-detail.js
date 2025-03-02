/**
 * Casino Detay Sayfası JavaScript
 */
document.addEventListener('DOMContentLoaded', async function() {
    // DOM Elementleri
    const casinoDetailContainer = document.getElementById('casino-detail');
    const relatedCasinosContainer = document.getElementById('related-casinos');
    
    // URL'den casino ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const casinoId = urlParams.get('id');
    
    // Eğer ID yoksa, ana sayfaya yönlendir
    if (!casinoId) {
        window.location.href = 'index.html';
        return;
    }
    
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
    
    // Casino detaylarını getir ve görüntüle
    await fetchAndDisplayCasinoDetails(casinoId);
    
    // Benzer casinoları getir
    await fetchAndDisplayRelatedCasinos(casinoId);
    
    /**
     * Casino detaylarını getir ve görüntüle
     * @param {string} id - Casino ID
     */
    async function fetchAndDisplayCasinoDetails(id) {
        try {
            // Casino detaylarını getir
            const casino = await apiService.getCasinoById(id);
            
            // Sayfa başlığını güncelle
            document.title = `${casino.name} - SeekCasino`;
            
            // Casino detay HTML'ini oluştur
            casinoDetailContainer.innerHTML = createCasinoDetailHTML(casino);
            
        } catch (error) {
            console.error('Casino detayları getirilirken hata oluştu:', error);
            showErrorMessage('Casino detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    }
    
    /**
     * Benzer casinoları getir ve görüntüle
     * @param {string} id - Mevcut Casino ID
     */
    async function fetchAndDisplayRelatedCasinos(id) {
        try {
            // Bu örnekte, benzer casino olarak en yüksek puanlı casinoları gösteriyoruz
            // Gerçek uygulamada, benzerlik algoritması kullanılabilir
            const topCasinos = await apiService.getTopRatedCasinos(3);
            
            // Mevcut casinoyu filtrele (eğer varsa)
            const relatedCasinos = topCasinos.filter(casino => casino.id !== id);
            
            // Hiç benzer casino yoksa bölümü gizle
            if (relatedCasinos.length === 0) {
                document.querySelector('section').style.display = 'none';
                return;
            }
            
            // İlgili casinoları görüntüle
            relatedCasinosContainer.innerHTML = '';
            
            relatedCasinos.forEach(casino => {
                const casinoCard = createCasinoCard(casino);
                relatedCasinosContainer.appendChild(casinoCard);
            });
            
        } catch (error) {
            console.error('Benzer casinolar getirilirken hata oluştu:', error);
            relatedCasinosContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning">Benzer casinolar yüklenirken bir hata oluştu.</div></div>';
        }
    }
    
    /**
     * Casino detay HTML'ini oluştur
     * @param {Object} casino - Casino nesnesi
     * @returns {string} - Casino detay HTML
     */
    function createCasinoDetailHTML(casino) {
        return `
            <div class="card shadow-lg mb-4">
                <div class="card-body p-4">
                    <div class="casino-detail-header">
                        <img src="assets/img/casino-logos/${casino.casinoLogoNameOnDisk}" alt="${casino.name} Logo" class="casino-detail-logo">
                        <div>
                            <h1 class="h3">${casino.name}</h1>
                            <p class="mb-0">Sahibi: ${casino.owner} | İşletici: ${casino.operator}</p>
                        </div>
                        <div class="casino-detail-rating ms-auto">${casino.point.toFixed(1)}</div>
                    </div>
                    
                    <div class="text-end mb-4">
                        <a href="${casino.casinoExternalAddress}" class="btn btn-primary" target="_blank">
                            <i class="bi bi-box-arrow-up-right me-2"></i>Siteyi Ziyaret Et
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-light">
                            <h2 class="h5 mb-0">Casino Açıklaması</h2>
                        </div>
                        <div class="card-body">
                            <p>${casino.description}</p>
                        </div>
                    </div>
                    
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-light">
                            <h2 class="h5 mb-0">Ekran Görüntüleri</h2>
                        </div>
                        <div class="card-body">
                            <div class="screenshot-gallery">
                                ${casino.screenShots.map(screenshot => `
                                    <div class="screenshot-item">
                                        <img src="assets/img/screenshots/${screenshot.imageNameOnDisc}" alt="${screenshot.name}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-light">
                            <h2 class="h5 mb-0">Artılar ve Eksiler</h2>
                        </div>
                        <div class="card-body">
                            <div class="pros-cons-container">
                                <div class="pros">
                                    <h3 class="h6 text-success">Artılar</h3>
                                    <ul class="pros-list">
                                        ${casino.positives.map(positive => `
                                            <li>${positive.detail}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                                <div class="cons">
                                    <h3 class="h6 text-danger">Eksiler</h3>
                                    <ul class="cons-list">
                                        ${casino.negatives.map(negative => `
                                            <li>${negative.detail}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-light">
                            <h2 class="h5 mb-0">İlginç Bilgiler</h2>
                        </div>
                        <div class="card-body">
                            <ul>
                                ${casino.interestedFacts.map(fact => `
                                    <li>${fact.detail}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-light">
                            <h2 class="h5 mb-0">Casino Bilgileri</h2>
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
                    
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-light">
                            <h2 class="h5 mb-0">Oyun ve Ödeme Bilgileri</h2>
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
                    
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-light">
                            <h2 class="h5 mb-0">Bonuslar</h2>
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
    
    /**
     * Casino kartını oluştur (benzer casinolar için)
     * @param {Object} casino - Casino nesnesi
     * @returns {Element} - Casino kart elementi
     */
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
        const detailsBtn = casinoCard.querySelector('.details-btn');
        detailsBtn.href = `casino-detail.html?id=${casino.id}`;
        
        const visitBtn = casinoCard.querySelector('.visit-btn');
        visitBtn.href = casino.casinoExternalAddress;
        
        return casinoCard.querySelector('.col-lg-4');
    }
    
    /**
     * Hata mesajını göster
     * @param {string} message - Hata mesajı
     */
    function showErrorMessage(message) {
        casinoDetailContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${message}
            </div>
        `;
    }
    
    /**
     * API hatası mesajını göster
     */
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
});
