import * as Speech from "expo-speech";

const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

class NoktaBrain {
  history: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [];
  systemPrompt: string;

  constructor() {
    this.history = [];
    this.systemPrompt = `Sen Nokta'sın. Kullanıcının psikolojik sağlığını ve günlük stresini dinleyen empatik, anlayışlı ve rahatlatıcı bir sağlık asistanısın.
Kullanıcının anlattığı sorunları (stres, kaygı, üzüntü vb.) yargılamadan dinle ve kısa, şefkatli bir şekilde yanıtla (2-3 cümle). Uzun paragraflardan kaçın.
Eğer kullanıcının anlattıkları yoğun bir stres, depresyon veya başa çıkılamaz bir sorun içeriyorsa veya kullanıcı açıkça bir uzmanla görüşmek istediğini belirtirse, ona mutlaka "İstersen ekranın üst kısmındaki 'Uzmana Bağlan' butonunu kullanarak veya bana söyleyerek seni hemen bir psikolojik danışmana bağlamamı isteyebilirsin" teklifinde bulun.
Türkçe konuş.`;
  }

  async sendMessage(message: string, onSpeechEnd?: () => void) {
    let text = "Üzgünüm, şu an bağlantı kuramıyorum.";
    
    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı.");
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: this.systemPrompt },
            ...this.history,
            { role: "user", content: message }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 150,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Hatası: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      text = data.choices[0]?.message?.content || text;
      
      this.history.push({ role: "user", content: message });
      this.history.push({ role: "assistant", content: text });
      
      if (this.history.length > 20) this.history = this.history.slice(-20);
    } catch (e) {
      console.error('❌ Groq API error:', e);
      Speech.stop();
      throw e; 
    }

    Speech.speak(text, {
      language: "tr-TR",
      onDone: onSpeechEnd,
      onError: onSpeechEnd,
    });
    
    return text;
  }
}

export default new NoktaBrain();
