# IDEA

Bu Track A tesliminin fikri yeni bir platform kurmak degil, nokta-audit'in drop-in primitive vaadini en sade host app icinde gostermek. Uc ekran da ayni temel bileseni paylasir; farkli olan yalnizca route state'i ve ekran kopyasidir. Boylece widget kaldirildiginda uygulama kendi akisini korur, audit katmani ise sadece root layout'taki tek mount ile yasamaya devam eder.

Musterinin gelistirici oldugu kisim burada kucuk ama olculebilir: tester, Capture/Reports/Forge ekranlarinda tek kutulu burn-in raporu uretir; Codex bu raporu okuyup dosya konumunu route adindan bulur; her forge cycle sadece bir hipotez ve bir test kapisiyla ilerler. En buyuk karar, ekstra feature eklemek yerine host boundary'yi gorunur kilmak oldu: capture, ref capture, file write, binary write, share ve storage tamamen host tarafinda kalir.
