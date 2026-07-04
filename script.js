// =====================================================
// PHC JACKPOT - SCRIPT.JS (COMPLETE VERSION)
// All game functions and utilities
// =====================================================

// ==========================================================
// 1. SUPABASE CONFIG (WORKING CREDENTIALS)
// ==========================================================
const SUPABASE_URL = "https://gcesrhfyupmkrevaqpfr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZXNyaGZ5dXBta3JldmFxcGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MjQ0MjAsImV4cCI6MjA5ODQwMDQyMH0.LarBYjP0Eg4HfFV_x5GVS7K1d4AuRfBWOjo0D1kL2xM";

// ==========================================================
// 2. SESSION GUARD
// ==========================================================
(function() {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== 'register.html' && currentPage !== '') {
        if (!localStorage.getItem('phc_current_user')) {
            window.location.href = 'login.html';
        }
    }
})();

// ==========================================================
// 3. DARK MODE
// ==========================================================
(function() {
    if (localStorage.getItem("phc_dark_mode") === "true") {
        document.body.classList.add("dark");
    }
})();

// ==========================================================
// 4. HELPERS
// ==========================================================
function formatCurrency(val) {
    return val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showToast(msg, duration = 3000) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

function getCurrentUser() {
    const localUser = JSON.parse(localStorage.getItem('phc_current_user'));
    if (!localUser || !localUser.email) return null;
    return localUser;
}

async function querySupabase(table, query = '') {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error("Supabase Error:", e);
        return [];
    }
}

async function saveToSupabase(table, data) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
        });
        return response.ok;
    } catch (e) {
        console.error("Save Error:", e);
        return false;
    }
}

async function patchSupabase(table, query, data) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.ok;
    } catch (e) {
        console.error("Patch Error:", e);
        return false;
    }
}

async function deleteFromSupabase(table, query) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        return response.ok;
    } catch (e) {
        console.error("Delete Error:", e);
        return false;
    }
}

async function updateUserBalance(email, newBalance) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ balance: newBalance })
        });
        
        const localUser = JSON.parse(localStorage.getItem('phc_current_user'));
        if (localUser) {
            localUser.balance = newBalance;
            localStorage.setItem('phc_current_user', JSON.stringify(localUser));
        }
        return true;
    } catch (e) {
        console.error("Update Balance Error:", e);
        return false;
    }
}

async function saveTransaction(email, name, amount) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                user_email: email,
                name: name,
                amount: amount
            })
        });
        return true;
    } catch (e) {
        console.error("Save Transaction Error:", e);
        return false;
    }
}

// ==========================================================
// 5. COUNTDOWN FUNCTION
// ==========================================================
function startCountdown() {
    const firstMatchTime = new Date(2026, 6, 4, 10, 0, 0).getTime();
    const now = new Date().getTime();
    let targetTime = firstMatchTime;
    
    if (firstMatchTime < now) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        targetTime = tomorrow.getTime();
    }
    
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        console.log("Countdown elements not found");
        return;
    }
    
    setInterval(() => {
        const nowTime = new Date().getTime();
        const distance = targetTime - nowTime;
        
        if (distance < 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }, 1000);
}

// ==========================================================
// 6. GET ROUND NUMBER
// ==========================================================
function getRoundNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return year + month + day;
}

// ==========================================================
// 7. LOAD USER DATA
// ==========================================================
async function loadUserData() {
    const user = getCurrentUser();
    if (!user) return null;
    
    const users = await querySupabase('users', `?email=eq.${user.email}`);
    if (users && users.length > 0) {
        const userData = users[0];
        localStorage.setItem('phc_current_user', JSON.stringify({
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            phone: userData.phone,
            balance: userData.balance || 0,
            address: userData.address,
            country: userData.country || 'US',
            kyc_level: userData.kyc_level || 0,
            kyc_status: userData.kyc_status || 'unverified',
            level: userData.level || 1,
            withdrawal_limit: userData.withdrawal_limit || 1.00,
            entries: userData.entries || 0,
            games: userData.games || 0,
            wins: userData.wins || 0,
            loan_status: userData.loan_status || 'No active loan',
            loan_balance: userData.loan_balance || 0
        }));
        return userData;
    }
    return null;
}

