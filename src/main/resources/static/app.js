/* =========================================
   VotePulse — App Logic
   ========================================= */

const API_BASE = '/api/polls';

// ── API Service ──────────────────────────

const api = {
    async getAllPolls() {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('Failed to load polls');
        return res.json();
    },

    async getPoll(id) {
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) throw new Error('Poll not found');
        return res.json();
    },

    async createPoll(question, options) {
        const body = {
            question,
            options: options.map(opt => ({ voteOption: opt, voteCount: 0 }))
        };
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Failed to create poll');
        return res.json();
    },

    async vote(pollId, optionIndex) {
        const res = await fetch(`${API_BASE}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pollId, optionIndex })
        });
        if (!res.ok) throw new Error('Failed to vote');
    }
};

// ── Router ───────────────────────────────

const router = {
    navigate(view, data) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        const target = document.getElementById(`view-${view}`);
        if (target) {
            target.classList.add('active');
            target.style.animation = 'none';
            target.offsetHeight; // trigger reflow
            target.style.animation = '';
        }

        const navBtn = document.getElementById(`nav-${view}`);
        if (navBtn) navBtn.classList.add('active');

        if (view === 'browse') loadPolls();
        if (view === 'detail' && data) loadPollDetail(data);
    }
};

// ── Load Polls ───────────────────────────

async function loadPolls() {
    const grid = document.getElementById('polls-grid');
    const emptyState = document.getElementById('empty-state');

    try {
        const polls = await api.getAllPolls();

        if (polls.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        grid.innerHTML = polls.map(poll => renderPollCard(poll)).join('');
    } catch (err) {
        showToast('Could not load polls', 'error');
    }
}

function renderPollCard(poll) {
    const totalVotes = poll.options.reduce((sum, o) => sum + (o.voteCount || 0), 0);

    const optionsHtml = poll.options.map((opt, idx) => {
        const pct = totalVotes > 0 ? ((opt.voteCount || 0) / totalVotes * 100) : 0;
        return `
            <div class="option-row-card">
                <div class="option-bar-wrapper">
                    <div class="option-label">
                        <span>${escapeHtml(opt.voteOption)}</span>
                        <span class="vote-count">${opt.voteCount || 0}</span>
                    </div>
                    <div class="option-bar">
                        <div class="option-bar-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
                <button class="vote-btn" onclick="handleVote(event, ${poll.id}, ${idx})" title="Vote for this option">
                    Vote
                </button>
            </div>
        `;
    }).join('');

    return `
        <div class="poll-card" onclick="router.navigate('detail', ${poll.id})">
            <h2 class="poll-question">${escapeHtml(poll.question)}</h2>
            <div class="poll-options-preview">
                ${optionsHtml}
            </div>
            <div class="poll-meta">
                <span class="meta-item">📊 ${totalVotes} vote${totalVotes !== 1 ? 's' : ''}</span>
                <span class="meta-item">· ${poll.options.length} option${poll.options.length !== 1 ? 's' : ''}</span>
            </div>
        </div>
    `;
}

// ── Vote Handler ─────────────────────────

async function handleVote(event, pollId, optionIndex) {
    event.stopPropagation();
    const btn = event.target;

    try {
        btn.classList.add('voted');
        btn.textContent = '✓';
        await api.vote(pollId, optionIndex);
        showToast('Vote recorded!', 'success');

        // Refresh after a moment
        setTimeout(() => loadPolls(), 500);
    } catch (err) {
        btn.classList.remove('voted');
        btn.textContent = 'Vote';
        showToast('Failed to vote', 'error');
    }
}

// ── Poll Detail ──────────────────────────

async function loadPollDetail(pollId) {
    const container = document.getElementById('detail-content');

    try {
        const poll = await api.getPoll(pollId);
        const totalVotes = poll.options.reduce((sum, o) => sum + (o.voteCount || 0), 0);

        const optionsHtml = poll.options.map((opt, idx) => {
            const pct = totalVotes > 0 ? ((opt.voteCount || 0) / totalVotes * 100) : 0;
            return `
                <div class="detail-option" onclick="handleDetailVote(${poll.id}, ${idx}, this)">
                    <div class="detail-option-info">
                        <span class="detail-option-name">${escapeHtml(opt.voteOption)}</span>
                        <div class="detail-option-bar">
                            <div class="detail-option-bar-fill" style="width: 0%"
                                 data-target-width="${pct}%"></div>
                        </div>
                    </div>
                    <div class="detail-option-stats">
                        <span class="detail-percent">${pct.toFixed(1)}%</span>
                        <span class="detail-votes">${opt.voteCount || 0} vote${(opt.voteCount || 0) !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <h1 class="detail-question">${escapeHtml(poll.question)}</h1>
            <p class="detail-total">${totalVotes} total vote${totalVotes !== 1 ? 's' : ''} · Click an option to vote</p>
            <div class="detail-options">${optionsHtml}</div>
        `;

        // Animate bars in
        requestAnimationFrame(() => {
            setTimeout(() => {
                container.querySelectorAll('.detail-option-bar-fill').forEach(bar => {
                    bar.style.width = bar.dataset.targetWidth;
                });
            }, 50);
        });

    } catch (err) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Poll not found.</p>';
    }
}

async function handleDetailVote(pollId, optionIndex, element) {
    try {
        await api.vote(pollId, optionIndex);
        showToast('Vote recorded!', 'success');
        loadPollDetail(pollId);
    } catch (err) {
        showToast('Failed to vote', 'error');
    }
}

// ── Create Poll ──────────────────────────

function addOptionInput() {
    const container = document.getElementById('options-container');
    const count = container.children.length + 1;

    const row = document.createElement('div');
    row.className = 'option-row';
    row.innerHTML = `
        <input type="text" class="form-input option-input" placeholder="Option ${count}" required>
        <button type="button" class="remove-option-btn" onclick="removeOption(this)" title="Remove option">×</button>
    `;
    container.appendChild(row);
}

function removeOption(btn) {
    const container = document.getElementById('options-container');
    if (container.children.length > 2) {
        btn.closest('.option-row').remove();
    }
}

async function handleCreatePoll(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    const question = document.getElementById('poll-question').value.trim();
    const optionInputs = document.querySelectorAll('.option-input');
    const options = Array.from(optionInputs).map(i => i.value.trim()).filter(v => v);

    if (!question) {
        showToast('Please enter a question', 'error');
        return false;
    }

    if (options.length < 2) {
        showToast('Add at least 2 options', 'error');
        return false;
    }

    // Loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Creating...';
    btnLoader.classList.remove('hidden');

    try {
        await api.createPoll(question, options);
        showToast('Poll created!', 'success');

        // Reset form
        document.getElementById('create-form').reset();
        const container = document.getElementById('options-container');
        container.innerHTML = `
            <div class="option-row">
                <input type="text" class="form-input option-input" placeholder="Option 1" required>
            </div>
            <div class="option-row">
                <input type="text" class="form-input option-input" placeholder="Option 2" required>
            </div>
        `;

        router.navigate('browse');
    } catch (err) {
        showToast('Failed to create poll', 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Create Poll';
        btnLoader.classList.add('hidden');
    }

    return false;
}

// ── Toast ────────────────────────────────

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// ── Utilities ────────────────────────────

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── Init ─────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    router.navigate('browse');
});
