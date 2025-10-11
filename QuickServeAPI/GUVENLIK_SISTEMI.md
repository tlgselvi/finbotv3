# 🔒 Otomatik Güvenlik Sistemi

## ⚡ GÜVENLİK NASIL ÇALIŞIR?

### **`git push` yapınca otomatik çalışır:**

```bash
git push origin main

# Otomatik hooks:
[1/6] 🧪 test1           → Testler + Analiz
[2/6] 📊 coverage        → Coverage check
[3/6] 🔐 sec:secrets     → Secret tarama ⚠️
[4/6] 🔒 sec:sast        → Security scan
[5/6] ⚖️  sec:license     → License audit
[6/6] 🛡️  db:dryrun       → Migration guard

Hata varsa PUSH İPTAL! ✋
```

---

## 🔐 1. SECRET TARAMA

**Komut:** `pnpm sec:secrets`

**Ne yapar:**

- 248 dosya taranır
- Secret pattern'leri aranır:
  - AWS Keys (AKIA...)
  - API Keys
  - JWT Secrets
  - Passwords
  - Private Keys
  - Database URLs

**Örnek:**

```javascript
// ❌ YANLIŞ (tespit edilir):
const JWT_SECRET = 'my-hardcoded-secret-123';

// ✅ DOĞRU (güvenli):
const JWT_SECRET = process.env.JWT_SECRET;
```

**Sonuç:**

```
⚠️  17 potansiyel secret bulundu
📁 artifacts/security/gitleaks.json

❌ Secret varsa → PUSH İPTAL!
✅ Yoksa → Devam
```

---

## 🔒 2. SAST TARAMA

**Komut:** `pnpm sec:sast`

**Ne yapar:**

- SQL Injection riski
- eval() kullanımı
- XSS riski
- Unsafe redirect

**Tespit:**

```javascript
// ❌ SQL Injection:
db.query('SELECT * FROM users WHERE id = ' + userId);

// ❌ eval() kullanımı:
eval(userInput);

// ❌ XSS:
div.innerHTML = userInput;
```

**Sonuç:**

```
High severity → UYARI (devam eder)
```

---

## ⚖️ 3. LİSANS AUDIT

**Komut:** `pnpm sec:license`

**Ne yapar:**

- 114 paket lisansı kontrol edilir
- Risk analizi:
  - 🔴 HIGH: GPL-3.0, AGPL-3.0
  - 🟡 MEDIUM: GPL-2.0, LGPL-3.0
  - 🟢 LOW: Apache-2.0, MIT, ISC
  - ✅ SAFE: CC0-1.0, Unlicense

**Sonuç:**

```
📦 Total: 114
   🔴 High: 0
   🟢 Low: 112
   ✅ Safe: 2

✅ No high-risk licenses!
```

---

## 📦 4. SBOM GENERATION

**Komut:** `pnpm sbom:gen`

**Ne yapar:**

- Software Bill of Materials
- CycloneDX format
- SHA256 hash
- Provenance tracking

**Dosyalar:**

```
reports/sbom.cdx.json         → SBOM
attest/provenance.json        → Hash + metadata
```

---

## 🛡️ 5. MIGRATION GUARD

**Komut:** `pnpm db:dryrun`

**Ne yapar:**

- migrations/\*.sql tarama
- Destructive operations:
  - DROP TABLE ❌
  - DROP COLUMN ❌
  - TRUNCATE ❌
  - DELETE FROM ⚠️

**Sonuç:**

```
✅ 8 migration safe
❌ Destructive → UYARI
```

---

## 🏥 6. HEALTH MONITORING

**Komut:** `pnpm health:check`

**Ne yapar:**

- .env'den URL\_\* okur
- Her endpoint'e ping
- Response time ölçer

**Örnek:**

```
✅ URL_API: 200 (45ms)
✅ URL_WEB: 200 (120ms)
❌ URL_HEALTH_DB: Connection refused
```

---

## 🔄 OTOMATİK ÇALIŞMA AKIŞI

### **git push yapınca:**

```
1. PRE-PUSH HOOK tetiklenir
   ↓
2. .husky/pre-push çalışır
   ↓
3. Sırayla kontroller:
   ├─ test1 (critical tests)
   ├─ coverage (optional)
   ├─ sec:secrets (ZORUNLU!) ✋
   ├─ sec:sast (optional)
   ├─ sec:license (optional)
   └─ db:dryrun (optional)
   ↓
4. Hata kontrolü:
   ├─ test1 fail → PUSH İPTAL ❌
   ├─ secrets bulundu → PUSH İPTAL ❌
   └─ Diğerleri → UYARI (devam ✅)
   ↓
5. Push devam eder veya iptal
```

---

## 💡 MANUEL KONTROL

**İstersen manuel çalıştırabilirsin:**

```bash
# Tüm güvenlik kontrolleri
pnpm sec:secrets      # Secret scan (2s)
pnpm sec:sast         # SAST (5s)
pnpm sec:license      # License (3s)
pnpm sbom:gen         # SBOM (3s)
pnpm db:dryrun        # Migration (1s)

# TOPLAM: ~14 saniye
```

**Ama git push otomatik yapar!** ✨

---

## 🎯 ÖZET

```
╔═══════════════════════════════════════╗
║  GÜVENLİK = OTOMATİK!                 ║
╠═══════════════════════════════════════╣
║  git push yapınca:                    ║
║  ✅ Secret tarama                     ║
║  ✅ SAST scan                         ║
║  ✅ License audit                     ║
║  ✅ Migration guard                   ║
║                                       ║
║  Sen hiçbir şey yapma! ✨             ║
╚═══════════════════════════════════════╝
```

**Push yap, sistem halleder! 🚀**
