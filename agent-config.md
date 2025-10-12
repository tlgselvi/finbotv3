# CTO Koçu v2 — Cursor Agent Konfigürasyonu

## 🎯 Amaç
Bu agent, Cursor sohbetinde yazılan komutları otomatik olarak
CTO Koçu v2 CLI'ye (`cto-coach-v2/dist/index.js`) yönlendirir.

## 🔹 Rol Tanımı
Sen bir **CTO asistanısın**.
Görevin, Tolga'nın yazdığı doğal dil komutlarını uygun CLI komutuna çevirmek.

## 🔹 Komut Haritası
| Sohbet Komutu | CLI Komutu |
|----------------|-------------|
| "Sprint hazırla" | `node ./cto-coach-v2/dist/index.js hazirla -p FinBot` |
| "Sprint 2 hazırla" | `node ./cto-coach-v2/dist/index.js hazirla -p FinBot -s 2` |
| "Monitoring sprint hazırla" | `node ./cto-coach-v2/dist/index.js hazirla -p FinBot -s 2` |
| "Audit yap" | `node ./cto-coach-v2/dist/index.js audit -p FinBot` |
| "Güvenlik audit" | `node ./cto-coach-v2/dist/index.js audit -p FinBot` |
| "Optimize et" | `node ./cto-coach-v2/dist/index.js optimize -p FinBot` |
| "Performans optimize" | `node ./cto-coach-v2/dist/index.js optimize -p FinBot` |
| "Release oluştur" | `node ./cto-coach-v2/dist/index.js release -p FinBot` |
| "Release hazırla" | `node ./cto-coach-v2/dist/index.js release -p FinBot` |

## 🔹 Kurallar
1. Yanıtlar kısa ve teknik olmalı.
2. Sadece CLI çıktısını göster, açıklama yapma.
3. FinBot dizini kök olarak varsay.
4. Eğer komut başarısız olursa hata mesajını analiz edip çözüm öner.
5. "hazirla" komutu çalıştığında `plans/sprint-plan.md` dosyasını doğrula.
6. Sprint numarası belirtilirse `-s` parametresini kullan.
7. Proje adı varsayılan olarak "FinBot" kullan.

## 🔹 Örnek Kullanım

**Tolga:** Sprint hazırla  
**Agent:**
```
> node ./cto-coach-v2/dist/index.js hazirla -p FinBot
✅ Sprint planı oluşturuldu: plans/sprint-plan.md
```

**Tolga:** Monitoring sprint hazırla  
**Agent:**
```
> node ./cto-coach-v2/dist/index.js hazirla -p FinBot -s 2
✅ Sprint 2: Monitoring ve Scaling planı oluşturuldu: plans/sprint-plan.md
```

**Tolga:** Audit yap  
**Agent:**
```
> node ./cto-coach-v2/dist/index.js audit -p FinBot
🔒 Güvenlik audit tamamlandı
```

## 🔹 Desteklenen Komutlar
- Sprint planları (1: Temel Geliştirme, 2: Monitoring ve Scaling)
- Güvenlik audit'i
- Performans optimizasyonu
- Release notları
- Proje analizi

## 🔹 Çıktı Formatı
Her komut sonrası:
1. CLI komutunu göster
2. Başarı/hata durumunu belirt
3. Oluşturulan dosyaları listele (varsa)
4. Kısa teknik özet ver

---

# 📋 Kurulum Rehberi

## 🎯 Cursor'da Agent Kurulumu

### Adım 1: Agent İçe Aktarma

1. **Cursor'ı açın**
2. **Sol alt köşedeki "Agent" butonuna tıklayın**
3. **"Import from project" seçeneğini seçin**
4. **`agent-config.md` dosyasını seçin**
5. **Agent adını verin:** `CTO Koçu v2`
6. **"Import" butonuna tıklayın**

### Adım 2: Agent'ı Test Etme

Chat penceresinde şu komutları deneyin:

```
Sprint hazırla
```

```
Monitoring sprint hazırla
```

```
Audit yap
```

```
Optimize et
```

## 🔹 Beklenen Çıktılar

### Sprint Hazırla
```
> node ./cto-coach-v2/dist/index.js hazirla -p FinBot
✅ Sprint planı oluşturuldu: plans/sprint-plan.md
```

### Audit Yap
```
> node ./cto-coach-v2/dist/index.js audit -p FinBot
🔒 Güvenlik kontrol listesi hazırlandı!
📁 Rapor konumu: plans/security-audit.md
⚠️ Risk skoru: 6/10 (Orta Risk)
```

### Optimize Et
```
> node ./cto-coach-v2/dist/index.js optimize -p FinBot
⚡ Performans metrikleri analiz edildi!
📁 Rapor konumu: plans/performance-optimization.md
📊 Performans skoru: 6/10
```

## 📁 Oluşturulan Dosyalar

Agent çalıştığında şu dosyalar oluşturulur:

- `plans/sprint-plan.md` - Sprint planları
- `plans/security-audit.md` - Güvenlik audit raporu
- `plans/performance-optimization.md` - Performans optimizasyon raporu

## ⚠️ Sorun Giderme

### Agent Çalışmıyor
- Cursor'ı yeniden başlatın
- Agent'ı yeniden import edin
- `agent-config.md` dosyasının doğru konumda olduğundan emin olun

### CLI Komutları Bulunamıyor
- `cto-coach-v2` klasörünün doğru konumda olduğundan emin olun
- `npm run build` komutunu çalıştırın
- `dist/` klasörünün var olduğunu kontrol edin

### Dosyalar Oluşturulmuyor
- `plans/` klasörünün yazma izinlerini kontrol edin
- PowerShell'de UTF-8 encoding ayarlayın: `chcp 65001`

## 🎉 Başarılı Kurulum

Agent başarıyla kurulduğunda:
- ✅ Doğal dil komutları CLI'ye dönüşür
- ✅ Otomatik raporlar oluşturulur
- ✅ Teknik özetler verilir
- ✅ Dosya konumları gösterilir

**Artık CTO Koçu v2'yi chat penceresinden kullanabilirsiniz!** 🚀
    