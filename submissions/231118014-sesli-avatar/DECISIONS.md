# DECISIONS.md — Karar Günlüğü

## Neden Track A (Sadakat)?

Bu haftanın üç track'i de aynı üç fazı (Ayna / Forge / Köprü) gerektiriyor; fark, fazların etrafındaki ek yükte. Track B iki ayrı avatar + persona dokümantasyonu, Track C otonom STUCK tespiti + agent-tetiklemeli çağrı + otomatik transkript istiyor. Track A tek avatar + akıcı ses + temiz lipsync üzerine odaklanıyor ve puanı "sade ama kusursuz" yürütmeden alıyor. Önceki halkada da sadelik çizgisi (drop-in disiplini) seçilmişti; bu, aynı çizginin doğal devamı. Bir hafta için en savunulabilir kapsam Track A.

## Avatar: neden Avaturn T2?

İlk export (T1) daha yüksek yüz benzerliği sunuyordu ama dosyada hiç morph target / blendshape ve `jaw` kemiği yoktu — yani teknik olarak ağzı oynatmak imkânsızdı. Lipsync Track A'nın kalbi olduğu için, yüz animasyonunu (ARKit blendshape + viseme + `jawOpen`) içeren T2 tipine geçildi. T2 hâlâ kendi fotoğrafımdan üretiliyor; sadece ağız boşluğu ve ayrı göz küreleri animasyona uygun yapılmış. Dosya bu nedenle ~15 MB.

## Voice viz: asimetrik smoothing

Tek katsayılı smoothing barları hem yükselişte hem düşüşte aynı sertlikte hareket ettiriyordu. Attack'i hızlı (0.6), release'i yavaş (0.15) yaparak konuşma anında hızlı tepki, sessizlikte yumuşak sönme elde edildi — OpenAI voice-mode estetiğine yakın his.

## Avatar 3D render rollback'i

GLB'yi gerçek 3D olarak mobilde render etme denemesi (expo-gl + expo-three + r3f/native), Expo Go runtime'ında asset çözümleme ve web önizlemede CORS engeli nedeniyle stabil kurulamadı. Çalışan duruma dönmek için değişiklik geri alındı ve SVG lipsync fallback korundu — aynı 0..1 `jawOpen` sinyali her iki render yolunda da geçerli olduğu için davranış değişmedi. Başarısız hipotez FORGE.md'de gizlenmeden loglandı; gerçek 3D bağlama bir sonraki tur için açık iş.

## Köprü: neden Jitsi?

Expo Go custom WebRTC native modül yükleyemediği için, tarayıcı tabanlı Jitsi (meet.jit.si) en güvenilir yol. Anahtar gerektirmez, video + ses + ekran paylaşımının üçünü birden destekler.
