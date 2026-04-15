document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const timeElement = document.getElementById('time');
    const secondsElement = document.getElementById('seconds');
    const dayOfWeekElement = document.getElementById('day-of-week');
    const fullDateElement = document.getElementById('full-date');
    const nameDayElement = document.getElementById('name-day');

    // Czech months
    const monthsCz = [
        'ledna', 'února', 'března', 'dubna', 'května', 'června',
        'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
    ];

    // Czech days
    const daysCz = [
        'Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'
    ];

    function updateTimeAndDate() {
        const now = new Date();
        
        // Time formatting
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        timeElement.textContent = `${hours}:${minutes}`;
        secondsElement.textContent = seconds;

        // Date formatting
        const dayOfWeekStr = daysCz[now.getDay()];
        const day = now.getDate();
        const monthStr = monthsCz[now.getMonth()];
        const year = now.getFullYear();

        dayOfWeekElement.textContent = dayOfWeekStr;
        fullDateElement.textContent = `${day}. ${monthStr} ${year}`;
    }

    async function fetchNameDay() {
        try {
            // First try - svatkyapi.cz
            const response = await fetch('https://svatkyapi.cz/api/day');
            if (response.ok) {
                const data = await response.json();
                if (data && data.name) {
                    nameDayElement.textContent = data.name;
                    return;
                }
            }
            throw new Error('Nepodařilo se načíst data z API svatkyapi.cz');
        } catch (error) {
            console.error('Error fetching name day from first API:', error);
            // Fallback API - svatky.adresa.info
            try {
                const fallbackResponse = await fetch('https://svatky.adresa.info/json');
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData && fallbackData.length > 0 && fallbackData[0].name) {
                        nameDayElement.textContent = fallbackData[0].name;
                        return;
                    }
                }
            } catch (fallbackError) {
                console.error('Error fetching name day from fallback API:', fallbackError);
            }
            nameDayElement.textContent = 'Neznámý';
        }
    }

    async function fetchCelebrities() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        try {
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${month}/${day}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.births && data.births.length > 0) {
                    // Filter out years older than 1800 to get somewhat modern figures if possible
                    const modern = data.births.filter(b => b.year && b.year > 1800);
                    const source = modern.length > 0 ? modern : data.births;
                    
                    // Pick 2 random births
                    const shuffled = source.sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 2);
                    
                    const celebritiesContainer = document.getElementById('celebrities');
                    celebritiesContainer.innerHTML = '';
                    
                    selected.forEach(person => {
                        const div = document.createElement('div');
                        div.className = 'celebrity-item';
                        // Use text or title
                        let text = person.text || '';
                        let nameParts = text.split(',');
                        let name = nameParts[0] || person.pages[0].title.replace(/_/g, ' ');
                        let desc = nameParts.length > 1 ? nameParts[1].trim() : '';
                        const year = person.year || '';
                        
                        // Limit description to 40 chars
                        if (desc.length > 40) {
                            desc = desc.substring(0, 37) + '...';
                        }
                        
                        div.innerHTML = `<strong>${name}</strong> (${year})<br><span style="font-size:0.75rem; color:var(--text-muted)">${desc}</span>`;
                        celebritiesContainer.appendChild(div);
                    });
                    return;
                }
            }
        } catch (error) {
            console.error('Error fetching celebrities:', error);
        }
        document.getElementById('celebrities').textContent = 'Neznámé';
    }

    // Chat logic
    const smsInput = document.getElementById('sms-input');
    const sendBtn = document.getElementById('send-btn');
    const chatContainer = document.getElementById('chat-messages');
    const mobileScreen = document.querySelector('.mobile-screen');

    function sendMessage() {
        const text = smsInput.value.trim();
        if (text !== '') {
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble';
            
            const textSpan = document.createElement('span');
            textSpan.className = 'bubble-text';
            textSpan.textContent = text;
            
            bubble.appendChild(textSpan);
            
            // Delete message on click
            bubble.addEventListener('click', () => {
                bubble.style.transform = 'scale(0.8)';
                bubble.style.opacity = '0';
                setTimeout(() => bubble.remove(), 200);
            });
            
            chatContainer.appendChild(bubble);
            smsInput.value = '';
            
            // Scroll to bottom
            setTimeout(() => {
                mobileScreen.scrollTop = mobileScreen.scrollHeight;
            }, 50);
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    smsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Initialize
    updateTimeAndDate();
    setInterval(updateTimeAndDate, 1000);
    fetchNameDay();
    fetchCelebrities();
});
