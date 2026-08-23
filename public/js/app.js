document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  
  const kpiIncome = document.getElementById('kpi-income');
  const kpiExpense = document.getElementById('kpi-expense');
  const kpiBalance = document.getElementById('kpi-balance');
  const kpiSavings = document.getElementById('kpi-savings');

  const transactionsList = document.getElementById('transactions-list');

  const filterType = document.getElementById('filter-type');
  const filterCategory = document.getElementById('filter-category');
  const searchInput = document.getElementById('search-input');

  const btnExport = document.getElementById('btn-export');
  
  // Transaction Modal Elements
  const txModal = document.getElementById('tx-modal');
  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const txForm = document.getElementById('tx-form');
  const txDateInput = document.getElementById('tx-date');

  // Charts references
  let categoryChartInstance = null;

  // Set default date picker to today
  if (txDateInput) {
    txDateInput.value = new Date().toISOString().split('T')[0];
  }

  console.log('🚀 [App Init] Cloud Finance Dashboard JS loaded & event listeners attached.');

  // --- Sidebar View Tab Switching ---
  const navDashboard = document.getElementById('nav-dashboard');
  const navTransactions = document.getElementById('nav-transactions');

  const pageHeading = document.getElementById('page-heading');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewTransactions = document.getElementById('view-transactions');

  if (navDashboard) {
    navDashboard.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(viewDashboard, navDashboard, 'Financial Overview');
    });
  }

  if (navTransactions) {
    navTransactions.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(viewTransactions, navTransactions, 'Transaction History');
    });
  }

  function switchTab(targetView, activeNav, titleText) {
    console.log(`🔄 [Navigation] Switching view to: ${titleText}`);
    
    // Hide all views
    [viewDashboard, viewTransactions].forEach(v => {
      if (v) v.classList.remove('active');
    });

    // Show target view
    if (targetView) targetView.classList.add('active');

    // Update active nav button
    [navDashboard, navTransactions].forEach(el => {
      if (el) el.classList.remove('active');
    });
    if (activeNav) activeNav.classList.add('active');

    // Update heading
    if (pageHeading && titleText) pageHeading.innerText = titleText;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Initial Data Load & Health Check ---
  checkHealth();
  loadSummary();
  loadTransactions();

  // Poll server health every 15 seconds
  setInterval(checkHealth, 15000);

  // --- API Handlers ---
  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.status === 'online') {
        statusDot.className = 'status-indicator online';
        if (data.dbStatus === 'connected') {
          statusText.innerText = 'MongoDB Cloud Connected';
        } else {
          statusText.innerText = 'Online (No Database)';
        }
      }
    } catch (e) {
      statusDot.className = 'status-indicator';
      statusText.innerText = 'Server Offline';
    }
  }

  async function loadSummary() {
    try {
      const res = await fetch('/api/transactions/summary');
      const json = await res.json();
      if (!json.success) return;

      const summary = json.data;
      kpiIncome.innerText = formatCurrency(summary.totalIncome);
      kpiExpense.innerText = formatCurrency(summary.totalExpense);
      kpiBalance.innerText = formatCurrency(summary.netBalance);
      kpiSavings.innerText = `${summary.savingsRate}%`;

      // Color coding net balance
      if (summary.netBalance >= 0) {
        kpiBalance.style.color = 'var(--accent-success)';
      } else {
        kpiBalance.style.color = 'var(--accent-danger)';
      }

      renderCategoryChart(summary.categoryBreakdown);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  }

  async function loadTransactions() {
    try {
      const type = filterType.value;
      const category = filterCategory.value;
      const search = searchInput.value.trim();

      const params = new URLSearchParams();
      if (type !== 'all') params.append('type', type);
      if (category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        renderTransactionsTable(json.data);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  }

  // --- Render Functions ---
  function renderTransactionsTable(transactions) {
    if (!transactions || transactions.length === 0) {
      transactionsList.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 32px; color: var(--text-dim);">
            <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 8px;"></i>
            <p>No transactions found matching your filters.</p>
          </td>
        </tr>
      `;
      return;
    }

    transactionsList.innerHTML = transactions.map(t => {
      const isExpense = t.type === 'expense';
      const formattedDate = new Date(t.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `
        <tr>
          <td>
            <div class="tx-title-box">
              <span class="tx-title">${escapeHtml(t.title)}</span>
              ${t.notes ? `<span class="tx-notes">${escapeHtml(t.notes)}</span>` : ''}
            </div>
          </td>
          <td><span class="tag" style="background: rgba(255,255,255,0.06); color: var(--text-main);">${escapeHtml(t.category)}</span></td>
          <td>${formattedDate}</td>
          <td>
            <span class="tag ${isExpense ? 'tag-expense' : 'tag-income'}">
              ${isExpense ? 'Expense' : 'Income'}
            </span>
          </td>
          <td class="text-right ${isExpense ? 'amount-expense' : 'amount-income'}">
            ${isExpense ? '-' : '+'}${formatCurrency(t.amount)}
          </td>
          <td class="text-center">
            <button class="btn-delete" data-id="${t._id}" title="Delete Transaction">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach click listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this transaction?')) {
          await deleteTransaction(id);
        }
      });
    });
  }

  // --- Chart.js Rendering ---
  function renderCategoryChart(categoryBreakdown) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    const labels = Object.keys(categoryBreakdown || {});
    const data = Object.values(categoryBreakdown || {});

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    if (labels.length === 0) {
      labels.push('No Expense Data');
      data.push(1);
    }

    categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
            '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12 } }
          }
        },
        cutout: '70%'
      }
    });
  }

  // --- Transaction Actions ---
  async function deleteTransaction(id) {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Transaction deleted successfully');
        loadSummary();
        loadTransactions();
      }
    } catch (err) {
      showToast('Error deleting transaction', true);
    }
  }

  txForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById('tx-title').value.trim(),
      amount: parseFloat(document.getElementById('tx-amount').value),
      type: document.getElementById('tx-type').value,
      category: document.getElementById('tx-category').value,
      date: document.getElementById('tx-date').value,
      notes: document.getElementById('tx-notes').value.trim()
    };

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        showToast('Transaction added successfully!');
        closeTxModal();
        txForm.reset();
        txDateInput.value = new Date().toISOString().split('T')[0];
        
        loadSummary();
        loadTransactions();
      } else {
        showToast(json.error || 'Failed to create transaction', true);
      }
    } catch (err) {
      showToast('Server connection error', true);
    }
  });

  // --- Filtering & Search Listeners ---
  filterType.addEventListener('change', loadTransactions);
  filterCategory.addEventListener('change', loadTransactions);
  
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadTransactions, 300);
  });

  // --- CSV Export ---
  btnExport.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/transactions');
      const json = await res.json();
      if (!json.success || !json.data.length) {
        showToast('No transactions to export', true);
        return;
      }

      let csv = 'Title,Type,Category,Amount,Date,Notes\n';
      json.data.forEach(t => {
        csv += `"${t.title}","${t.type}","${t.category}",${t.amount},"${t.date}","${t.notes || ''}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `cloud_finance_export_${Date.now()}.csv`);
      a.click();
      showToast('Exported CSV file');
    } catch (err) {
      showToast('Export failed', true);
    }
  });

  // --- Modal Logic ---
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => {
      console.log('👉 [UI Event] "Add Transaction" button clicked.');
      if (txForm) txForm.reset();
      if (txDateInput) txDateInput.value = new Date().toISOString().split('T')[0];
      txModal.classList.add('active');
      txModal.style.display = 'flex';
      console.log('✅ [UI Event] Add Transaction modal opened.');
    });
  } else {
    console.error('❌ [Error] btnOpenModal element not found in DOM!');
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeTxModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeTxModal);

  // Close modals on clicking backdrop overlay
  window.addEventListener('click', (e) => {
    if (e.target === txModal) closeTxModal();
  });

  function closeTxModal() {
    console.log('ℹ️ [UI Event] Closing Transaction modal.');
    txModal.classList.remove('active');
    txModal.style.display = 'none';
  }

  // --- Utility Helpers ---
  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  }

  // Escape HTML helper
  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (isError) toast.style.borderColor = 'var(--accent-danger)';
    toast.innerHTML = `
      <i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}" style="color: ${isError ? 'var(--accent-danger)' : 'var(--accent-success)'}"></i>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }
});
