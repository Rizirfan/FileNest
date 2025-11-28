const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4002';

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(email, password) {
  const res = await fetch(API_BASE + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(API_BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function getData(token) {
  const res = await fetch(API_BASE + '/api/data', {
    headers: {
      ...authHeader(token)
    }
  });
  return res.json();
}

export async function createFolderApi(token, name, parentId) {
  const res = await fetch(API_BASE + '/api/folders', {
    method: 'POST',
    headers: {
      ...authHeader(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, parentId })
  });
  return res.json();
}

export async function deleteFolderApi(token, id) {
  const res = await fetch(API_BASE + '/api/folders/' + id, {
    method: 'DELETE',
    headers: { ...authHeader(token) }
  });
  return res.json();
}

export async function renameFolderApi(token, id, name) {
  const res = await fetch(API_BASE + '/api/folders/' + id, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}

export async function uploadFileApi(token, file, folderId) {
  const form = new FormData();
  form.append('file', file);
  if (folderId) form.append('folderId', folderId);
  const res = await fetch(API_BASE + '/api/files', {
    method: 'POST',
    headers: { ...authHeader(token) },
    body: form
  });
  return res.json();
}

export function getDownloadUrl(id) {
  return API_BASE + '/api/files/' + id + '/download';
}

export function getPreviewUrl(id) {
  return API_BASE + '/api/files/' + id + '/preview';
}

export async function deleteFileApi(token, id) {
  const res = await fetch(API_BASE + '/api/files/' + id, {
    method: 'DELETE',
    headers: { ...authHeader(token) }
  });
  return res.json();
}

export async function toggleStarApi(token, id) {
  const res = await fetch(API_BASE + '/api/files/' + id + '/star', {
    method: 'PUT',
    headers: { ...authHeader(token) }
  });
  return res.json();
}

export async function renameFileApi(token, id, name) {
  const res = await fetch(API_BASE + '/api/files/' + id, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}
