// ===== DOM REFS =====
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const errorMsg = document.getElementById('errorMsg');
const imageSection = document.getElementById('imageSection');
const imageWrapper = document.getElementById('imageWrapper');
const outputImage = document.getElementById('outputImage');
const loader = document.getElementById('loader');
const placeholderText = document.getElementById('placeholderText');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const toast = document.getElementById('toast');

let toastTimeout = null;
let imageTimeout = null;

// ===== HELPERS =====
function showToast(message, isSuccess = true) {
    toast.textContent = message;
    toast.className = 'toast' + (isSuccess ? ' success' : '');
    // Force reflow for animation reset
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    generateBtn.textContent = isLoading ? 'Generating...' : 'Generate Image';
    if (isLoading) {
        loader.classList.add('active');
        outputImage.classList.remove('loaded');
        outputImage.style.display = 'none';
        imageSection.style.display = 'block';
        imageWrapper.classList.remove('has-image');
        placeholderText.style.display = 'flex';
        // Clear previous error
        hideError();
        // Clear previous src to avoid showing old image
        outputImage.src = '';
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

function resetImageState() {
    outputImage.style.display = 'none';
    outputImage.classList.remove('loaded');
    imageWrapper.classList.remove('has-image');
    placeholderText.style.display = 'flex';
    loader.classList.remove('active');
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Image';
    clearTimeout(imageTimeout);
}

// ===== GENERATE IMAGE =====
function generateImage() {
    const prompt = promptInput.value.trim();

    // --- Validation ---
    if (!prompt) {
        showError('Please enter a prompt to generate.');
        promptInput.focus();
        return;
    }
    hideError();

    // --- Reset previous state ---
    resetImageState();
    // Cancel any pending timeout
    if (imageTimeout) {
        clearTimeout(imageTimeout);
        imageTimeout = null;
    }

    // --- UI Loading ---
    setLoading(true);
    imageSection.style.display = 'block';
    // Keep placeholder visible while loading
    placeholderText.style.display = 'flex';
    imageWrapper.classList.remove('has-image');

    // --- Build URL (with cache buster) ---
    const encodedPrompt = encodeURIComponent(prompt);
    const cacheBuster = Date.now();
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=700&height=700&nologo=true&_=${cacheBuster}`;

    // Set src to trigger load
    outputImage.src = imageUrl;
    outputImage.style.display = 'block';

    // --- Success Handler ---
    outputImage.onload = () => {
        setLoading(false);
        outputImage.classList.add('loaded');
        imageWrapper.classList.add('has-image');
        placeholderText.style.display = 'none';
        clearTimeout(imageTimeout);
        imageTimeout = null;
    };

    // --- Error Handler ---
    outputImage.onerror = () => {
        setLoading(false);
        outputImage.style.display = 'none';
        imageWrapper.classList.remove('has-image');
        placeholderText.style.display = 'flex';
        showError('Failed to generate image. Please check your network or try a different prompt.');
        clearTimeout(imageTimeout);
        imageTimeout = null;
    };

    // --- Safety Timeout (30 seconds) ---
    imageTimeout = setTimeout(() => {
        if (generateBtn.disabled) {
            setLoading(false);
            outputImage.style.display = 'none';
            imageWrapper.classList.remove('has-image');
            placeholderText.style.display = 'flex';
            showError('Request timed out. Please try again.');
            imageTimeout = null;
        }
    }, 30000);
}

// ===== COPY PROMPT =====
function copyPrompt() {
    const text = promptInput.value.trim();
    if (!text) {
        showToast('Nothing to copy!', false);
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('Prompt copied!', true))
            .catch(() => {
                // Fallback
                fallbackCopy(text);
            });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    promptInput.select();
    try {
        document.execCommand('copy');
        showToast('Prompt copied!', true);
    } catch (_) {
        showToast('Failed to copy.', false);
    }
    promptInput.blur();
}

// ===== SHARE =====
function shareImage() {
    const prompt = promptInput.value.trim();
    const imageUrl = outputImage.src;

    if (!prompt || !imageUrl || !imageUrl.includes('prompt')) {
        showToast('Generate an image first!', false);
        return;
    }

    // --- Mobile Native Share ---
    if (navigator.share) {
        navigator.share({
            title: 'PromptLab AI Image',
            text: `"${prompt}" – Generated with PromptLab`,
            url: imageUrl,
        }).catch((err) => {
            if (err.name !== 'AbortError') {
                // Fallback to copy link if share fails (e.g. no apps)
                copyImageLink(imageUrl);
            }
        });
    } else {
        // --- Desktop: Copy Image URL ---
        copyImageLink(imageUrl);
    }
}

function copyImageLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
            .then(() => showToast('Image link copied to clipboard!', true))
            .catch(() => fallbackCopyLink(url));
    } else {
        fallbackCopyLink(url);
    }
}

function fallbackCopyLink(url) {
    const dummy = document.createElement('input');
    dummy.value = url;
    dummy.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dummy);
    dummy.select();
    try {
        document.execCommand('copy');
        showToast('Image link copied!', true);
    } catch (_) {
        showToast('Failed to copy link.', false);
    }
    document.body.removeChild(dummy);
}

// ===== EVENT BINDINGS =====
generateBtn.addEventListener('click', generateImage);

// Ctrl+Enter / Cmd+Enter to generate
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

// Cleanup timeout if page unloads
window.addEventListener('beforeunload', () => {
    if (imageTimeout) clearTimeout(imageTimeout);
});
