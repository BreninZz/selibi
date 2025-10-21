// Versão final — Minguinho assistente com navegação por clique (Tab/SPA-like)
document.addEventListener('DOMContentLoaded', () => {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- NAV (Ativação por Clique & Indicator) ---------- */
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');
    const navIndicator = document.getElementById('navIndicator');

    // 1. Funções de Controle de Seção
    function hideAllSections() {
        sections.forEach(sec => {
            sec.classList.remove('active-section'); 
            sec.style.display = 'none'; 
        });
    }

    function activateSection(targetId) {
        hideAllSections();

        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.style.display = 'block'; 
            
            setTimeout(() => {
                targetSection.classList.add('active-section');
            }, 10); 
            
            document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // 2. Funções de Indicador 
    function updateNavIndicator(activeLink) {
        if (!activeLink || !navIndicator) return;

        const { left, width } = activeLink.getBoundingClientRect();
        const navInnerLeft = document.querySelector('.nav-inner').getBoundingClientRect().left;

        if (reduceMotion) navIndicator.style.transition = 'none';
        
        navIndicator.style.width = `${width}px`;
        navIndicator.style.left = `${left - navInnerLeft}px`;
        navIndicator.classList.add('visible');
    }

    // 3. Evento de clique para navegação (Principal)
    navLinks.forEach(link => {
        link.addEventListener('click', (ev) => {
            ev.preventDefault();
            const targetId = link.getAttribute('href');
            
            activateSection(targetId);

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            updateNavIndicator(link);
            
            history.replaceState(null, '', targetId);
            
            document.querySelector('.site-nav').scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
    });

    // 4. Lógica de Inicialização 
    const firstSectionId = sections.length > 0 ? `#${sections[0].id}` : null;
    let initialTargetId = firstSectionId;
    
    if(window.location.hash && document.querySelector(window.location.hash)) {
        initialTargetId = window.location.hash;
    }

    if (initialTargetId) {
        activateSection(initialTargetId);
        const initialLink = document.querySelector(`.nav-link[href="${initialTargetId}"]`);
        
        if(initialLink) {
            initialLink.classList.add('active');
            setTimeout(() => {
                updateNavIndicator(initialLink);
            }, 100); 
        }
    }

    // Recalcula o indicador ao redimensionar
    window.addEventListener('resize', () => { updateNavIndicator(document.querySelector('.nav-link.active')); }); 

    /* ---------- THEME ---------- */
    const themeToggle = document.getElementById('themeToggle');
    const rootBody = document.body;
    const THEME_KEY = 'mpell_theme';
    function applyTheme(theme) {
        if (theme === 'dark') { rootBody.classList.add('dark'); themeToggle.textContent = '☀️'; themeToggle.setAttribute('aria-pressed','true'); }
        else { rootBody.classList.remove('dark'); themeToggle.textContent = '🌙'; themeToggle.setAttribute('aria-pressed','false'); }
    }
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);
    themeToggle.addEventListener('click', () => {
        const next = rootBody.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(next); localStorage.setItem(THEME_KEY, next);
    });

    /* ---------- UI: Modal chat & Excerpt Modal ---------- */
    const chatModal = document.getElementById('chatModal');
    const overlay = document.getElementById('overlay');
    const openChatBtn = document.getElementById('openChatBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const typingIndicator = document.getElementById('typingIndicator');
    const voiceToggle = document.getElementById('voiceToggle');
    const voiceSpeakToggle = document.getElementById('voiceSpeakToggle');
    const floatingOrb = document.getElementById('floatingOrb'); // NOVO: Ícone da Laranja

    // Modal de Trechos
    const excerptModal = document.getElementById('excerptModal');
    const openExcerptModalBtn = document.getElementById('openExcerptModal');
    const closeExcerptModalBtn = document.getElementById('closeExcerptModalBtn');
    const excerptContent = document.getElementById('excerptContent');

    /* Lógica do Chat e Micro-interação (Pulsar) */
    function openChat() {
        chatModal.classList.remove('hidden'); overlay.classList.remove('hidden'); chatModal.setAttribute('aria-hidden','false');
        if (!excerptModal.classList.contains('hidden')) closeExcerptModalBtn.click();

        overlay.addEventListener('click', closeChat);
        chatMessages.innerHTML = '';
        
        openChatBtn.classList.add('chat-active'); // NOVO: Faz o botão pulsar
        floatingOrb.classList.add('listening'); // NOVO: Faz o ícone da laranja pulsar

        // ... (resto da lógica de mensagens iniciais) ...
        let initialMessages = [];

        if (session.history.length > 0) {
            initialMessages.push("minguinho", "Bem-vindo(a) de volta! Que bom te ver de novo. 🍊");
        } else {
            initialMessages.push("minguinho", "Oi! Eu sou o Minguinho — seu assistente literário 🍊");
        }
        initialMessages.push("minguinho", "Posso contar um trecho, responder perguntas sobre o livro, dar um conselho ou brincar com você. Diga 'ajuda' para ver opções.");
        
        session.history.forEach(msg => {
            pushBubble(msg.who, msg.text);
        });

        pushBubbleDelayed(initialMessages[0], initialMessages[1], 100);
        pushBubbleDelayed(initialMessages[2], initialMessages[3], 700);
        
        chatInput.focus();
        playOpening();
    }
    
    function closeChat() {
        chatModal.classList.add('hidden'); overlay.classList.add('hidden'); chatModal.setAttribute('aria-hidden','true');
        openChatBtn.classList.remove('chat-active'); // NOVO: Para o pulso do botão
        floatingOrb.classList.remove('listening'); // NOVO: Para o pulso da laranja
        showTyping(false); // Garante que o indicador de escrita pare
        playClose();
    }

    openChatBtn.addEventListener('click', openChat);
    closeChatBtn.addEventListener('click', closeChat);

    // ... (Lógica do Modal de Trechos permanece a mesma) ...
    const bookExcerpts = [
        "A rua era feita para brincar, não para apanhar.",
        "Não posso ficar triste. Senão, adeus, Minguinho, adeus.",
        "A gente aprende a ser forte quando o coração dói.",
        "Eu não tinha amigos, mas tinha o meu pé de laranja lima.",
        "As pessoas pensam que a dor acaba na pancada. Não acaba. A dor continua, é uma dor comprida...",
        "A vida é dura para quem é mole. Ela fica mole para quem é duro.",
        "O homem precisa de um porto onde ancorar as ideias."
    ];

    openExcerptModalBtn.addEventListener('click', () => {
        const randomExcerpt = bookExcerpts[Math.floor(Math.random() * bookExcerpts.length)];
        excerptContent.textContent = randomExcerpt;
        excerptModal.classList.remove('hidden');
        overlay.classList.remove('hidden');
        excerptModal.setAttribute('aria-hidden', 'false');
        
        if (!chatModal.classList.contains('hidden')) closeChat();
    });

    closeExcerptModalBtn.addEventListener('click', () => {
        excerptModal.classList.add('hidden');
        overlay.classList.add('hidden');
        excerptModal.setAttribute('aria-hidden', 'true');
    });

    /* ---------- Chat: Memória de Sessão ---------- */
    const SESSION_KEY = 'mpell_chat_session';
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    let session = loadSession();
    
    function loadSession() {
        const json = localStorage.getItem(SESSION_KEY);
        if (json) {
            try {
                const stored = JSON.parse(json);
                if (Date.now() - stored.ts < SEVEN_DAYS) {
                    return stored;
                }
            } catch (e) { /* ignore error */ }
        }
        return { ts: Date.now(), history: [] };
    }

    function saveSession(history) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now(), history: history }));
    }
    
    /* ---------- Audio: Web Audio hybrid (leaves + click + chime) ---------- */
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = AudioCtx ? new AudioCtx() : null;

    function playClick() {
        if (!ctx) return;
        const now = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(900, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.06, now + 0.005);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.08);
    }

    function playLeaf() {
        if (!ctx) return;
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 800;
        const g = ctx.createGain(); g.gain.value = 0.12;
        noise.connect(hp); hp.connect(g); g.connect(ctx.destination);
        noise.start();
        noise.stop(ctx.currentTime + 0.5);
    }

    function playChime() {
        if (!ctx) return;
        const now = ctx.currentTime;
        const freqs = [880, 1320]; 
        freqs.forEach((f, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(f, now + i * 0.06);
            g.gain.setValueAtTime(0.0001, now + i * 0.06);
            g.gain.exponentialRampToValueAtTime(0.08, now + i * 0.06 + 0.02);
            o.connect(g); g.connect(ctx.destination);
            o.start(now + i * 0.06);
            o.stop(now + i * 0.06 + 0.2);
        });
    }

    function playOpening(){ playLeaf(); setTimeout(playChime, 160); }
    function playClose(){ playChime(); setTimeout(playLeaf, 120); }
    function playSend() { playClick(); setTimeout(playLeaf, 60); }

    /* ---------- Speech (TTS) ---------- */
    let ttsEnabled = (localStorage.getItem('mpell_tts') || 'true') === 'true';
    function setTts(enabled) {
        ttsEnabled = enabled;
        localStorage.setItem('mpell_tts', String(enabled));
        voiceToggle.setAttribute('aria-pressed', String(enabled));
        voiceSpeakToggle.setAttribute('aria-pressed', String(enabled));
        voiceToggle.textContent = enabled ? '🔊' : '🔇';
        voiceSpeakToggle.textContent = enabled ? '🔉' : '🔈';
    }
    setTts(ttsEnabled);
    voiceToggle.addEventListener('click', () => setTts(!ttsEnabled));
    voiceSpeakToggle.addEventListener('click', () => setTts(!ttsEnabled));

    function speakText(text) {
        if (!ttsEnabled || !window.speechSynthesis) return;
        const u = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();
        const pt = voices.find(v => /pt-BR|brazil/i.test(v.lang + v.name));
        if (pt) u.voice = pt;
        u.lang = 'pt-BR';
        u.rate = 0.95;
        u.pitch = 1.05;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
    }

    /* ---------- Chat UI helpers ---------- */
    function pushBubble(who, text) {
        const el = document.createElement('div');
        el.className = 'chat-bubble ' + (who === 'user' ? 'bubble-user' : 'bubble-minguinho');
        el.textContent = text;
        chatMessages.appendChild(el);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function pushBubbleDelayed(who, text, delay = 300) {
        setTimeout(() => {
            pushBubble(who, text);
            if (who === 'minguinho') playChime();
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, delay);
    }

    function showTyping(on = true) {
        if (on) { 
            typingIndicator.classList.remove('hidden');
            floatingOrb.classList.add('listening'); 
        }
        else { 
            typingIndicator.classList.add('hidden');
            // Remove o pulso APENAS se o chat não estiver aberto (o pulso de 'chat-active' continua no botão)
            if (chatModal.classList.contains('hidden')) floatingOrb.classList.remove('listening');
        }
    }

    /* ---------- Simple conversation memory & utilities ---------- */
    let lastUserIntent = null;

    function recordUser(msg, intent) {
        if (session.history.length > 40) session.history.shift();
        session.history.push({ who: 'user', text: msg, ts: Date.now() });
        lastUserIntent = intent;
        saveSession(session.history);
    }
    function recordMinguinho(msg) {
        if (session.history.length > 40) session.history.shift();
        session.history.push({ who: 'minguinho', text: msg, ts: Date.now() });
        saveSession(session.history);
    }

    /* ---------- Better reply generator (no external API) ---------- */
    const canned = {
        greetings: ["Oi! 😊", "Olá, amigo! Como você está hoje?", "Oi — fico feliz que você veio conversar."],
        empathy: ["Sinto muito que você esteja triste. Se quiser, conte o que aconteceu.", "Se a dor estiver grande, tente respirar fundo e lembrar de algo que te acalme."],
        cheer: ["Fico feliz por você! A alegria ilumina as coisas, não é?", "Isso é ótimo — celebre as pequenas vitórias."],
        storyStarts: [
            "Era uma vez um menino que conversava com uma árvore...",
            "Vou contar uma história curtinha sobre descoberta e amizade..."
        ],
        quotes: [
            "— Às vezes a gente aprende a ser forte quando o coração dói.",
            "— A imaginação é um porto onde a gente ancorar os sentimentos."
        ],
        help: [
            "Você pode me pedir: 'resuma o livro', 'conte uma história', 'um trecho do livro', 'me aconselhe', ou 'quiz'.",
            "Tente: 'conte uma história curta', 'quem é o Portuga?', 'me aconselhe sobre tristeza'."
        ]
    };

    function detectIntent(text) {
        const t = text.toLowerCase();
        const intents = [];
        if (/\b(oi|olá|ola|bom dia|boa tarde|boa noite|e aí|eai)\b/.test(t)) intents.push('greeting');
        if (/\b(triste|tristeza|choro|chorei|depress|mal|sofrendo|sofrer)\b/.test(t)) intents.push('sad');
        if (/\b(risos|feliz|alegria|ótimo|otimo|alegre)\b/.test(t)) intents.push('happy');
        if (/\b(portuga|manuel|valadares|português|portuga)\b/.test(t)) intents.push('ask_portuga');
        if (/\b(quem é|quem eh|quem foi|quem)\b/.test(t) && /\b(portuga|zez[eé]|minguinho|autor|jose|vasconcelos)\b/.test(t)) intents.push('who');
        if (/\b(sinopse|resuma|resumo|resumir|resuma o livro)\b/.test(t)) intents.push('summarize');
        if (/\b(trecho|citação|trecho do livro|quote|citar)\b/.test(t)) intents.push('quote');
        if (/\b(history|história|conta uma|conte uma|me conte)\b/.test(t) || /\b(story|conte)\b/.test(t)) intents.push('story');
        if (/\b(conselho|aconselhe|aconselhar|dica|me aconselhe|ajuda)\b/.test(t)) intents.push('advice');
        if (/\b(quiz|pergunta|teste)\b/.test(t)) intents.push('quiz');
        if (/\b(obrigad|valeu|brigad|thanks|obrigado)\b/.test(t)) intents.push('thanks');
        if (/\b(autor|quem escreveu|nome do escritor)\b/.test(t)) intents.push('ask_author'); 
        if (/\b(ajuda|o que faço|opções)\b/.test(t)) intents.push('help');
        return intents.length ? intents : ['chat'];
    }

    function generateReply(userText) {
        const intents = detectIntent(userText);
        if (intents.includes('greeting')) return randomOf(canned.greetings);
        if (intents.includes('sad')) return randomOf(canned.empathy) + " Quer que eu conte uma história curta para distrair?";
        if (intents.includes('happy')) return randomOf(canned.cheer);
        if (intents.includes('ask_author')) { 
            return "O autor do livro é José Mauro de Vasconcelos. Ele escreveu o romance a partir das suas próprias memórias de infância, o que o torna tão sensível.";
        }
        if (intents.includes('who') || intents.includes('ask_portuga')) {
            if (/portuga|manuel/.test(userText.toLowerCase())) {
                return "O Portuga, Manuel Valadares, é o senhor que se aproxima de Zezé com carinho — uma figura paternal que traz conforto e escuta.";
            }
            if (/zez[eé]/.test(userText.toLowerCase())) {
                return "Zezé é o menino protagonista — travesso, imaginativo e de coração sensível.";
            }
            if (/minguinho/.test(userText.toLowerCase())) {
                return "Minguinho é o pé de laranja lima, o amigo imaginário que simboliza o refúgio e a ternura do Zezé.";
            }
            if (/autor|jose|vasconcelos/.test(userText.toLowerCase())) {
                return "José Mauro de Vasconcelos escreveu com base em lembranças da infância — suas experiências alimentaram a sensibilidade do romance.";
            }
        }
        if (intents.includes('summarize')) {
            return "Resumo: Zezé, um menino pobre e sonhador, encontra consolo no pé de laranja lima e em amizades inesperadas. A história explora afeto, perda e crescimento precoce.";
        }
        if (intents.includes('quote')) {
            return randomOf(bookExcerpts) + " — uma linda citação do livro. Se quiser mais, é só me pedir!";
        }
        if (intents.includes('story')) {
            return randomOf(canned.storyStarts) + " Era um dia de vento e o menino descobriu que falar com a árvore tornava as coisas menos pesadas...";
        }
        if (intents.includes('advice')) {
            return "Se estiver triste, experimente escrever uma lembrança boa por onde passou — às vezes organizar as memórias ajuda o coração. Quer que eu sugira um exercício breve?";
        }
        if (intents.includes('quiz')) {
            return "Quer começar o quiz? Vá até a seção 'Quiz' no menu — te espero lá!";
        }
        if (intents.includes('thanks')) { 
            return "Por nada, meu amigo! Fico feliz em ajudar. Lembre-se que eu sou seu pé de laranja lima particular 🍊.";
        }
        if (intents.includes('help')) {
            return randomOf(canned.help);
        }
        const fallback = [
            `Entendi. Pode me contar um pouco mais sobre isso?`,
            `Interessante... quer que eu resuma o que você disse?`,
            `Humm — me conte como você se sente em uma palavra.`
        ];
        return randomOf(fallback);
    }

    function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    /* ---------- Chat submission flow (simulate "assistant" behavior) ---------- */
    chatForm.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const raw = chatInput.value.trim();
        if (!raw) return;
        
        if (ctx && ctx.state === 'suspended') ctx.resume();
        
        pushBubble('user', raw);
        
        const intent = detectIntent(raw);
        recordUser(raw, intent); 

        playSend();

        chatInput.value = '';
        showTyping(true);

        const reply = generateReply(raw);
        const typingDelay = Math.min(1200 + reply.length * 15, 2600);

        setTimeout(() => {
            showTyping(false);
            pushBubble('minguinho', reply);
            recordMinguinho(reply); 
            
            speakText(reply);
            
            maybeFollowUp(raw);
        }, typingDelay);
    });

    function maybeFollowUp(userText) {
        const t = userText.toLowerCase();
        if (lastUserIntent === 'summarize' || lastUserIntent === 'quote' || lastUserIntent === 'quiz' || lastUserIntent === 'thanks') return;
        
        if (Math.random() < 0.25) { 
            setTimeout(() => {
                const q = randomOf([
                    "Quer que eu conte uma história curta agora?",
                    "O que você acha do Portuga na vida do Zezé? Posso resumir a amizade deles em 2 frases.",
                    "Posso te dar uma sugestão de leitura parecida, que tal?",
                    "Qual a sua parte favorita do livro? A minha é quando a gente conversa!"
                ]);
                pushBubble('minguinho', q);
                speakText(q);
                recordMinguinho(q);
            }, 1200);
        }
    }

    /* ---------- SENTIMENTOS INTERATIVOS (NOVA LÓGICA) ---------- */
    const feelingsGrid = document.getElementById('feelingsGrid');
    const feelingResponse = document.getElementById('feelingResponse');

    const feelingReplies = {
        "Tristeza": "Sinto muito pelo seu coração doer. Zezé dizia: 'A dor continua, é uma dor comprida...'. Mas lembre-se: ela passa. Conte comigo, seu amigo.",
        "Alegria": "Que maravilha! A sua alegria é a minha luz. 'A felicidade é como uma laranja,' dizia Zezé, 'você tem que descascar e morder com vontade!'",
        "Medo": "Não se preocupe, meu amigo. Até os mais corajosos têm medo. Lembre-se que o Portuga estava lá para o Zezé. Você também tem seus protetores.",
        "Esperança": "Isso me deixa feliz! A esperança é a semente mais importante. Como o pé de laranja lima, ela sempre cresce, mesmo após a poda."
    };

    if (feelingsGrid) {
        feelingsGrid.querySelectorAll('.feeling-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const feeling = btn.getAttribute('data-feeling');
                const reply = feelingReplies[feeling] || "Um sentimento nobre. Mantenha o coração aberto!";
                
                // 1. Feedback visual (muda opacidade)
                btn.style.opacity = '0.5';
                setTimeout(() => { btn.style.opacity = '1'; }, 300);

                // 2. Mostrar a resposta
                feelingResponse.innerHTML = `<strong>Minguinho te responde sobre ${feeling}:</strong><p>${reply}</p>`;
                feelingResponse.classList.remove('hidden');
                
                // 3. (Opcional) Fala do Minguinho
                speakText(reply);
                
                // Scroll até a resposta
                feelingResponse.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /* ---------- QUIZ (mantido) ---------- */
    const quizQ = [
        { q: "Qual é o nome do protagonista?", choices: ["Zezé", "Minguinho", "Manuel", "Luís"], a: 0, explanation: "Zezé, cujo nome completo é José, é o protagonista do livro. Ele é o menino de cinco anos que conversa com o pé de laranja lima." },
        { q: "Com quem Zezé conversa na sua imaginação?", choices: ["Um cachorro", "Um pé de laranja lima", "Um livro", "Uma boneca"], a: 1, explanation: "O Minguinho é o pé de laranja lima. Ele é o confidente imaginário de Zezé e simboliza o refúgio e a ternura." },
        { q: "Qual personagem se torna a figura paterna de Zezé?", choices: ["Glória", "Luís", "Portuga", "Tio Edmundo"], a: 2, explanation: "O Portuga (Manuel Valadares) é o senhor que se aproxima de Zezé com carinho e oferece o afeto que o menino tanto busca." }
    ];
    const questionBox = document.getElementById('questionBox');
    const explanationBox = document.getElementById('explanationBox');
    const answersBox = document.getElementById('answersBox');
    const nextBtn = document.getElementById('nextBtn');
    const explainBtn = document.getElementById('explainBtn');
    const restartBtn = document.getElementById('restartBtn');
    const resultBox = document.getElementById('resultBox');

    let qIndex = 0, score = 0, answered = false;

    function renderQuestion() {
        answered = false; nextBtn.disabled = true; resultBox.classList.add('hidden'); 
        restartBtn.classList.add('hidden'); explainBtn.classList.add('hidden'); 
        explanationBox.classList.add('hidden'); explanationBox.innerHTML = ''; 
        answersBox.innerHTML = ''; 
        
        const current = quizQ[qIndex];
        questionBox.textContent = `${qIndex + 1}. ${current.q}`;
        
        current.choices.forEach((c,i) => {
            const btn = document.createElement('button'); 
            btn.className='answer-btn'; 
            btn.textContent = c;
            btn.setAttribute('aria-label', `Opção ${i + 1}: ${c}`);
            btn.addEventListener('click', () => {
                if (answered) return; 
                answered = true; 
                const correct = i === current.a;
                
                Array.from(answersBox.children).forEach(b => b.disabled = true);
                
                if (correct) { 
                    score++; 
                    btn.classList.add('correct');
                    btn.textContent += ' ✅'; 
                }
                else { 
                    btn.classList.add('incorrect');
                    btn.textContent += ' ❌'; 
                    const children = Array.from(answersBox.children); 
                    const ok = children[current.a]; 
                    if (ok) {
                        ok.classList.add('correct');
                        ok.textContent += ' ✅'; 
                    }
                }
                nextBtn.disabled = false;
                nextBtn.focus(); 
            });
            answersBox.appendChild(btn);
        });
    }

    function showResult() {
        questionBox.textContent = "Resultado Final"; 
        answersBox.innerHTML = ''; 
        resultBox.classList.remove('hidden'); 
        resultBox.textContent = `Você acertou ${score} de ${quizQ.length} perguntas.`; 
        nextBtn.disabled = true; 
        restartBtn.classList.remove('hidden');
        explainBtn.classList.remove('hidden'); 
        window.scrollTo({ top: document.querySelector('#quiz').offsetTop - 40, behavior: 'smooth' });
    }

    function toggleExplanations() {
        if (explanationBox.classList.contains('hidden')) {
            explanationBox.classList.remove('hidden');
            explainBtn.textContent = 'Esconder Explicações';
            let content = '';
            quizQ.forEach((q, index) => {
                content += `
                    <strong>Questão ${index + 1}: ${q.q}</strong>
                    <p>${q.explanation}</p>
                `;
            });
            explanationBox.innerHTML = content;
        } else {
            explanationBox.classList.add('hidden');
            explainBtn.textContent = 'Ver Explicações';
        }
    }

    nextBtn.addEventListener('click', () => {
        if (!answered) return;
        qIndex++; if (qIndex >= quizQ.length) showResult(); else { renderQuestion(); window.scrollTo({ top: document.querySelector('#quiz').offsetTop - 40, behavior: 'smooth' }); }
    });

    restartBtn.addEventListener('click', () => { qIndex=0; score=0; renderQuestion(); restartBtn.classList.add('hidden'); explainBtn.classList.add('hidden'); explanationBox.classList.add('hidden'); });
    explainBtn.addEventListener('click', toggleExplanations);

    renderQuestion();

    /* ---------- Accessibility: resume audio context on first gesture if needed ---------- */
    document.body.addEventListener('click', () => { if (ctx && ctx.state === 'suspended') ctx.resume(); }, { once: true });

});