document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('api-key');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatContainer = document.getElementById('chat-container');

    let messages = [
        { role: 'system', content: 'You are a helpful assistant.' }
    ];

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Enable inputs when API key is entered
    apiKeyInput.addEventListener('input', function() {
        if (apiKeyInput.value.trim()) {
            userInput.disabled = false;
            sendButton.disabled = false;
        } else {
            userInput.disabled = true;
            sendButton.disabled = true;
        }
    });

    // Send message on button click or Enter key (but allow Shift+Enter for new lines)
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        // Add user message to chat
        addMessage('user', userMessage);
        messages.push({ role: 'user', content: userMessage });

        // Clear input and reset height
        userInput.value = '';
        userInput.style.height = 'auto';

        // Disable inputs while processing
        userInput.disabled = true;
        sendButton.disabled = true;

        // Add loading indicator
        const loadingDiv = addLoadingMessage();

        // Get bot response
        getBotResponse(loadingDiv);
    }

    function addMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (sender === 'user') {
            contentDiv.textContent = message;
        } else {
            // Parse and render message with code blocks
            contentDiv.innerHTML = `<strong>SY Bot</strong> ${parseMessageWithCodeBlocks(message)}`;
        }

        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return messageDiv;
    }

    function parseMessageWithCodeBlocks(message) {
        // Simple regex to find code blocks (```language\ncode\n```)
        const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
        let parsedMessage = message;
        let match;
        let offset = 0;

        while ((match = codeBlockRegex.exec(message)) !== null) {
            const [fullMatch, language, code] = match;
            const codeBlockHtml = createCodeBlock(language || 'text', code.trim());
            const beforeMatch = parsedMessage.substring(0, match.index + offset);
            const afterMatch = parsedMessage.substring(match.index + offset + fullMatch.length);
            parsedMessage = beforeMatch + codeBlockHtml + afterMatch;
            offset += codeBlockHtml.length - fullMatch.length;
        }

        return parsedMessage;
    }

    function createCodeBlock(language, code) {
        const codeBlockId = 'code-block-' + Date.now() + Math.random();
        return `
            <div class="code-block" id="${codeBlockId}">
                <div class="code-header">
                    <span class="code-language">${language}</span>
                    <button class="copy-button" onclick="copyCode('${codeBlockId}')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Copy
                    </button>
                </div>
                <div class="code-content">${highlightCode(code, language)}</div>
            </div>
        `;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function highlightCode(code, language) {
        // Escape HTML first to prevent code from being interpreted as HTML
        let highlighted = escapeHtml(code);

        // JavaScript/TypeScript highlighting
        if (['javascript', 'js', 'typescript', 'ts'].includes(language)) {
            highlighted = highlighted
                .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from)\b/g, '<span class="keyword">$1</span>')
                .replace(/(["'`])(.*?)\1/g, '<span class="string">$&</span>')
                .replace(/\/\/(.*)/g, '<span class="comment">$&</span>')
                .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
                .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
        }

        // Python highlighting
        else if (['python', 'py'].includes(language)) {
            highlighted = highlighted
                .replace(/\b(def|class|if|elif|else|for|while|import|from|return|print|len|range)\b/g, '<span class="keyword">$1</span>')
                .replace(/(["'`])(.*?)\1/g, '<span class="string">$&</span>')
                .replace(/#(.*)/g, '<span class="comment">$&</span>')
                .replace(/"""[\s\S]*?"""/g, '<span class="comment">$&</span>')
                .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
        }

        // General highlighting for other languages
        else {
            highlighted = highlighted
                .replace(/(["'`])(.*?)\1/g, '<span class="string">$&</span>')
                .replace(/(\/\/|#|\/\*|\*\/)/g, '<span class="comment">$&</span>')
                .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
        }

        return highlighted;
    }

    // Copy code functionality
    window.copyCode = function(blockId) {
        const codeBlock = document.getElementById(blockId);
        const codeContent = codeBlock.querySelector('.code-content');
        const codeText = codeContent.textContent || codeContent.innerText;

        navigator.clipboard.writeText(codeText).then(() => {
            const copyButton = codeBlock.querySelector('.copy-button');
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Copied!
            `;
            copyButton.classList.add('copied');

            setTimeout(() => {
                copyButton.innerHTML = originalText;
                copyButton.classList.remove('copied');
            }, 2000);
        });
    };

    function addLoadingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `
            <strong>SY Bot</strong>
            <div class="loading">
                <span>Thinking</span>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return messageDiv;
    }

    async function getBotResponse(loadingDiv) {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) return;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-OpenRouter-Title': 'SY Bot'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: messages
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botMessage = data.choices[0].message.content;

            // Replace loading with actual message
            const contentDiv = loadingDiv.querySelector('.message-content');
            contentDiv.innerHTML = `<strong>SY Bot</strong> ${parseMessageWithCodeBlocks(botMessage)}`;

            messages.push({ role: 'assistant', content: botMessage });

        } catch (error) {
            console.error('Error:', error);
            const contentDiv = loadingDiv.querySelector('.message-content');
            contentDiv.innerHTML = '<strong>SY Bot</strong> Sorry, there was an error processing your request. Please check your API key and try again.';
        } finally {
            // Re-enable inputs
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }
});