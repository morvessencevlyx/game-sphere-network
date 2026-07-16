// ============================================
// GAME SPHERE NETWORK - DATABASE
// ============================================

// ============================================
// DATABASE FUNCTIONS
// ============================================

const DB = {
    // ----- GET ALL DATA -----
    getAll: function(collection) {
        try {
            const data = localStorage.getItem(collection);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error getting ' + collection + ':', e);
            return [];
        }
    },

    // ----- SAVE DATA -----
    saveAll: function(collection, data) {
        try {
            localStorage.setItem(collection, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving ' + collection + ':', e);
            return false;
        }
    },

    // ----- FIND ONE BY ID -----
    findById: function(collection, id) {
        const data = this.getAll(collection);
        return data.find(item => item.id === id) || null;
    },

    // ----- FIND BY FIELD -----
    findByField: function(collection, field, value) {
        const data = this.getAll(collection);
        return data.find(item => item[field] === value) || null;
    },

    // ----- FIND ALL BY FIELD -----
    findAllByField: function(collection, field, value) {
        const data = this.getAll(collection);
        return data.filter(item => item[field] === value);
    },

    // ----- INSERT NEW RECORD -----
    insert: function(collection, record) {
        const data = this.getAll(collection);
        record.id = this.generateId(collection);
        data.push(record);
        this.saveAll(collection, data);
        return record;
    },

    // ----- UPDATE RECORD -----
    update: function(collection, id, updates) {
        const data = this.getAll(collection);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.saveAll(collection, data);
            return data[index];
        }
        return null;
    },

    // ----- DELETE RECORD -----
    delete: function(collection, id) {
        let data = this.getAll(collection);
        data = data.filter(item => item.id !== id);
        this.saveAll(collection, data);
        return true;
    },

    // ----- DELETE ALL RECORDS -----
    deleteAll: function(collection) {
        this.saveAll(collection, []);
        return true;
    },

    // ----- GENERATE UNIQUE ID -----
    generateId: function(collection) {
        const prefixes = {
            'users': 'USR',
            'withdrawals': 'WD',
            'announcements': 'AN',
            'violations': 'VIO',
            'transactions': 'TXN'
        };
        const prefix = prefixes[collection] || 'ID';
        const data = this.getAll(collection);
        const count = data.length + 1;
        return prefix + '-' + String(count).padStart(4, '0');
    },

    // ----- COUNT RECORDS -----
    count: function(collection) {
        return this.getAll(collection).length;
    },

    // ----- SEARCH -----
    search: function(collection, searchTerm, fields) {
        const data = this.getAll(collection);
        if (!searchTerm || searchTerm.trim() === '') return data;

        const term = searchTerm.toLowerCase().trim();
        return data.filter(item => {
            return fields.some(field => {
                const value = item[field];
                return value && String(value).toLowerCase().includes(term);
            });
        });
    },

    // ----- GET BY DATE RANGE -----
    getByDateRange: function(collection, dateField, startDate, endDate) {
        const data = this.getAll(collection);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return data.filter(item => {
            const date = new Date(item[dateField]);
            return date >= start && date <= end;
        });
    },

    // ----- SUM FIELD -----
    sumField: function(collection, field, filter) {
        const data = filter ? this.findAllByField(collection, filter.field, filter.value) : this.getAll(collection);
        return data.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
    },

    // ----- AVERAGE FIELD -----
    avgField: function(collection, field, filter) {
        const data = filter ? this.findAllByField(collection, filter.field, filter.value) : this.getAll(collection);
        if (data.length === 0) return 0;
        const sum = data.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
        return sum / data.length;
    }
};

// ============================================
// INITIALIZE DATABASE
// ============================================

