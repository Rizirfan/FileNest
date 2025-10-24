let certificates = [];
let editingCertificateId = null;

// DOM Elements
const certificatesContainer = document.getElementById('certificatesContainer');
const certificateModal = document.getElementById('certificateModal');
const certificateForm = document.getElementById('certificateForm');
const addCertBtn = document.getElementById('addCertBtn');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');

// Load Certificates
const loadCertificates = async () => {
  try {
    certificatesContainer.innerHTML = '<div class="loading">Loading certificates...</div>';
    certificates = await app.apiRequest('/certificates');
    renderCertificates();
  } catch (error) {
    certificatesContainer.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
  }
};

// Render Certificates
const renderCertificates = () => {
  if (certificates.length === 0) {
    certificatesContainer.innerHTML = `
      <div class="empty-state">
        <h3>No certificates yet</h3>
        <p>Start by adding your first certificate!</p>
      </div>
    `;
    return;
  }

  certificatesContainer.innerHTML = `
    <div class="certificates-grid">
      ${certificates.map(cert => `
        <div class="certificate-card">
          <h3>${cert.title}</h3>
          <p><strong>Issuer:</strong> ${cert.issuer}</p>
          <p><strong>Date:</strong> ${new Date(cert.issue_date).toLocaleDateString()}</p>
          ${cert.description ? `<p>${cert.description}</p>` : ''}
          <span class="certificate-category">${cert.category || 'Other'}</span>
          <div class="certificate-actions">
            ${cert.file_path ? `<a href="${app.API_URL.replace('/api', '')}/${cert.file_path}" target="_blank" class="btn btn-secondary btn-small">View File</a>` : ''}
            <button class="btn btn-secondary btn-small" onclick="editCertificate(${cert.id})">Edit</button>
            <button class="btn btn-danger btn-small" onclick="deleteCertificate(${cert.id})">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// Open Modal
const openModal = (isEdit = false) => {
  certificateModal.classList.add('active');
  modalTitle.textContent = isEdit ? 'Edit Certificate' : 'Add Certificate';
  editingCertificateId = isEdit ? editingCertificateId : null;
};

// Close Modal
const closeModalHandler = () => {
  certificateModal.classList.remove('active');
  certificateForm.reset();
  editingCertificateId = null;
};

// Add Certificate
addCertBtn.addEventListener('click', () => {
  certificateForm.reset();
  openModal(false);
});

closeModal.addEventListener('click', closeModalHandler);

certificateModal.addEventListener('click', (e) => {
  if (e.target === certificateModal) {
    closeModalHandler();
  }
});

// Submit Form
certificateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('issuer', document.getElementById('issuer').value);
  formData.append('issue_date', document.getElementById('issue_date').value);
  formData.append('category', document.getElementById('category').value);
  formData.append('description', document.getElementById('description').value);

  const fileInput = document.getElementById('file');
  if (fileInput.files[0]) {
    formData.append('file', fileInput.files[0]);
  }

  try {
    const endpoint = editingCertificateId
      ? `/certificates/${editingCertificateId}`
      : '/certificates';
    const method = editingCertificateId ? 'PUT' : 'POST';

    await app.apiRequest(endpoint, {
      method,
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    app.showAlert(`Certificate ${editingCertificateId ? 'updated' : 'added'} successfully!`, 'success');
    closeModalHandler();
    loadCertificates();
  } catch (error) {
    app.showAlert(error.message, 'error');
  }
});

// Edit Certificate
window.editCertificate = async (id) => {
  try {
    const certificate = certificates.find(c => c.id === id);
    if (!certificate) return;

    editingCertificateId = id;
    document.getElementById('title').value = certificate.title;
    document.getElementById('issuer').value = certificate.issuer;
    document.getElementById('issue_date').value = certificate.issue_date.split('T')[0];
    document.getElementById('category').value = certificate.category || 'Other';
    document.getElementById('description').value = certificate.description || '';

    openModal(true);
  } catch (error) {
    app.showAlert(error.message, 'error');
  }
};

// Delete Certificate
window.deleteCertificate = async (id) => {
  if (!confirm('Are you sure you want to delete this certificate?')) return;

  try {
    await app.apiRequest(`/certificates/${id}`, {
      method: 'DELETE',
    });

    app.showAlert('Certificate deleted successfully!', 'success');
    loadCertificates();
  } catch (error) {
    app.showAlert(error.message, 'error');
  }
};

// Initialize
loadCertificates();