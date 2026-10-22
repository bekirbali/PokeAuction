# PokéAuction — Kapsamlı Hata Düzeltme ve Geliştirme Planı

Bu belge, PokéAuction projesinde tespit edilen 11 hata ve geliştirme isteğinin teknik analizini, kök nedenlerini, Furkan'ın geri bildirimleriyle güncellenmiş mimari çözümleri ve test adımlarını içerir.

---

## 📊 Genel Durum Özeti

| Faz | Kapsam | İlgili Maddeler | Durum |
| :--- | :--- | :--- | :--- |
| **Faz 1** | UI Temizliği, İkonlar & RP / Lig Senkronizasyonu | Madde 9, 10 | ✅ Tamamlandı |
| **Faz 2** | PvP Dizilim Kontrolü, Oyun Hızı & Host Oda Ayarları | Madde 3, 4, 5 | ⏳ Beklemede |
| **Faz 3** | BotAI Teklif Mantığı & Evrim Seviye Stratejisi | Madde 6, 11 | ⏳ Beklemede |
| **Faz 4** | Yetenek Çeşitliliği, Mobil VFX Optimizasyonu, Element Radarı & TCG | Madde 1, 2, 7, 8, 12 | ⏳ Beklemede |

---

## 📌 FAZ 1: UI Temizliği, İkonlar & RP/Lig Senkronizasyonu

### [Madde 9] Info Kartı İkonunun Profesyonelleştirilmesi
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `frontend/src/components/Lobby.jsx`
  * `frontend/src/components/TypeRadarModal.jsx`
* **Furkan'ın Geri Bildirimi & Kök Neden:**
  * Hem masaüstü hem de mobil sürümde `Sparkles` (`✨` yıldızlı emoji) tamamen kaldırılacak; yerine standart, profesyonel bir `Info` ikonu yerleştirilecek.
* **Uygulanan Çözüm:**
  * `Lobby.jsx` üzerindeki element rehberi butonunda ve `TypeRadarModal.jsx` başlığında `Sparkles` yerine `lucide-react`'tan `Info` ikonu yerleştirildi.
* **Test & Kabul Kriteri:**
  * Hem mobilde hem PC'de yıldızlı emoji yerine doğrudan `Info` (ℹ️) ikonu görünüyor.

---

### [Madde 10] "KANTO LEAGUE" Rozeti Kaldırma & Mod/Streak/RP Karışıklığı
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `frontend/src/components/Lobby.jsx`
  * `frontend/src/components/MatchSummary.jsx`
  * `backend/src/game/RoomManager.js`
  * `frontend/src/utils/stats.js`
* **Mevcut Durum & Kök Neden:**
  1. `Lobby.jsx` başlığında `POKÉAUCTION` yazısının yanında `<span ...>KANTO LEAGUE</span>` rozeti bulunuyor.
  2. `RoomManager.js` içerisindeki `broadcastRoom` fonksiyonu, `ROOM_UPDATE` yayınlarken `isBotGame` ve `botDifficulty` alanlarını göndermiyor.
  3. Bu sebeple maç bittiğinde `MatchSummary.jsx` bot maçlarını da PvP zannedip kazanılan galibiyetleri ve puanları `poke_pvp_rp` ve `poke_pvp_streak`'e yazıyor.
  4. Sonuç olarak çok oyunculu sekmesinde bot maçlarının 326 RP'si ve 10 serisi görünüyor, tek kişilik sekmede ise sıfır (0 RP) kalıyor.
* **Uygulanacak Çözüm:**
  1. `Lobby.jsx`'teki "KANTO LEAGUE" rozeti kaldırılacak.
  2. `RoomManager.js` broadcast verisine `isBotGame` ve `botDifficulty` eklenecek.
  3. `MatchSummary.jsx` içinde bot maçı kontrolü hem `room.isBotGame` hem de `room.players.some(p => p.isBot)` ile garanti altına alınacak.
  4. Kullanıcının mevcut 326 RP ve 10 galibiyet serisini korumak için, lobi ilk yüklendiğinde tek seferlik bir veri aktarımı (migration) yapılarak bu puanlar doğru anahtara (`poke_bot_rp`, `poke_bot_streak`) taşınacak.
