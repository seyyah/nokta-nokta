# IDEA.md — "Müşterinin Developer Olduğu" Use Case

## Keşfedilen Pattern: Audit-as-Feature-Request

Klasik bug raporlama araçları bir varsayıma dayanır: *raporu yazan kullanıcı, kodu yazan kişiden farklıdır.*
nokta-audit bu varsayımı kırıyor. En güçlü kullanım senaryosu, raporlayan ile geliştirici aynı kişi
olduğunda ya da raporun doğrudan geliştirici pipeline'ına aktığında ortaya çıkıyor.

Bu submission'da somutlaştırdığım senaryo şu:

**Senaryo:**
Tester, `IdeaDetailScreen`'de oylama butonunun altında boş bir alan görüyor.
"Burada kaydet butonu olsa harika olurdu" diye düşünüyor.
🐛 FAB'a basıyor → sarı kutuyla o boş alanı işaretliyor →
"kaydet butonu yok, oylama butonunun altına gelmeli" yazıyor.
Çıktı: `audit-001-idea-detail-save.md`.

Tester bu `.md` dosyasını şuna dönüştürebilir:
```bash
claude code "Bu audit raporunu uygula: audit-001-idea-detail-save.md"
```

Agent raporu okur: ekran adı → `IdeaDetailScreen`, burn-in koordinatlar → `voteBtn` bloğunun altı,
istek → "kaydet butonu". `idea/[id].tsx` dosyasına iner, `useSavedIdeas` hook yazar, butonu ekler,
PR açar. **Tester sadece review eder.**

## Neden Bu Composition Güçlü?

Standart bir Jira ticket'ı şunu içerir: "Kaydet butonu ekle." Agent bunu alıp hangi
ekrana, hangi bileşene, tam olarak nereye ekleyeceğini tahmin etmek zorunda kalır.

Audit raporu şunu içerir:
- **Ekran adı:** `IdeaDetailScreen` → dosya: `app/app/idea/[id].tsx`
- **Burn-in koordinatlar:** x=20, y=480, width=335 → `voteBtn` bloğunun hemen altı
- **Visual ground truth:** sarı kutuyla işaretlenmiş ekran görüntüsü
- **Doğal dil:** "kaydet butonu yok, oylama butonunun altına gelmeli"

Agent tahmin etmiyor — **ölçüyor.** Piksel koordinatları doğrudan bileşen
lokasyonuna dönüşüyor. Bu yüzden Cycle 1'deki LOCATE adımı 0 saniyede tamamlandı.

## Üçlü Kapalı Döngü

```
Tester (müşteri rolü)
  → 🐛 FAB: ekranı yakalar, sarı kutuyla işaretler, not yazar
  → audit-001.md üretilir (burn-in görüntü + koordinat + doğal dil)

Forge Agent (claude code)
  → READ: .md'yi olduğu gibi okur
  → LOCATE: IdeaDetailScreen → idea/[id].tsx
  → HYPOTHESIZE: useSavedIdeas hook + saveBtn
  → REPAIR: hook yazar, butonu ekler
  → TEST: manuel test → kaydet → kapat → aç → durum korundu
  → VERIFY: audit raporundaki burn-in görüntüyle karşılaştırır
  → COMMIT: [FORGE: IdeaDetailScreen] Save butonu eklendi — 3kg

Developer (sen)
  → PR'ı review eder, merge eder
```

**İnsan müdahalesi: 1 karar** (hook API seçimi: hook mu, Context mi?).
Geri kalan her şey agent tarafından kapatıldı.

## nokta-audit'in Bu Senaryodaki Özgün Rolü

nokta-audit başka raporlama araçlarından şu noktada ayrılıyor:
agent için "ilk sınıf input" üretmek üzere tasarlanmış. JSON payload değil,
natural language + visual ground truth kombinasyonu. Agent `.md`'yi LLM doğal dil
anlayışıyla okur; burn-in sarı kutu koordinatlarını piksel-kesin lokasyon bilgisi
olarak kullanır; ekran adını codebase'deki dosyaya map eder.

Sonuç: **Bug görülme anı ile PR açılma anı arasındaki sürtünme minimuma indi.**
