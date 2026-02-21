/* ═══════════════════════════════════════
   app.js — Dapur AI
   Berisi: tag input, API call ke Claude,
           render resep, dan modal handler
═══════════════════════════════════════ */

// ─── State Global ───
let ingredients = [];
let currentRecipes = [];

// ─── Referensi DOM ───
const input = document.getElementById('ingredientInput');
const wrap  = document.getElementById('tagWrap');

// ════════════════════════════════════════
// TAG INPUT — Tambah / hapus bahan
// ════════════════════════════════════════

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addIngredient(input.value);
  } else if (e.key === 'Backspace' && input.value === '' && ingredients.length) {
    removeIngredient(ingredients.length - 1);
  }
});

// Tambah saat input kehilangan fokus
input.addEventListener('blur', () => {
  if (input.value.trim()) addIngredient(input.value);
});

/**
 * Menambahkan bahan baru ke daftar.
 * @param {string} val - Nilai input dari pengguna
 */
function addIngredient(val) {
  const clean = val.replace(/,/g, '').trim();
  if (!clean) return;

  const lower = clean.toLowerCase();
  const sudahAda = ingredients.some(i => i.toLowerCase() === lower);
  if (sudahAda) {
    input.value = '';
    return;
  }

  ingredients.push(clean);
  renderTags();
  input.value = '';
}

/**
 * Menambahkan bahan dari tombol saran cepat.
 * @param {string} val - Nama bahan
 */
function addSuggestion(val) {
  addIngredient(val);
  input.focus();
}

/**
 * Menghapus bahan berdasarkan index.
 * @param {number} idx - Index bahan dalam array
 */
function removeIngredient(idx) {
  ingredients.splice(idx, 1);
  renderTags();
}

/**
 * Me-render ulang semua tag bahan di dalam input wrap.
 */
function renderTags() {
  wrap.querySelectorAll('.ingredient-tag').forEach(el => el.remove());

  ingredients.forEach((ing, i) => {
    const tag = document.createElement('div');
    tag.className = 'ingredient-tag';
    tag.innerHTML = `${ing} <button onclick="removeIngredient(${i})">✕</button>`;
    wrap.insertBefore(tag, input);
  });
}

// ════════════════════════════════════════
// API — Ambil rekomendasi resep dari Claude
// ════════════════════════════════════════

/**
 * Membangun prompt untuk dikirim ke Claude AI.
 * @param {string} cuisine - Jenis masakan
 * @param {string} difficulty - Tingkat kesulitan
 * @param {string} count - Jumlah resep
 * @returns {string} Prompt lengkap
 */
function buildPrompt(cuisine, difficulty, count) {
  return `Kamu adalah chef berpengalaman dan ahli masakan ${cuisine}.

Pengguna memiliki bahan-bahan berikut: ${ingredients.join(', ')}.
Tingkat kesulitan yang diinginkan: ${difficulty}.
Berikan tepat ${count} rekomendasi resep.

PENTING: Jawab HANYA dengan JSON valid, tidak ada teks lain di luar JSON.

Format JSON yang harus dikembalikan:
{
  "recipes": [
    {
      "name": "Nama Resep",
      "emoji": "emoji yang relevan (1 karakter)",
      "description": "Deskripsi singkat 1-2 kalimat yang menggugah selera",
      "difficulty": "Mudah/Sedang/Sulit",
      "time": "XX menit",
      "servings": "X porsi",
      "match_percent": angka 60-100,
      "ingredients_needed": ["bahan 1 + takaran", "bahan 2 + takaran"],
      "ingredients_owned": ["bahan dari daftar user yang dipakai"],
      "steps": ["langkah 1", "langkah 2", "dst sampai selesai, minimal 10 langkah detail, lengkap dan dapat dipahami pengguna"],
      "tip": "Tips memasak atau variasi yang berguna"
    }
  ]
}

Pastikan:
- recipes adalah array dengan tepat ${count} item
- emoji relevan dengan masakan (contoh: 🍜 untuk mie, 🍗 untuk ayam goreng, dll)
- ingredients_owned hanya berisi bahan yang ADA di daftar bahan user
- steps berisi langkah detail ,lengkap dan praktis
- Resep sesuai tradisi masakan ${cuisine}`;
}

/**
 * Entry point utama: validasi input, panggil API, tampilkan hasil.
 */