* **Test & Kabul Kriteri:**
  * Başlıkta "KANTO LEAGUE" yazısı olmayacak.
  * Tek kişilik bot modu seçildiğinde doğru bot ligi derecesi (Rozet Ustası, 326 RP, 10 Seri) görünecek.
  * Çok oyunculu sekmesinde yalnızca gerçek oyuncularla yapılan maçların derecesi yer alacak.

---

## 📌 FAZ 2: PvP Dizilim, Oyun Hızı & Host Oda Ayarları

### [Madde 3] PvP Oyun Hızı Senkronizasyonu (Sadece Host Kontrolü)
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `backend/src/game/RoomManager.js`
  * `backend/src/server.js`
  * `frontend/src/App.jsx`
  * `frontend/src/components/BattleArena.jsx`
* **Mevcut Durum & Kök Neden:**
  * Oyun hızı `BattleArena.jsx` içinde tamamen yerel bir React `useState(1)` durumu. Sunucu ile haberleşmiyor; iki oyuncu bağımsız hızlarda oynuyor.
* **Uygulanan Çözüm:**
  1. `RoomManager.js` oda nesnesine `room.battleSpeed = 1` tanımlandı ve `BATTLE_START` ile istemcilere iletildi.
  2. Sunucuya `SET_BATTLE_SPEED` socket olayı eklendi; yalnızca oda kurucusu (`room.players[0].id === socket.id`) hızı değiştirebiliyor.
  3. Host hızı değiştirdiğinde sunucu `BATTLE_SPEED_UPDATED` olayıyla odadaki tüm istemcilere yeni hızı iletiyor.
  4. Misafir oyuncunun ekranında hız butonları salt okunur yapıldı ve `(Host)` etiketiyle kurucu kontrolünde olduğu belirtildi.
  5. Tek kişilik AI maçlarında kullanıcı eskisi gibi kendi hızını bağımsız yönetmeye devam ediyor.
* **Test & Kabul Kriteri:**
  * PvP maçında host hızı değiştirdiğinde her iki oyuncunun savaşı eşzamanlı hızlanıyor. Misafir oyuncu değiştiremiyor.

---

### [Madde 4] Takım Diziliminde "Hazırım" Durumunu Geri Alabilme (Unready)
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `frontend/src/components/LineupPhase.jsx`
  * `backend/src/game/RoomManager.js`
  * `backend/src/server.js`
* **Mevcut Durum & Kök Neden:**
  * Oyuncu "Dizilimi Onayla" butonuna bastığında `isReady = true` oluyor, sürükle-bırak kapanıyor ve buton devre dışı kalıyordu. Rakip beklenirken fikrini değiştiren oyuncu dizilimi bozamıyordu.
* **Uygulanan Çözüm:**
  1. Sunucuya `PLAYER_UNREADY` socket olayı eklendi; `player.ready = false` yapılıyor.
  2. Frontend `LineupPhase.jsx` bileşeninde oyuncu hazır durumdayken ve rakip henüz hazır değilse "Sıralamayı Değiştir" butonu gösterildi.
  3. İptal butonuna basıldığında sürükle-bırak ve ok kontrolleri tekrar açılıyor. İki taraf da hazır olduğunda savaş otomatik başlıyor.
* **Test & Kabul Kriteri:**
  * Hazırım dedikten sonra rakip beklenirken iptal edilebiliyor, kartların sırası tekrar değiştirilip yeniden onay verilebiliyor.

---

### [Madde 5] Host Oda Ayarları (Magikarp ve 1. Seviyeleri Havuzdan Kaldırma)
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `frontend/src/components/Lobby.jsx`
  * `backend/src/game/RoomManager.js`
  * `backend/src/server.js`
* **Mevcut Durum & Kök Neden:**
  * `RoomManager.getUniquePokemon` havuzu doğrudan tüm 151 Pokémon arasından seçiyordu; hostun tercih yapabileceği bir filtre parametresi yoktu.
