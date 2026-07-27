// ===== DOM REFS =====
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const errorMsg = document.getElementById('errorMsg');
const imageSection = document.getElementById('imageSection');
const outputImage = document.getElementById('outputImage');
const loader = document.getElementById('loader');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const toast = document.getElementById('toast');

let toastTimeout = null;

// ===== HELPERS =====
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    generateBtn.textContent = isLoading ? 'Generating...' : 'Generate Image';
    if (isLoading) {
        loader.classList.add('active');
        outputImage.style.display = 'none';
        imageSection.style.display = 'block';
    } else {
        loader.classList.remove('active');
    }
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    promptInput.classList.add('error');
}

function hideError() {
    errorMsg.style.display = 'none';
    promptInput.classList.remove('error');
}

// ===== GENERATE IMAGE =====
async function generateImage() {
    const prompt = promptInput.value.trim();

    // Validation
    if (!prompt) {
        showError('Please enter a prompt to generate.');
        promptInput.focus();
        return;
    }
    hideError();

    // UI Setup
    setLoading(true);
    imageSection.style.display = 'block';
    outputImage.style.display = 'none';
    outputImage.onerror = null; // Reset error handler

    // Build Pollinations API URL
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=700&height=700&nologo=true`;

    // Set image src
    outputImage.src = imageUrl;

    // Handle Load Success
    outputImage.onload = () => {
        setLoading(false);
        outputImage.style.display = 'block';
    };

    // Handle Load Error
    outputImage.onerror = () => {
        setLoading(false);
        showError('Failed to generate image. Please try again.');
        outputImage.style.display = 'none';
        // Show a placeholder text or keep the loader hidden
    };
}

// ===== COPY PROMPT =====
function copyPrompt() {
    const text = promptInput.value.trim();
    if (!text) {
        showToast('Nothing to copy!');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('Prompt copied!'))
            .catch(() => showToast('Failed to copy.'));
    } else {
        // Fallback
        promptInput.select();
        document.execCommand('copy');
        showToast('Prompt copied!');
    }
}

// ===== SHARE =====
function shareImage() {
    const prompt = promptInput.value.trim();
    if (!prompt || !outputImage.src || outputImage.src.includes('null')) {
        showToast('Generate an image first!');
        return;
    }

    const imageUrl = outputImage.src;

    // Mobile Native Share
    if (navigator.share) {
        navigator.share({
            title: 'PromptLab AI Image',
            text: `Check out this AI image: "${prompt}"`,
            url: imageUrl,
        }).catch((err) => {
            if (err.name !== 'AbortError') {
                // If share fails, fallback to copy link
                copyImageLink(imageUrl);
            }
        });
    } else {
        // Desktop: Copy Image URL to clipboard
        copyImageLink(imageUrl);
    }
}

function copyImageLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
            .then(() => showToast('Image link copied!'))
            .catch(() => showToast('Failed to copy link.'));
    } else {
        // Fallback
        const dummy = document.createElement('input');
        dummy.value = url;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        showToast('Image link copied!');
    }
}

// ===== EVENT BINDINGS =====
generateBtn.addEventListener('click', generateImage);

// Enter key on textarea triggers generate (Ctrl+Enter or Cmd+Enter)
promptInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateImage();
    }
});

copyBtn.addEventListener('click', copyPrompt);
shareBtn.addEventListener('click', shareImage);

// Hide error on typing
promptInput.addEventListener('input', hideError);
