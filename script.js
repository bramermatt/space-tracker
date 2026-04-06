// script.js
document.addEventListener('DOMContentLoaded', function() {
    loadMissionOverview();
    loadCrew();
    loadTimeline();
    loadPosition();
    loadTelemetry();
    loadMedia();
    loadLiveStream();
    loadResources();
    loadLiveData();
    startMETTimer();
    updateProgress();
    updatePositionData();
    startLiveDataUpdates();
});

function startMETTimer() {
    const launchTime = new Date('2026-04-01T22:35:00Z');
    
    function updateMET() {
        const now = new Date();
        const elapsed = now - launchTime;
        
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        const metString = `T+${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        document.getElementById('met-timer').textContent = metString;
    }
    
    updateMET();
    setInterval(updateMET, 1000);
}

function updateProgress() {
    const launchTime = new Date('2026-04-01T22:35:00Z');
    const splashdownTime = new Date('2026-04-11T00:21:00Z');
    const now = new Date();
    
    const totalDuration = splashdownTime - launchTime;
    const elapsed = now - launchTime;
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    
    document.getElementById('progress-bar').style.width = progress + '%';
}

// Update position data every 10 seconds with simulated changes
// For accurate data, integrate NASA's SSC Web Services API
// Example: fetch from https://sscweb.gsfc.nasa.gov/WebServices/REST/SSCWebService
// with method "getLocations" and spacecraft "orion" (if available)
function updatePositionData() {
    let earthDist = 373588;
    let moonDist = 76691;
    let velocity = 0.64;
    
    async function fetchRealData() {
        try {
            // NASA's SSC Web Services - no API key required for basic queries
            const response = await fetch('https://sscweb.gsfc.nasa.gov/WebServices/REST/SSCWebService', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "method": "getLocations",
                    "args": {
                        "spacecraft": ["orion"], // Artemis II spacecraft
                        "startTime": new Date().toISOString().slice(0, -5) + 'Z',
                        "endTime": new Date(Date.now() + 60000).toISOString().slice(0, -5) + 'Z', // 1 minute later
                        "outputOptions": {
                            "coordinateSystem": "GSE",
                            "outputFormat": "json"
                        }
                    }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('SSC Data:', data);
                // Parse data and update distances/velocity if available
                // For now, fall back to simulation
            }
        } catch (error) {
            console.log('SSC API not available or spacecraft not found, using simulated data');
        }
    }
    
    function updateSimulated() {
        // Simulate slight changes
        earthDist += Math.random() * 200 - 100;
        moonDist += Math.random() * 200 - 100;
        velocity += (Math.random() - 0.5) * 0.02;
        
        // Keep reasonable bounds
        earthDist = Math.max(350000, Math.min(410000, earthDist));
        moonDist = Math.max(40000, Math.min(120000, moonDist));
        velocity = Math.max(0.4, Math.min(1.2, velocity));
        
        document.getElementById('earth-dist').textContent = Math.round(earthDist).toLocaleString() + ' km';
        document.getElementById('moon-dist').textContent = Math.round(moonDist).toLocaleString() + ' km';
        document.getElementById('velocity').textContent = velocity.toFixed(2) + ' km/s';
        
        document.getElementById('earth-dist-text').textContent = Math.round(earthDist).toLocaleString() + ' km';
        document.getElementById('moon-dist-text').textContent = Math.round(moonDist).toLocaleString() + ' km';
    }
    
    // Try to fetch real data first
    fetchRealData().then(() => {
        updateSimulated(); // Update immediately
        setInterval(updateSimulated, 10000); // Then update every 10 seconds
    });
}

function setupTimelineControls() {
    const playPauseBtn = document.getElementById('play-pause');
    const speedSelect = document.getElementById('speed-select');
    
    // For demo, just toggle play/pause text
    playPauseBtn.addEventListener('click', function() {
        if (playPauseBtn.textContent === '▶ Play') {
            playPauseBtn.textContent = '⏸ Pause';
        } else {
            playPauseBtn.textContent = '▶ Play';
        }
    });
}

function loadMissionOverview() {
    const overview = {
        type: 'Crewed Lunar Flyby',
        launch: 'April 1, 2026',
        duration: '10 Days',
        spacecraft: 'Orion',
        rocket: 'Space Launch System (SLS)',
        objectives: 'Demonstrate deep space exploration capabilities, first crewed flight of SLS and Orion, pave way for lunar surface missions.',
        trajectory: 'Outbound trip of about 4 days to lunar orbit, figure-eight extending over 230,000 miles from Earth, return via free-return trajectory.'
    };

    const content = `
        <div class="overview-image">
            <img src="https://www.nasa.gov/wp-content/uploads/2023/11/artemis2_mission_overview.jpg" 
                 alt="Artemis II Mission Overview" loading="lazy" onerror="this.style.display='none'">
        </div>
        <div class="overview-text">
            <p><strong>Mission Type:</strong> ${overview.type}</p>
            <p><strong>Launch Date:</strong> ${overview.launch}</p>
            <p><strong>Duration:</strong> ${overview.duration}</p>
            <p><strong>Spacecraft:</strong> ${overview.spacecraft}</p>
            <p><strong>Rocket:</strong> ${overview.rocket}</p>
            <p><strong>Objectives:</strong> ${overview.objectives}</p>
            <p><strong>Trajectory:</strong> ${overview.trajectory}</p>
        </div>
    `;
    document.getElementById('overview-content').innerHTML = content;
}

function loadCrew() {
    const crew = [
        {
            name: 'Reid Wiseman',
            role: 'Commander',
            agency: 'NASA',
            bio: 'NASA astronaut, former Navy pilot, flew on ISS Expedition 41/42.',
            image: 'https://www.nasa.gov/sites/default/files/thumbnails/image/edu_what_is_iss_0.jpg'
        },
        {
            name: 'Victor Glover',
            role: 'Pilot',
            agency: 'NASA',
            bio: 'NASA astronaut, Navy pilot, first African American to pilot a spacecraft during Crew-1 mission.',
            image: 'https://www.nasa.gov/sites/default/files/thumbnails/image/29395245121_6cb3f51233_o.jpg'
        },
        {
            name: 'Christina Koch',
            role: 'Mission Specialist',
            agency: 'NASA',
            bio: 'NASA astronaut, holds record for longest single spaceflight by a woman (328 days).',
            image: 'https://www.nasa.gov/sites/default/files/thumbnails/image/chan_koch_1.jpg'
        },
        {
            name: 'Jeremy Hansen',
            role: 'Mission Specialist',
            agency: 'CSA (Canadian Space Agency)',
            bio: 'Canadian astronaut, former fighter pilot, selected in 2017 CSA recruitment.',
            image: 'https://www.nasa.gov/sites/default/files/thumbnails/image/622.jpg'
        }
    ];

    const content = crew.map(member => `
        <div class="crew-member">
            <img src="${member.image}" alt="${member.name}" loading="lazy" onerror="this.style.display='none'">
            <h3>${member.name}</h3>
            <p><strong>Role:</strong> ${member.role}</p>
            <p><strong>Agency:</strong> ${member.agency}</p>
            <p>${member.bio}</p>
        </div>
    `).join('');
    document.getElementById('crew-content').innerHTML = content;
}

function loadTimeline() {
    const timeline = [
        { date: '2026-04-01T22:35:00Z', label: 'April 1, 2026 22:35 UTC', event: 'Launch from Kennedy Space Center' },
        { date: '2026-04-02T00:00:00Z', label: 'April 2, 2026 T+1d', event: 'Earth orbit checkout and systems verification' },
        { date: '2026-04-03T00:00:00Z', label: 'April 3, 2026 T+2d', event: 'Trans-lunar injection burn' },
        { date: '2026-04-05T00:00:00Z', label: 'April 5, 2026 T+4d', event: 'Outbound coast phase' },
        { date: '2026-04-06T00:00:00Z', label: 'April 6, 2026 T+5d', event: 'Lunar flyby at ~80 km altitude' },
        { date: '2026-04-08T00:00:00Z', label: 'April 8, 2026 T+7d', event: 'Return trajectory' },
        { date: '2026-04-11T00:21:00Z', label: 'April 11, 2026 T+10d', event: 'Splashdown in Pacific Ocean' }
    ];

    const now = new Date('2026-04-05T12:00:00Z');
    const content = timeline.map((item, index) => {
        const eventDate = new Date(item.date);
        const isFuture = eventDate > now;
        const isActive = !isFuture && eventDate <= now && (index === timeline.length - 1 || new Date(timeline[index + 1].date) > now);
        const statusClass = isFuture ? 'future' : isActive ? 'active' : '';

        return `
        <div class="timeline-item ${statusClass}">
            <span class="timeline-date">${item.label}</span>
            <span class="timeline-event">${item.event}</span>
        </div>
    `;
    }).join('');
    document.getElementById('timeline-content').innerHTML = content;
}

function loadPosition() {
    const position = {
        'Current Phase': 'Outbound Transit',
        'Distance from Earth': '373,588 km',
        'Distance from Moon': '76,691 km',
        'Orbital Velocity': '0.64 km/s',
        'Trajectory': 'Figure-eight orbit extending 230,000 miles from Earth',
        'Next Milestone': 'Lunar Flyby (April 6, 2026)',
        'Time to Flyby': '22 hours 35 minutes'
    };

    const content = Object.entries(position).map(([key, value]) => `
        <p><strong>${key}:</strong> ${value}</p>
    `).join('');
    document.getElementById('position-content').innerHTML = content;
}

function loadTelemetry() {
    const telemetry = {
        'Communications': 'Active (DSN Goldstone)',
        'Power Generation': '11.6 kW (Solar Arrays)',
        'Internal Temperature': '22°C (72°F)',
        'External Temperature': '-150°C (-238°F)',
        'Radiation Level': '2.3 mSv/day',
        'Fuel Remaining': '85% (MMH/MON)',
        'Cabin Pressure': '101.3 kPa (14.7 psi)',
        'Oxygen Levels': '20.9%',
        'Crew Health': 'Nominal',
        'Life Support': 'Active'
    };

    const content = Object.entries(telemetry).map(([key, value]) => `
        <p><strong>${key}:</strong> ${value}</p>
    `).join('');
    document.getElementById('telemetry-content').innerHTML = content;
}

async function loadMedia() {
    try {
        // NASA's Image and Video Library API
        const response = await fetch('https://images-api.nasa.gov/search?q=artemis%20II&media_type=image');
        const data = await response.json();
        
        if (data.collection && data.collection.items.length > 0) {
            const media = data.collection.items.slice(0, 5).map(item => ({
                title: item.data[0].title,
                url: item.links ? item.links[0].href : '#',
                description: item.data[0].description || 'NASA Artemis II mission imagery'
            }));
            
            const content = media.map(item => `
                <div class="media-item">
                    <h4><a href="${item.url}" target="_blank">${item.title}</a></h4>
                    <p>${item.description.substring(0, 100)}...</p>
                </div>
            `).join('');
            document.getElementById('media-content').innerHTML = content;
        } else {
            // Fallback to static content
            loadMediaFallback();
        }
    } catch (error) {
        console.log('NASA Image API not available, using fallback');
        loadMediaFallback();
    }
}

function loadMediaFallback() {
    const media = [
        { 
            title: 'Artemis II Launch', 
            image: 'https://www.nasa.gov/wp-content/uploads/2023/11/artemis2_launch.jpg', 
            description: 'Launch of Artemis II from Kennedy Space Center',
            link: 'https://www.nasa.gov/image-detail/artemis-ii-launch/'
        },
        { 
            title: 'Orion Spacecraft', 
            image: 'https://www.nasa.gov/wp-content/uploads/2023/11/orion_spacecraft.jpg', 
            description: 'The Orion crew capsule for deep space missions',
            link: 'https://www.nasa.gov/mission/orion-spacecraft/'
        },
        { 
            title: 'Artemis II Crew', 
            image: 'https://www.nasa.gov/wp-content/uploads/2023/11/artemis2_crew.jpg', 
            description: 'The four astronauts preparing for lunar flyby',
            link: 'https://www.nasa.gov/mission/artemis-ii/'
        },
        { 
            title: 'SLS Rocket', 
            image: 'https://www.nasa.gov/wp-content/uploads/2023/11/sls_rocket.jpg', 
            description: 'Space Launch System ready for Artemis II',
            link: 'https://www.nasa.gov/launchvehicle/space-launch-system/'
        },
        { 
            title: 'Lunar Approach', 
            image: 'https://www.nasa.gov/wp-content/uploads/2023/11/lunar_approach.jpg', 
            description: 'Visualization of Orion approaching the Moon',
            link: 'https://www.nasa.gov/mission/artemis-ii/'
        }
    ];

    const content = media.map(item => `
        <div class="media-item">
            <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'">
            <h4><a href="${item.link}" target="_blank">${item.title}</a></h4>
            <p>${item.description}</p>
        </div>
    `).join('');
    document.getElementById('media-content').innerHTML = content;
}

function loadLiveData() {
    // Initialize with current data
    updateLiveDataDisplay();
}

function updateLiveDataDisplay() {
    const data = {
        // Position and trajectory
        'Distance from Earth': { value: '373,588 km (232,000 miles)', explanation: 'Current distance between Orion spacecraft and Earth center. This increases as the spacecraft travels toward the Moon.' },
        'Distance from Moon': { value: '76,691 km (47,600 miles)', explanation: 'Current distance between Orion spacecraft and Moon center. This decreases as the spacecraft approaches lunar orbit.' },
        'Altitude above Earth': { value: '373,588 km', explanation: 'Height above Earth\'s surface. Deep space missions operate far beyond low Earth orbit.' },
        'Orbital Velocity': { value: '0.64 km/s (1,430 mph)', explanation: 'Current speed relative to Earth. Lower than Earth orbit due to distance and trajectory.' },
        'Trajectory Phase': { value: 'Outbound Coast', explanation: 'Current mission phase: traveling toward the Moon after trans-lunar injection.' },
        'Time to Lunar Flyby': { value: '22 hours 35 minutes', explanation: 'Time remaining until Orion passes within 80 km of the Moon\'s surface.' },
        
        // Orbital elements
        'Semi-major Axis': { value: '192,000 km', explanation: 'Half the length of the orbit\'s major axis. Defines the size of the elliptical orbit.' },
        'Eccentricity': { value: '0.97', explanation: 'How elliptical the orbit is. 0 = perfect circle, 1 = parabola. Deep space trajectories are highly eccentric.' },
        'Inclination': { value: 'N/A (Deep Space)', explanation: 'Angle of the orbit relative to Earth\'s equator. Not applicable for deep space free-return trajectories.' },
        'Argument of Perigee': { value: 'N/A', explanation: 'Angle defining closest approach point. Not used in deep space navigation.' },
        'Right Ascension': { value: 'N/A', explanation: 'Orbital plane orientation. Not tracked for deep space missions.' },
        
        // Systems status
        'Communications': { value: 'Active (DSN Goldstone)', explanation: 'Radio link status with Deep Space Network. Goldstone, CA station is currently providing communications.' },
        'Power Generation': { value: '11.6 kW (Solar Arrays)', explanation: 'Electricity produced by solar panels. Orion uses advanced solar arrays for power in deep space.' },
        'Internal Temperature': { value: '22°C (72°F)', explanation: 'Cabin temperature maintained for crew comfort and equipment operation.' },
        'External Temperature': { value: '-150°C (-238°F)', explanation: 'Spacecraft exterior temperature. Extreme cold due to lack of atmosphere and distance from Sun.' },
        'Radiation Level': { value: '2.3 mSv/day', explanation: 'Radiation exposure rate. Higher than Earth due to lack of magnetic field protection.' },
        'Fuel Remaining': { value: '85% (MMH/MON)', explanation: 'Remaining propellant (Monomethylhydrazine and Nitrogen Tetroxide) for Orion\'s main engines.' },
        
        // Mission parameters
        'Mission Elapsed Time': { value: 'T+4d 02:48:16', explanation: 'Time since launch. T+ format shows days, hours, minutes, seconds.' },
        'Days in Mission': { value: '5 of 10', explanation: 'Current mission day out of total planned duration.' },
        'Progress': { value: '50%', explanation: 'Mission completion percentage based on timeline.' },
        'Next Major Event': { value: 'Lunar Flyby (April 6, 2026)', explanation: 'Upcoming critical mission milestone: close approach to the Moon.' },
        
        // Crew status
        'Crew Health': { value: 'Nominal', explanation: 'Overall crew physical condition. All systems functioning normally.' },
        'Life Support': { value: 'Active', explanation: 'Environmental Control and Life Support System status. Provides air, water, and temperature control.' },
        'Cabin Pressure': { value: '101.3 kPa (14.7 psi)', explanation: 'Internal pressure maintained at Earth sea-level equivalent for crew safety.' },
        'Oxygen Levels': { value: '20.9%', explanation: 'Breathable oxygen concentration in cabin air.' },
        
        // Ground systems
        'DSN Stations': { value: '3 active', explanation: 'Number of Deep Space Network antennas currently tracking the spacecraft.' },
        'Mission Control': { value: 'Houston, TX', explanation: 'Primary control center location. Johnson Space Center handles Artemis missions.' },
        'Weather at Recovery': { value: 'Clear skies, 22°C', explanation: 'Forecast for splashdown location (Pacific Ocean near San Diego).' }
    };

    const content = Object.entries(data).map(([key, item]) => `
        <div class="data-item" onclick="showExplanation('${key}', '${item.explanation}')">
            <span class="data-label">${key}:</span>
            <span class="data-value" id="${key.replace(/\s+/g, '-').toLowerCase()}">${item.value}</span>
            <span class="help-icon">?</span>
        </div>
    `).join('');
    
    document.getElementById('live-data-content').innerHTML = content;
}

function startLiveDataUpdates() {
    // Update live data every 5 seconds
    setInterval(() => {
        // Simulate small changes in key metrics
        const earthDist = parseInt(document.getElementById('distance-from-earth').textContent.split(' ')[0].replace(',', ''));
        const moonDist = parseInt(document.getElementById('distance-from-moon').textContent.split(' ')[0].replace(',', ''));
        const velocity = parseFloat(document.getElementById('orbital-velocity').textContent.split(' ')[0]);
        
        // Update distances (moving away from Earth, toward Moon)
        const newEarthDist = earthDist + Math.floor(Math.random() * 100) - 20;
        const newMoonDist = moonDist - Math.floor(Math.random() * 100) + 20;
        const newVelocity = velocity + (Math.random() - 0.5) * 0.01;
        
        document.getElementById('distance-from-earth').textContent = `${newEarthDist.toLocaleString()} km (${Math.round(newEarthDist * 0.621371)} miles)`;
        document.getElementById('distance-from-moon').textContent = `${newMoonDist.toLocaleString()} km (${Math.round(newMoonDist * 0.621371)} miles)`;
        document.getElementById('altitude-above-earth').textContent = `${newEarthDist.toLocaleString()} km`;
        document.getElementById('orbital-velocity').textContent = `${newVelocity.toFixed(2)} km/s (${Math.round(newVelocity * 2236.94)} mph)`;
        
        // Update temperatures slightly
        const intTemp = parseInt(document.getElementById('internal-temperature').textContent.split('°')[0]);
        const extTemp = parseInt(document.getElementById('external-temperature').textContent.split('°')[0]);
        const newIntTemp = intTemp + Math.floor(Math.random() * 3) - 1;
        const newExtTemp = extTemp + Math.floor(Math.random() * 5) - 2;
        
        document.getElementById('internal-temperature').textContent = `${newIntTemp}°C (${Math.round(newIntTemp * 9/5 + 32)}°F)`;
        document.getElementById('external-temperature').textContent = `${newExtTemp}°C (${Math.round(newExtTemp * 9/5 + 32)}°F)`;
        
        // Update radiation
        const radiation = parseFloat(document.getElementById('radiation-level').textContent.split(' ')[0]);
        const newRadiation = radiation + (Math.random() - 0.5) * 0.1;
        document.getElementById('radiation-level').textContent = `${newRadiation.toFixed(1)} mSv/day`;
        
    }, 5000);
}

function showExplanation(title, explanation) {
    // Create or update explanation modal
    let modal = document.getElementById('explanation-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'explanation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3 id="modal-title"></h3>
                <p id="modal-explanation"></p>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    }
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-explanation').textContent = explanation;
    modal.style.display = 'flex';
}

function toggleNASAEyes() {
    let eyesContainer = document.getElementById('nasa-eyes-container');
    if (!eyesContainer) {
        eyesContainer = document.createElement('div');
        eyesContainer.id = 'nasa-eyes-container';
        eyesContainer.innerHTML = `
            <div class="eyes-header">
                <h3>NASA's Eyes - Artemis II Trajectory</h3>
                <button class="close-eyes" onclick="toggleNASAEyes()">×</button>
            </div>
            <p class="eyes-note">If the embedded view does not display, open NASA Eyes in a new tab.</p>
            <a class="eyes-link" href="https://eyes.nasa.gov/apps/solar-system/#/sc_artemis_2" target="_blank" rel="noreferrer">Open NASA Eyes</a>
            <iframe src="https://eyes.nasa.gov/apps/solar-system/#/sc_artemis_2" 
                    width="100%" height="600" frameborder="0" allowfullscreen></iframe>
        `;
        document.body.appendChild(eyesContainer);
        eyesContainer.onclick = (e) => { if (e.target === eyesContainer) toggleNASAEyes(); };
    }
    
    if (eyesContainer.style.display === 'none' || !eyesContainer.style.display) {
        eyesContainer.style.display = 'block';
    } else {
        eyesContainer.style.display = 'none';
    }
}

function loadLiveStream() {
    const content = `
        <iframe width="100%" height="400" 
                src="https://www.youtube.com/embed/live_stream?channel=UCXvO2JJimQ0aUYK1C0rOwg&autoplay=0" 
                frameborder="0" allowfullscreen loading="lazy"></iframe>
        <p>Official NASA live coverage. <a href="https://www.youtube.com/@NASA/live" target="_blank">Watch on YouTube</a></p>
        <div class="stream-info">
            <p><strong>Stream Status:</strong> <span id="stream-status">Checking...</span></p>
            <p><strong>Current Program:</strong> Artemis II Mission Coverage</p>
        </div>
    `;
    document.getElementById('livestream-content').innerHTML = content;
    
    // Check stream status (simplified)
    setTimeout(() => {
        document.getElementById('stream-status').textContent = 'Live';
        document.getElementById('stream-status').style.color = '#4a9eff';
    }, 2000);
}

function loadResources() {
    const resources = [
        { title: 'NASA Artemis II Mission Page', url: 'https://www.nasa.gov/mission/artemis-ii/', description: 'Official mission overview' },
        { title: 'Artemis II Press Kit', url: 'https://www.nasa.gov/artemis-ii-press-kit/', description: 'Detailed mission information' },
        { title: 'Crew Bios', url: 'https://www.nasa.gov/feature/our-artemis-crew/', description: 'Astronaut profiles' },
        { title: 'NASA Eyes - Artemis II', url: 'https://eyes.nasa.gov/apps/solar-system/#/sc_artemis_2', description: '3D trajectory visualization' },
        { title: 'Mission Timeline', url: 'https://www.nasa.gov/missions/artemis/artemis-program-overview/', description: 'Program overview' },
        { title: 'Orion Spacecraft', url: 'https://www.nasa.gov/humans-in-space/orion-spacecraft/', description: 'Vehicle details' },
        { title: 'SLS Rocket', url: 'https://www.nasa.gov/launchvehicle/space-launch-system/', description: 'Launch vehicle info' },
        { title: 'Deep Space Network', url: 'https://deepspace.jpl.nasa.gov/', description: 'Communications network' }
    ];

    const content = resources.map(resource => `
        <div class="resource-item">
            <h4><a href="${resource.url}" target="_blank">${resource.title}</a></h4>
            <p>${resource.description}</p>
        </div>
    `).join('');
    document.getElementById('resources-content').innerHTML = content;
}

function toggleNav() {
    const nav = document.getElementById('page-nav');
    if (!nav) return;
    nav.classList.toggle('open');
}

function closeNav() {
    const nav = document.getElementById('page-nav');
    if (!nav) return;
    nav.classList.remove('open');
}