* **Uygulanan Çözüm:**
  1. Lobi ekranında "Yeni Oda Oluştur" alanına host için yapılandırma seçenekleri eklendi:
     * 🚫 **Magikarp'ı Kapat (No Meme):** Havuzdan Magikarp elenir.
     * 🚫 **1. Seviye Bebek Pokémonları Kaldır:** Temel formlar (Squirtle, Charmander, Pidgey vb.) elenir; doğrudan güçlü/evrimleşmiş formlar çıkar.
  2. Tercihler `CREATE_ROOM` (ve solo bot oyunu için `START_BOT_GAME`) ile backend'e iletilip `room.settings` altına kaydedildi.
  3. `RoomManager.getUniquePokemon` filtreleme adımında bu ayarlar işletildi (tier oranları otomatik yeniden dengelendi).
  4. Oda bekleme salonunda aktif kurallar rozet olarak iki oyuncuya da gösterildi.
* **Test & Kabul Kriteri:**
  * Ayar seçildiğinde açık artırmaya asla Magikarp veya 1. seviye temel formlar gelmiyor. Bekleme ekranında kural rozetleri görünüyor.

---

## 📌 FAZ 3: BotAI Teklif Mantığı & Evrim Stratejisi

### [Madde 6] Botun 1. Seviye / Common Pokémon Teklif Dengesi
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `backend/src/game/BotAI.js`
* **Mevcut Durum & Kök Neden:**
  * `BotAI.decideBid` fonksiyonu, tür çeşitliliği veya temel statlar sebebiyle Common kartlara 2-3G değer biçebiliyordu.
  * Örneğin; Red botunun kadrosunda 4 Pokémon varken ve 7. turda Ponyta'ya oyuncu 1G açtığında, bot 2G karşı teklif vererek son yuvasını ve kalan son parasını harcıyordu.
* **Uygulanan Çözüm:**
  1. **Common İteleme Kuralı:** Rakip oyuncu Common veya Seviye-1 bir Pokémon için 1G açılış yaptığında, bot **kesinlikle karşı teklif (2G) vermiyor**, hemen PAS diyerek kartı 1G'ye rakibin almasını sağlıyor.
  2. **Yuva Koruma Kuralı:** Botun elinde 3 veya daha fazla Pokémon varken, kalan yuvalar çok değerli olduğu için Common kartlara karşı teklif vermek tamamen engellendi. Bot sadece kendi açılış sırası geldiğinde zorunlu 1G teklif veriyor.
* **Test & Kabul Kriteri:**
  * Oyuncu 1G ile Common kart açtığında bot 2G yükseltme yapmıyor, anında pas geçiyor (Node simülasyonu ile doğrulandı).
  * Kadro 3 veya 4 Pokémona ulaştığında bot Common kartlara teklif vermeyi tamamen kesiyor.

---

### [Madde 11] Botun Alt Seviyesi Olan Pokémon'un Üst Seviyesine Teklif Yapmaması
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `backend/src/game/BotAI.js` (`EVOLUTION_FAMILIES`)
* **Mevcut Durum & Kök Neden:**
  * `BotAI.js` içerisindeki mevcut aile kontrolü ve tür çakışması cezaları (`overlapPenalty`), botun elinde Squirtle varken Blastoise çıktığında değeri sıfıra düşürerek pas geçmesine neden oluyordu.
* **Uygulanan Çözüm:**
  1. **Evrim Yükseltme (Upgrade) Mantığı:** Eğer botun kadrosunda bir ailenin alt formu (ör. Squirtle, Stage 1) varsa ve üst formu (Blastoise, Stage 3) açık artırmaya çıkarsa, bu kart kadro için yüksek öncelikli bir takviye (`isEvolutionUpgrade = true`, +2 upgrade bonus) olarak değerlendirildi.
  2. Alt form ile üst form arasındaki tür çakışması cezası kaldırıldı.
  3. Değer sıfırlama (`return 0`) kuralı **yalnızca** botun elinde zaten üst form varken alt form geldiğinde (ör. Blastoise varken Squirtle çıkması) çalışıyor.
* **Test & Kabul Kriteri:**
  * Bot ilk turlarda Squirtle almış olsa bile, Blastoise çıktığında algılanan değer 14G'ye yükselerek bütçesi dahilinde kararlılıkla teklif veriyor (Node simülasyonu ile doğrulandı). Blastoise varken Squirtle geldiğinde ise kesinlikle 0G (Pas) veriyor.

---