async function getRecipes() {
  if (ingredients.length === 0) {
    alert('Tambahkan minimal 1 bahan dulu ya!');
    return;
  }

  const btn        = document.getElementById('btnCari');
  const output     = document.getElementById('output');
  const difficulty = document.getElementById('difficulty').value;
  const cuisine    = document.getElementById('cuisine').value;
  const count      = document.getElementById('count').value;

  // Set state loading
  btn.disabled = true;
  btn.innerHTML = '<span style="animation:pulse 1s infinite;display:inline-block">🍳</span> Sedang meracik...';
  output.innerHTML = `
    <div class="loading">
      <span class="loading-icon">✨</span>
      <p>AI sedang mencarikan resep terbaik untukmu…</p>
    </div>
  `;

  try {
    // Kirim ke backend lokal 
    const res = await fetch('https://akbarnasa-recipes-generator.hf.space/api/resep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: buildPrompt(cuisine, difficulty, count) })
    });

    const data   = await res.json();
    if (data.error) throw new Error(data.error);

    const clean  = data.result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    currentRecipes = parsed.recipes;
    renderRecipes(currentRecipes);

  } catch (err) {
    output.innerHTML = `
      <div class="error-box">
        <span class="icon">😕</span>
        <p>Oops! Gagal mendapatkan rekomendasi. Pastikan koneksi internet kamu aktif dan coba lagi.</p>
        <p style="margin-top:0.5rem;font-size:0.78rem;color:#a07850">${err.message}</p>
      </div>
    `;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>🔍</span> Carikan Resep';
  }
}

// ════════════════════════════════════════
// RENDER — Tampilkan kartu resep
// ════════════════════════════════════════

/**
 * Render daftar kartu resep ke dalam #output.
 * @param {Array} recipes - Array objek resep dari API
 */
function renderRecipes(recipes) {
  const output = document.getElementById('output');

  output.innerHTML = `
    <div class="results-header">
      🍽️ Rekomendasi Resep
      <span class="results-count">${recipes.length} resep ditemukan</span>
    </div>
    <div class="recipe-grid" id="recipeGrid"></div>
  `;

  const grid = document.getElementById('recipeGrid');

  recipes.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.style.animationDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="recipe-card-top">
        <span class="recipe-emoji">${r.emoji || '🍽️'}</span>
        <div class="recipe-name">${r.name}</div>
        <div class="recipe-desc">${r.description}</div>
      </div>
      <div class="recipe-card-footer">
        <span class="recipe-meta">⏱ ${r.time}</span>
        <span class="recipe-meta">👥 ${r.servings}</span>
        <span class="badge-match">✓ ${r.match_percent}% cocok</span>
      </div>
    `;
    card.onclick = () => showModal(i);
    grid.appendChild(card);
  });
}

// ════════════════════════════════════════
// MODAL — Detail resep lengkap
// ════════════════════════════════════════

/**
 * Menampilkan modal detail untuk resep tertentu.
 * @param {number} idx - Index resep di currentRecipes
 */
function showModal(idx) {
  const r = currentRecipes[idx];

  // Isi header modal
  document.getElementById('mEmoji').textContent = r.emoji || '🍽️';
  document.getElementById('mTitle').textContent = r.name;
  document.getElementById('mMeta').innerHTML = `
    <span class="modal-meta-item">⏱ ${r.time}</span>
    <span class="modal-meta-item">👥 ${r.servings}</span>
    <span class="modal-meta-item">📊 ${r.difficulty}</span>
  `;

  // Tandai bahan yang sudah dimiliki user
  const allIngredients = [...(r.ingredients_needed || [])];
  const owned = new Set((r.ingredients_owned || []).map(i => i.toLowerCase()));

  const ingrHTML = allIngredients.map(ing => {
    const isOwned = [...owned].some(o =>
      ing.toLowerCase().includes(o) || o.includes(ing.toLowerCase().split(' ')[0])
    );
    return `<div class="ingr-item ${isOwned ? 'owned' : ''}">${ing}</div>`;
  }).join('');

  // Render langkah-langkah
  const stepsHTML = (r.steps || []).map((s, i) =>
    `<li class="step-item">
      <span class="step-num">${i + 1}</span>
      <span class="step-text">${s}</span>
    </li>`
  ).join('');

  // Buat link YouTube search berdasarkan nama resep
  const ytQuery = encodeURIComponent('resep ' + r.name);
  const ytUrl   = 'https://www.youtube.com/results?search_query=' + ytQuery;

  document.getElementById('mBody').innerHTML = `
    <div class="section-title">🛒 Bahan-bahan</div>
    <div class="ingredients-grid">${ingrHTML}</div>
    <div class="section-title">👨‍🍳 Cara Memasak</div>
    <ol class="steps-list">${stepsHTML}</ol>
    ${r.tip ? `<div class="tip-section"><span class="tip-label">💡 Tips Chef</span>${r.tip}</div>` : ''}
    <a href="${ytUrl}" target="_blank" class="btn-youtube">▶ Tonton Tutorial di YouTube</a>
  `;

  // Tampilkan overlay
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

/**
 * Menutup modal.
 */
function hideModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

/**
 * Menutup modal jika user klik di luar area modal.
 * @param {MouseEvent} e
 */
function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) hideModal();
}

// Tutup modal dengan tombol Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideModal();
});