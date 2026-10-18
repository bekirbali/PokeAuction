# PokéAuction: 1v1 Blind Draft & Auto-Battler

> **Trend:** TikTok/YouTube "Kör Takım Kurma" trendi ile klasik Pokedex / Pokemon Gen 1 evrenini birleştiren, gerçek zamanlı 1v1 açık artırma ve sinematik otomatik dövüş oyunu.

---

## 🎮 Nasıl Oynanır?
1. **Lobi & Oda:** Bir eğitmen adı girin, 'Yeni Oda Kur' diyerek 4 haneli oda kodunu arkadaşınıza gönderin.
2. **Kör Açık Artırma (100 Altın Bütçe):**
   - Hakem sırayla rastgele bir Gen 1 Pokemon ortaya atar.
   - Süre işlerken canlı teklif savaşına girin (+1, +2, +5, +10 veya özel miktar). Teklif geldikçe sayaç resetlenir.
   - **İflas & İteleme Kuralı:** Parası erken biten teklif veremez; bütçesi olan oyuncu sıradaki Pokemon'u ya **Bedavaya Alır** ya da **Zorla Rakibe İteler!** (Magikarp / Caterpie taktiği).
3. **Taktiksel Dizilim (20sn):**
   - 5'e 5 takımlar tamamlanınca gizli sıralama ekranında Pokemon'ların sahaya çıkış sırasını belirleyin (Öncü'den Son Kale'ye).
4. **Meydan Savaşı (King of the Hill):**
   - Hız, statlar ve tip üstünlüklerine göre 1v1 otomatik dövüş başlar.
   - Kazanan Pokemon kalan canıyla sahada kalır, kaybedenin yerine sıradaki Pokemon çıkar.
   - 5 Pokemon'u da bayılan maçı kaybeder.
5. **Maç Sonu & Rövanş:** MVP kartı, verilen hasarlar ve tek tıkla Rövanş!

---

## 🚀 Çalıştırma

### Geliştirme Modu (Hot-Reloading)
```bash
# Kök dizinde:
npm run dev
```
* Backend: `http://localhost:4000`
* Frontend: `http://localhost:3000`

### Tek Sunucuda Canlıya Alma (Monorepo Production)
```bash
# Frontend derlenir ve Express tek porttan hem websocket'i hem siteyi sunar:
npm run build
npm start
```
* Oyun `http://localhost:4000` adresinde tek süreç olarak çalışır.

---

## 🛠️ Teknoloji Yığını
* **Backend:** Node.js, Express, Socket.io
* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
* **Veri:** 151 Gen 1 Pokemon (Gerçek statlar, tip matrisi, animasyonlu Showdown GIF sprite'ları, PokeAPI çığlıkları)
* **Ses Sistemi:** Web Audio API gerçek zamanlı retro sentezleyici (Tik-tak, tokmak, vuruş, kritik, bayılma)