## 📌 FAZ 4: Beceriler, Mobil VFX Optimizasyonu, Element Radarı & TCG

### [Madde 1] Karakter Skillerinde Görsel Çeşitlilik (En Yüksek Hasar Korunarak)
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `backend/src/data/pokemon_gen1.json`
  * `backend/src/game/BattleEngine.js`
* **Furkan'ın Geri Bildirimi & Kök Neden:**
  * Amaç matematiksel mantığı bozmak değil (en çok vuracak hamleyi seçmesi zaten doğru). Amaç; karakterlere **aynı en yüksek hasara sahip alternatif saldırılar** eklemek.
* **Uygulanan Çözüm:**
  1. 97 adet 1. seviye olmayan ve efsanevi Pokémon'un moveset'inde, birincil güçlü saldırısıyla **aynı güç/hasar katsayısına** ve farklı görsel efektlere sahip alternatif imza hareketleri dengelendi (ör. Mewtwo için Psychic 100, Psystrike 100, Aura Sphere 100, Shadow Ball 100; Charizard için Fire Blast 120, Flamethrower 120, Brave Bird 120, Air Slash 120 vb.).
  2. `BattleEngine.selectBestMove` içinde eşit veya tepe hasara sahip hareketler tespit edilerek turlar arasında bir önceki hamleden farklısını seçecek şekilde varyasyon/rotasyon mekanizması eklendi.
* **Test & Kabul Kriteri:**
  * Mewtwo nötr hedeflere karşı her tur `Psychic` ile `Psystrike` arasında dönüşümlü saldırı yapıyor; dövüş zayıflığı olan hedeflere ise `Aura Sphere` vuruyor. Hasar kaybı olmadan tam görsel çeşitlilik sağlandı (Simülasyonla doğrulandı).

---

### [Madde 2] Hyper Beam & Solar Beam Mobil VFX Optimizasyonu
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `frontend/src/components/BattleCanvasVFX.jsx`
* **Furkan'ın Geri Bildirimi & Kök Neden Analizi:**
  * *Gözlem:* Bilgisayarda 7 denemenin 5'inde düzgün çalışırken mobilde 7'de 0 veya 1 çalışıyor. Cihaz gücüne göre tamamlanma oranı değişiyor.
  * *Teknik Kök Neden:* Mobilde GPU/CPU donanım kısıtları ve 2x/3x DPR yüzünden frame rate düşüyordu. 100ms'lik dar uzanma penceresi kare atlamasında atlanıyor, partikül yükü canvas'ı kilitliyordu.
* **Uygulanan Çözüm:**
  1. Mobilde `dpr` 1'e sabitlenerek piksel doldurma yükü 4 kat hafifletildi.
  2. Partikül sayısı mobilde 55'ten 18-20'ye çekildi ve ağır radyal gradientler düz dolgularla optimize edildi.
  3. Lazerin hedefe uzanma süresi kare hızından bağımsız kılındı (`progress >= 0.26` itibariyle doğrudan %100 hedefe kilitli ve `0.65`e kadar tam güçte ekranda kalıyor, `0.90`a kadar yumuşak sönüyor).
* **Test & Kabul Kriteri:**
  * Mobilde en zayıf cihazlarda dahi Solar Beam ve Hyper Beam atıldığında ışın çemberde takılmıyor, sahayı kat edip rakibe ulaşıyor ve patlıyor.

---

### [Madde 8] Element Bilgi Kartının 2 Sekmeli Güncellenmesi (Saldırı & Savunma)
* **Durum:** ✅ Tamamlandı
* **İlgili Dosyalar:**
  * `frontend/src/components/TypeRadarModal.jsx`
* **Furkan'ın Geri Bildirimi:**
  * Modal net 2 sekmeye ayrılacak:
    1. **Saldırı Sekmesi:** Seçili element saldırırken kime 2x vurur, kime 0.5x vurur, kime etki etmez (0x).
    2. **Savunma Sekmesi:** Seçili element savunmadayken kimden 2x çok hasar alır (zayıflık), kimden 0.5x az hasar alır (direnç), kimden hiç hasar almaz (bağışıklık). Savunma da saldırı kadar önemli, görsel ağırlığı eşit olmalı.
