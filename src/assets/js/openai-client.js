// OpenAI API client

// Configuration
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates a module based on a prompt using OpenAI's API
 * @param {string} prompt The prompt to send to OpenAI
 * @returns {Promise<string>} The generated text response
 */
export async function generateModuleFromPrompt(prompt) {
    // Check for API key in local storage with a TTL
    const apiKey = window.storageWithTTL.getWithTTL('openai_api_key');
    
    if (!apiKey) {
        // No API key found, ask the user to input one
        const userApiKey = await promptForApiKey();
        if (!userApiKey) {
            throw new Error('API key is required to generate modules');
        }
        
        // Save the API key with a 1-day expiration
        window.storageWithTTL.setWithTTL('openai_api_key', userApiKey, 24 * 60 * 60 * 1000);
    }
    
    try {
        const response = await callOpenAI(prompt);
        return response;
    } catch (error) {
        console.error('OpenAI API error:', error);
        
        // If unauthorized, clear saved API key and ask again
        if (error.status === 401) {
            window.storageWithTTL.removeItem('openai_api_key');
            throw new Error('Invalid API key. Please try again with a valid key.');
        }
        
        throw new Error(error.message || 'Error connecting to OpenAI');
    }
}

/**
 * Makes a call to the OpenAI API
 * @param {string} prompt The prompt to send
 * @returns {Promise<string>} The generated text
 */
async function callOpenAI(prompt) {
    const apiKey = window.storageWithTTL.getWithTTL('openai_api_key');
    
    const requestBody = {
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that creates educational content for children. Your responses should be clear, engaging, and appropriate for the specified age group."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 2000
    };
    
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(e => ({ error: 'Unknown error' }));
        throw {
            status: response.status,
            message: errorData.error?.message || `API returned status ${response.status}`
        };
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Prompts the user to enter their OpenAI API key
 * @returns {Promise<string>} The API key entered by the user
 */
function promptForApiKey() {
    return new Promise((resolve) => {
        // Create a modal dialog for API key input
        const modal = document.createElement('div');
        modal.className = 'api-key-modal';
        modal.innerHTML = `
            <div class="api-key-modal-content">
                <h3>OpenAI API Key Required</h3>
                <p>To use this feature, you need to provide your OpenAI API key.</p>
                <p>Your key is stored only on your device and expires after 24 hours.</p>
                <input type="password" id="api-key-input" placeholder="Enter your API key here">
                <div class="modal-buttons">
                    <button id="api-key-cancel">Cancel</button>
                    <button id="api-key-submit">Submit</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add some basic styling
        const style = document.createElement('style');
        style.textContent = `
            .api-key-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .api-key-modal-content {
                background: white;
                padding: 20px;
                border-radius: 5px;
                max-width: 500px;
                width: 80%;
            }
            
            .api-key-modal input {
                width: 100%;
                margin: 10px 0;
                padding: 8px;
            }
            
            .modal-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 15px;
            }
            
            .modal-buttons button {
                padding: 8px 15px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
        
        // Set up event listeners
        const input = document.getElementById('api-key-input');
        const submitBtn = document.getElementById('api-key-submit');
        const cancelBtn = document.getElementById('api-key-cancel');
        
        submitBtn.addEventListener('click', () => {
            const apiKey = input.value.trim();
            document.body.removeChild(modal);
            document.head.removeChild(style);
            resolve(apiKey);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
            resolve(null);
        });
        
        // Focus on the input
        setTimeout(() => input.focus(), 100);
    });
}