function initDatabase() {
    // Check if already initialized
    if (localStorage.getItem('initiated') === 'true') {
        return;
    }

    // ----- CREATE ADMIN ACCOUNT -----
    const admin = {
        id: 'USR-0001',
        username: 'admin',
        email: 'admin@gamesphere.com',
        password: 'admin123',
        fullName: 'System Administrator',
        role: 'admin',
        balance: 0,
        membershipPaid: 'yes',
        membershipType: 'full',
        registrationDate: new Date().toISOString(),
        isBanned: 'no',
        violationCount: 0,
        referralCode: 'ADMIN001',
        totalReferrals: 0,
        points: 0,
        withdrawalCount: 0
    };

    // ----- SAVE ADMIN -----
    DB.insert('users', admin);

    // ----- CREATE DEFAULT ANNOUNCEMENTS -----
    const announcements = [
        {
            id: 'AN-0001',
            title: '🎉 Welcome to Game Sphere Network!',
            content: 'Welcome to the Game Sphere Network! Our platform officially launched on June 14, 2026. We are excited to have you on board!',
            dateCreated: new Date().toISOString(),
            priority: 1
        },
        {
            id: 'AN-0002',
            title: '📅 Birthday Promo Extended!',
            content: 'Our Birthday Promo fee of ₱150 is extended until August 20, 2026. Grab this opportunity to join at a discounted rate!',
            dateCreated: new Date().toISOString(),
            priority: 1
        },
        {
            id: 'AN-0003',
            title: '📢 Withdrawal Schedule Reminder',
            content: 'Withdrawal requests are accepted Wednesday to Friday. Approved list drops on Saturday. Release on Sunday 5PM-8PM.',
            dateCreated: new Date().toISOString(),
            priority: 2
        },
        {
            id: 'AN-0004',
            title: '📋 Membership Fee',
            content: 'Membership fee: ₱200. Open downpayment: ₱100. Settle your remaining balance before your first withdrawal.',
            dateCreated: new Date().toISOString(),
            priority: 2
        },
        {
            id: 'AN-0005',
            title: '⚠️ Violation Rules',
            content: 'Sending emojis, voice messages, or text messages to the bot will require a ₱25 repayment. Unreported violations require ₱100 repayment.',
            dateCreated: new Date().toISOString(),
            priority: 3
        }
    ];

    announcements.forEach(ann => DB.insert('announcements', ann));

    // ----- CREATE SAMPLE USER (Optional) -----
    const sampleUser = {
        id: 'USR-0002',
        username: 'demo_member',
        email: 'demo@gamesphere.com',
        password: 'demopass',
        fullName: 'Demo Member',
        role: 'member',
        balance: 150,
        membershipPaid: 'yes',
        membershipType: 'full',
        registrationDate: new Date().toISOString(),
        isBanned: 'no',
        violationCount: 0,
        referralCode: 'DEMO001',
        totalReferrals: 2,
        points: 250,
        withdrawalCount: 0
    };

    DB.insert('users', sampleUser);

    // ----- CREATE SAMPLE WITHDRAWAL -----
    const sampleWithdrawal = {
        id: 'WD-0001',
        idUser: 'USR-0002',
        username: 'demo_member',
        amount: 200,
        pointsUsed: 500,
        status: 'pending',
        requestDate: new Date().toISOString(),
        releaseDate: '',
        weekNumber: 28,
        formSubmitted: 'no'
    };

    DB.insert('withdrawals', sampleWithdrawal);

    // ----- SET GSN RATE -----
    localStorage.setItem('gsnRate', '1');

    // ----- SET PROMO DATES -----
    localStorage.setItem('promoStart', '2026-07-11');
    localStorage.setItem('promoEnd', '2026-08-20');

    // ----- MARK AS INITIALIZED -----
    localStorage.setItem('initiated', 'true');

    console.log('✅ Database initialized successfully!');
    console.log('📊 Admin Account: admin@gamesphere.com / admin123');
    console.log('👤 Demo Account: demo@gamesphere.com / demopass');
}

// ============================================
// AUTO-INITIALIZE
// ============================================

// Run initialization when loaded
initDatabase();

// ============================================
// EXPORT FUNCTIONS FOR OTHER SCRIPTS
// ============================================

// Make DB available globally
window.DB = DB;