* **Uygulanan Çözüm:**
  1. Modala `Saldırı (Ofansif)` ve `Savunma (Defansif)` şeklinde 2 sekmeli şık geçiş butonu eklendi.
  2. Çemberdeki 15 element seçili sekmeye göre dinamik olarak avantaj/dezavantaj vurgularına büründürüldü.
  3. Alt detay panelleri saldırı sekmesinde "Süper Etkili (2.0x)" ve "Az Etkili (0.5x/0x)" gösterirken; savunma sekmesinde aynı görsel ağırlıkta "Zayıflıklar (2.0x Hasar Alır)" ve "Dirençler & Bağışıklık (0.5x/0x)" panellerini sunuyor.
* **Test & Kabul Kriteri:**
  * Kullanıcı savunma sekmesine geçtiğinde elementin tüm savunma zayıflık ve dirençlerini saldırı sekmesiyle tam eşit zenginlikte görebiliyor.

---

### [Madde 7] Açık Artırma Kart Tasarımı (TCG Formatı - Opsiyonel/Son Aşama)
* **Durum:** ⏳ Beklemede (Faz 4 sonunda netleştirilecek)
* **İlgili Dosyalar:**
  * `frontend/src/components/PokemonCard.jsx`
  * `frontend/src/index.css`
* **Furkan'ın Geri Bildirimi:**
  * Kesin bir zorunluluk değil, havalı duran bazı TCG konseptleri olduğu için değerlendirilecek. Faz 4'e gelindiğinde nihai tasarımı birlikte kararlaştırıp netleştireceğiz.
* **Uygulanacak Çözüm:**
  * Faz 4'e ulaşıldığında kart çerçevesi ve parlama efektleri alternatifli olarak incelenip Furkan'ın onayına göre uygulanacak.

---

### [Madde 12] Fiziksel/Özel Stat Uyumsuzlukları & İkonik Hamle Dengelemesi (Krabby Crabhammer vb.)
* **Durum:** ⏳ Beklemede (Yapılacaklar listesine alındı)
* **İlgili Dosyalar:**
  * `backend/src/data/pokemon_gen1.json`
  * `backend/src/game/BattleEngine.js`
* **Furkan'ın Geri Bildirimi & Kök Neden:**
  * Savaşta bazı karakterlerin kendi elementleri yerine garip şekilde sürekli `Body Slam` vurduğu fark edildi (örneğin Krabby vs Dodrio maçında Krabby sürekli Body Slam atıyor).
  * *Kök Neden:* Krabby gibi fiziksel canavarların Physical Attack statı çok yüksek (`105`), Special Attack statı ise çok düşüktür (`25`). Veritabanında su hareketleri özel (`Hydro Pump`, `Surf`) tanımlanıp 3. hamle olarak fiziksel `Body Slam` verildiğinde, savaş motoru hasar maksimizasyonu gereği 2.6 kat daha fazla vuran Body Slam'i (`8.925` vs `3.437`) seçiyor.
* **Uygulanacak Çözüm:**
  1. Krabby ve Kingler'a gerçek imza yeteneği olan `Crabhammer` (Su türü, Fiziksel / Physical, 100 Güç) eklenecek; böylece STAB + 105 Attack ile 13.125 hasar vurarak Body Slam'i tamamen saf dışı bırakacak.
  2. Benzer stat uçurumu olan diğer fiziksel Pokémon'lar (Hitmonlee tekmeleri, Pinsir kıskaçları, Muk vb.) taranarak temalarına uygun fiziksel hamleler tanımlanacak.
* **Test & Kabul Kriteri:**
  * Krabby ve Kingler nötr hedeflere karşı Body Slam yerine kıskaçlarıyla Crabhammer vuracak.

---

## 🚀 Uygulama Adımları Sırası

1. **Adım 1:** Faz 1 (UI Temizliği, Info İkonu & RP/Lig Senkronizasyonu)
2. **Adım 2:** Faz 2 (PvP Hız Senkronu, Lineup Unready & Host Ayarları)
3. **Adım 3:** Faz 3 (BotAI Common İteleme & Evrim Upgrade Mantığı)
4. **Adım 4:** Faz 4 (Skill Çeşitliliği, Mobil VFX Optimizasyonu, 2 Sekmeli Radar & TCG)
