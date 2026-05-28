# Evaluation Notes

Asagidaki senaryolar bu oturumda manuel veya statik kontrol olarak ele alindi. Otomasyon yalnizca gercekten eklenip calistirildigi durumda iddia edilmelidir; bu teslimde boyle bir otomasyon eklenmedi.

| Scenario | Check Type | Status | Notes |
| --- | --- | --- | --- |
| App starts and main screen renders | Manual | Pending | Expo uygulamasi interaktif olarak acilip dogrulanmali. |
| Audit FAB is visible and draggable | Manual | Pending | `AuditWidget` root mount edildi, ama fiziksel cihaz veya emulator uzerinde gorulmesi gerekli. |
| Audit capture flow can generate a Markdown report | Manual | Pending | Gercek capture, sari kutu, not ve export akisi kullanici tarafindan tamamlanmali. |
| Feature-request audit report can be used by Codex as input | Static + Manual | Ready | Ledger ve belge yapisi hazir; gercek rapor kopyalandiginda forge cycle baslatilabilir. |
| Existing core app flow still works after AuditWidget integration | Manual | Pending | Ana akisin elle test edilmesi gerekiyor. |
| Removing the AuditWidget mount should not break the app | Static | Ready | Widget bir sibling primitive olarak eklendi; ekranlarin kendi state akisi ondan bagimsiz kaldi. |
| Forge fixes must be minimal and must not rewrite unrelated screens | Static | Ready | `FORGE.md` ve karar kayitlari minimum diff disiplinini zorunlu kilar. |
