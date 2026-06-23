// Call this helper to evaluate if a returning runner is already registered
        async function checkExistingRunner() {
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            
            if (!firstName || !lastName) return;

            try {
                const response = await fetch('/api/runners');
                const runners = await response.json();
                
                // See if this runner already exists in the active or DNF database
                const match = runners.find(r => 
                    r.firstName.toLowerCase() === firstName.toLowerCase() && 
                    r.lastName.toLowerCase() === lastName.toLowerCase()
                );

                const scanBtn = document.getElementById('openScannerBtn');
                if (match) {
                    scanBtn.innerText = `Scan Loop QR (Lap ${match.laps + 1})`;
                    showStatus(`RECONNECTED: Found active profile for ${firstName}.`, "#0066cc", "#edf2f7");
                    // Keep the status visible for 3 seconds then fade out
                    setTimeout(() => { showStatus("", "", "transparent"); }, 3000);
                } else {
                    scanBtn.innerText = "Scan Loop QR Code";
                }
            } catch (e) { console.error("Sync verification failed", e); }
        }

        // Attach listeners to the input fields so it updates dynamically as they type or when page loads
            if (window.location.pathname.includes('/admin')) {
                document.getElementById('adminConsole').style.display = 'block';
            }
            
            document.getElementById('firstName').value = localStorage.getItem('test_firstName') || '';
            document.getElementById('lastName').value = localStorage.getItem('test_lastName') || '';
            
            // Check right away on load if we have cached names
            checkExistingRunner();

            // Also check if they manually re-type their name
            document.getElementById('firstName').addEventListener('input', checkExistingRunner);
            document.getElementById('lastName').addEventListener('input', checkExistingRunner);
            
            document.getElementById('openScannerBtn').addEventListener('click', startQRScanner);
            document.getElementById('abortScanBtn').addEventListener('click', stopQRScanner);
            
            syncRaceStatus();
            setInterval(syncRaceStatus, 5000); 
        });
