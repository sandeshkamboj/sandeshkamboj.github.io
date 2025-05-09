function initializeApp(attempt = 1, maxAttempts = 50) {
    if (attempt > maxAttempts) {
        console.error('Failed to load Supabase library after ' + maxAttempts + ' attempts. Please check if Supabase is loaded correctly.');
        return;
    }

    if (typeof window.supabase === 'undefined') {
        console.warn('Supabase library not loaded yet, attempt ' + attempt + '/' + maxAttempts);
        setTimeout(() => initializeApp(attempt + 1, maxAttempts), 100);
        return;
    }

    console.log('Supabase library loaded successfully on attempt ' + attempt);
    const supabase = window.supabase;

    console.log('Supabase client initialized:', supabase);

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

    supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Session check:', session);
        if (session) {
            showMainPanel();
        }
    });

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
        setInterval(loadLocations, 5000);
        setInterval(loadMediaFiles, 5000);
    }

    if (sendRequestBtn) {
    sendRequestBtn.addEventListener('click', async () => {
        console.log('Send Request button clicked');
        const action = actionSelect.value;
        const duration = durationInput.value ? parseInt(durationInput.value) : null;

        console.log('Action:', action, 'Duration:', duration);

        if (action === 'record_video' || action === 'record_audio') {
            if (!duration || duration <= 0) {
                console.log('Validation failed: Duration must be a positive number for video/audio');
                requestStatus.innerHTML = '<span class="text-danger">Please enter a valid duration.</span>';
                return;
            }
        }

        try {
            console.log('Attempting to insert request into Supabase...');
            const { data, error } = await supabase
                .from('requests')
                .insert([{ action, duration }])
                .select(); // Add .select() to return the inserted row

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            console.log('Insert successful, data:', data); // Should log the inserted row
            requestStatus.innerHTML = '<span class="text-success">Request sent successfully!</span>';
            console.log('Request sent successfully!');
            durationInput.value = '';
        } catch (error) {
            console.error('Error sending request:', error);
            requestStatus.innerHTML = `<span class="text-danger">Error: ${error.message || 'Unknown error'}</span>`;
        }
    });
}

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
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, starting app initialization');
    initializeApp();
});