// ============================================
// HELPER FUNCTIONS
// ============================================

// ----- GET CURRENT USER -----
function getCurrentUser() {
    try {
        const data = localStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error getting current user:', e);
        return null;
    }
}

// ----- SET CURRENT USER -----
function setCurrentUser(user) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    } catch (e) {
        console.error('Error setting current user:', e);
        return false;
    }
}

// ----- CLEAR CURRENT USER -----
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

// ----- IS ADMIN? -----
function isAdmin(user) {
    return user && user.role === 'admin';
}

// ----- IS MEMBER? -----
function isMember(user) {
    return user && user.role === 'member';
}

// ----- IS BANNED? -----
function isBanned(user) {
    return user && user.isBanned === 'yes';
}

// ----- HAS MEMBERSHIP? -----
function hasMembership(user) {
    return user && user.membershipPaid === 'yes';
}

// ----- CAN CLICK? -----
function canClick(user) {
    if (!user) return false;
    if (isBanned(user)) return false;
    if (!hasMembership(user)) return false;
    if (user.withdrawalCount > 0) return false;
    return true;
}

// ----- CAN WITHDRAW? -----
function canWithdraw(user) {
    if (!user) return false;
    if (isBanned(user)) return false;
    if (!hasMembership(user)) return false;
    if (user.points < 500) return false;
    if (user.withdrawalCount > 0) return false;
    return true;
}

// ----- GET WITHDRAWAL AMOUNT -----
function getWithdrawalAmount(points, referrals) {
    if (points < 500) return 0;
    if (points >= 1000 && referrals >= 1) return 500;
    return 200;
}

// ----- IS BIRTHDAY PROMO ACTIVE? -----
function isBirthdayPromoActive() {
    const today = new Date();
    const start = new Date(localStorage.getItem('promoStart') || '2026-07-11');
    const end = new Date(localStorage.getItem('promoEnd') || '2026-08-20');
    return today >= start && today <= end;
}

// ----- GET MEMBERSHIP FEE -----
function getMembershipFee() {
    return isBirthdayPromoActive() ? 150 : 200;
}

// ----- GET WEEK NUMBER -----
function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now - start) / 86400000;
    return Math.ceil((diff + start.getDay() + 1) / 7);
}

// ----- FORMAT DATE -----
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ----- GENERATE REFERRAL CODE -----
function generateReferralCode(username) {
    const prefix = username.substring(0, 3).toUpperCase();
    const random = Math.floor(100 + Math.random() * 900);
    return prefix + random;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validateUsername(username) {
    return username && username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

function validateFullName(name) {
    return name && name.trim().length >= 2;
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

function createTransaction(userId, type, amount, description) {
    const transaction = {
        idUser: userId,
        type: type, // 'click', 'referral', 'withdrawal', 'penalty', 'membership'
        amount: amount,
        description: description || '',
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    return DB.insert('transactions', transaction);
}

function logViolation(userId, violationType, penalty) {
    const violation = {
        idUser: userId,
        violationType: violationType,
        penalty: penalty,
        timestamp: new Date().toISOString(),
        status: 'unpaid'
    };
    return DB.insert('violations', violation);
}

// ============================================
// EXPOSE HELPER FUNCTIONS
// ============================================

window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.clearCurrentUser = clearCurrentUser;
window.isAdmin = isAdmin;
window.isMember = isMember;
window.isBanned = isBanned;
window.hasMembership = hasMembership;
window.canClick = canClick;
window.canWithdraw = canWithdraw;
window.getWithdrawalAmount = getWithdrawalAmount;
window.isBirthdayPromoActive = isBirthdayPromoActive;
window.getMembershipFee = getMembershipFee;
window.getWeekNumber = getWeekNumber;
window.formatDate = formatDate;
window.generateReferralCode = generateReferralCode;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.validateUsername = validateUsername;
window.validateFullName = validateFullName;
window.createTransaction = createTransaction;
window.logViolation = logViolation;

console.log('✅ Database.js loaded successfully!');
console.log('📊 Ready to use!');