// ==========================================================
// 8. UPDATE UI WITH USER DATA
// ==========================================================
function updateUI() {
    const user = getCurrentUser();
    if (!user) return;
    
    const balanceEl = document.getElementById('balanceNum');
    if (balanceEl) balanceEl.textContent = formatCurrency(user.balance || 0);
    
    const entriesEl = document.getElementById('entries');
    if (entriesEl) entriesEl.textContent = user.entries || 0;
    
    const gamesEl = document.getElementById('games');
    if (gamesEl) gamesEl.textContent = user.games || 0;
    
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = user.firstName || 'User';
}

// ==========================================================
// 9. LOAD WINNERS
// ==========================================================
async function loadWinners() {
    const winners = await querySupabase('jackpot_winners', '?select=*&order=created_at.desc&limit=8');
    const track = document.getElementById('winnerTrack');
    const messages = document.getElementById('winnerMessages');
    
    if (!winners || winners.length === 0) {
        if (track) {
            track.innerHTML = `
                <div class="winner-item">
                    <div class="winner-info">
                        <div class="avatar">🏆</div>
                        <div>
                            <div class="name">No winners yet</div>
                            <div class="game">Be the first to win!</div>
                        </div>
                    </div>
                    <div class="winner-amount">$0.00</div>
                </div>
            `;
        }
        if (messages) {
            messages.innerHTML = `
                <div class="winner-message">
                    <span>🏆 No winners yet. Start playing to win!</span>
                    <span class="msg-amount">+$0</span>
                </div>
            `;
        }
        return;
    }
    
    if (track) {
        let trackHtml = '';
        for (let r = 0; r < 3; r++) {
            winners.forEach(w => {
                const name = w.user_name || 'Anonymous';
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
                trackHtml += `
                    <div class="winner-item">
                        <div class="winner-info">
                            <div class="avatar">${initials || '🏆'}</div>
                            <div>
                                <div class="name">${name}</div>
                                <div class="game">${w.card_type || 'Jackpot'}</div>
                            </div>
                        </div>
                        <div class="winner-amount">
                            +$${formatCurrency(w.amount || 0)}
                        </div>
                    </div>
                `;
            });
        }
        track.innerHTML = trackHtml;
    }
    
    if (messages) {
        let messagesHtml = '';
        winners.slice(0, 5).forEach(w => {
            const name = w.user_name || 'Anonymous';
            const amount = w.amount || 0;
            messagesHtml += `
                <div class="winner-message">
                    <span>🎉 ${name} won ${w.card_type || 'Jackpot'}!</span>
                    <span class="msg-amount">+$${formatCurrency(amount)}</span>
                </div>
            `;
        });
        messages.innerHTML = messagesHtml;
    }
}

// ==========================================================
// 10. LOGOUT
// ==========================================================
function logoutUser() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("phc_current_user");
        showToast("👋 Logged out successfully!");
        setTimeout(() => window.location.href = "login.html", 800);
    }
}

// ==========================================================
// 11. GO TO PAGE
// ==========================================================
function goToPage(page) {
    window.location.href = page;
}

// ==========================================================
// 12. INIT
// ==========================================================
document.addEventListener('DOMContentLoaded', async function() {
    await loadUserData();
    updateUI();
    startCountdown();
    await loadWinners();
    
    // Refresh user data every 30 seconds
    setInterval(async function() {
        await loadUserData();
        updateUI();
    }, 30000);
    
    console.log('✅ PHC Script.js loaded successfully!');
    console.log('🔐 Session guard active');
    console.log('⏰ Countdown running');
});

// Export global functions
window.formatCurrency = formatCurrency;
window.showToast = showToast;
window.getCurrentUser = getCurrentUser;
window.querySupabase = querySupabase;
window.saveToSupabase = saveToSupabase;
window.patchSupabase = patchSupabase;
window.deleteFromSupabase = deleteFromSupabase;
window.updateUserBalance = updateUserBalance;
window.saveTransaction = saveTransaction;
window.startCountdown = startCountdown;
window.getRoundNumber = getRoundNumber;
window.loadUserData = loadUserData;
window.updateUI = updateUI;
window.loadWinners = loadWinners;
window.logoutUser = logoutUser;
window.goToPage = goToPage;