# PERSONAS.md - Voice Avatar Track

Secilen track: 2 avatar/persona varyanti.

## Junior Ben

- Uygulama ici id: `junior`
- Ton: hizli, net, dogrudan.
- Gorsel vurgu: teal (`#0f766e`)
- TTS ayari: `rate: 1.28`, `pitch: 1.35`
- Voice secimi: varsa ilk Turkce voice, yoksa cihazdaki ilk voice.
- Tiklama davranisi: Persona kartina basilinca bu intro metni hemen junior tonuyla okunur.
- Feedback girisi: "Junior ben: hizli okuyorum, ilk uygulanabilir tamir noktasini one cikariyorum."
- Gorev: dikte edilen audit raporunu hizli okuyup ilk forge aksiyonunu belirginlestirmek.

## Senior Ben

- Uygulama ici id: `senior`
- Ton: sakin, daha dusuk pitch, karar odakli.
- Gorsel vurgu: amber (`#b45309`)
- TTS ayari: `rate: 0.72`, `pitch: 0.72`
- Voice secimi: varsa son Turkce voice, yoksa cihazdaki son voice.
- Tiklama davranisi: Persona kartina basilinca bu intro metni hemen senior tonuyla okunur.
- Feedback girisi: "Senior ben: daha sakin okuyorum, rollback ve risk kararini ayirarak yorumluyorum."
- Gorev: rollback/stuck kararlarini daha kontrollu okumak ve bridge kararini aciklamak.

## Lipsync Pipeline

Native'de `expo-av` recording status icindeki `metering` degeri 80ms aralikla okunur. Web'de `getUserMedia + WebAudio AnalyserNode` ile RMS hesaplanir. Ayni sinyal:

- bar animasyonlarinin yuksekligini,
- r3f sahnesindeki agiz driver mesh scale degerini,
- `rest / ih / aa / oh` viseme etiketini

besler. Avaturn export dosyasinda morph target bulunmadigi icin (`morphTargetDictionary` yok), gercek dudak oynatma devre disi birakildi. Persona farki TTS rate/pitch, voice secimi, feedback metni ve UI vurgu rengiyle gosterilir. Hedef gecikme web analyser/native metering + React render overhead ile 200ms altinda kalmaktir.

## Avatar Asset

Gercek teslim icin `app/assets/avatar.glb` dosyasi Avaturn export olarak eklendi. Sahne kamera hedefini `Head` kemigi seviyesine sabitler; avatar yuz kadrajinda kalir.
