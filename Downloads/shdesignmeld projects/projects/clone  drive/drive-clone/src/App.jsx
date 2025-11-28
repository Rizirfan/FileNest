import React, { useState, useEffect } from 'react';
import { Upload, Folder, File, Search, Grid, List, Download, Trash2, Edit2, X, Plus, FolderPlus, ChevronRight, Home, Clock, Star } from 'lucide-react';
import { useAuth } from './AuthProvider';
import AuthModal from './AuthModal';
import * as api from './api';

export default function App() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [folderPath, setFolderPath] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewMime, setPreviewMime] = useState(null);
  const [previewText, setPreviewText] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hoveredFile, setHoveredFile] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const { token, user, login, logout, register } = useAuth();

  useEffect(() => {
    if (token) loadData();
    else {
      setFiles([]);
      setFolders([]);
      setLoading(false);
    }
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getData(token);
      if (data && data.folders) setFolders(data.folders);
      if (data && data.files) setFiles(data.files);
    } catch (error) {
      console.log('Failed to load data from server', error);
    }
    setLoading(false);
  };

  // Data saved via API; derived state is updated after each operation

  const handleFileUpload = async (e) => {
    if (!token) return alert('Please login');
    const uploadedFiles = Array.from(e.target.files);
    for (const file of uploadedFiles) {
      try {
        const created = await api.uploadFileApi(token, file, currentFolder);
        setFiles(prev => [...prev, created]);
      } catch (err) {
        console.error('Failed to upload', err);
      }
    }

    // Reset file input value so same file can be re-selected
    e.target.value = '';
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const created = await api.createFolderApi(token, newFolderName, currentFolder);
      setFolders(prev => [...prev, created]);
      setNewFolderName('');
      setShowNewFolderModal(false);
    } catch (err) {
      console.error('Error creating folder', err);
    }
  };

  const deleteItem = async (item, isFolder) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      if (isFolder) {
        await api.deleteFolderApi(token, item.id);
        setFolders(prev => prev.filter(f => f.id !== item.id));
        setFiles(prev => prev.filter(f => f.folder_id !== item.id && f.folderId !== item.id));
      } else {
        await api.deleteFileApi(token, item.id);
        setFiles(prev => prev.filter(f => f.id !== item.id));
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const openPreview = async (file) => {
    if (!token) return alert('Please login');
    try {
      setPreviewFile(file);
      // Fetch blob for preview using preview endpoint
      const res = await fetch(api.getPreviewUrl(file.id), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch preview');
      const blob = await res.blob();
      const mime = res.headers.get('content-type') || file.mime_type || file.type;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewMime(mime);
      if (mime && mime.startsWith('text/')) {
        const text = await blob.text();
        setPreviewText(text);
      } else {
        setPreviewText(null);
      }
    } catch (err) {
      console.error('Preview failed', err);
    }
  };

  const handleMouseEnter = (file) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setHoveredFile(file);
    }, 500); // 500ms delay before showing hover preview
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoveredFile(null);
  };

  useEffect(() => {
    // On successful login (user changes), load data
    if (token) loadData();
  }, [token]);

  const renameItem = async () => {
    if (!renameValue.trim()) return;
    try {
      if (selectedItem.type === 'folder') {
        const updated = await api.renameFolderApi(token, selectedItem.id, renameValue);
        setFolders(prev => prev.map(f => f.id === updated.id ? updated : f));
      } else {
        const updated = await api.renameFileApi(token, selectedItem.id, renameValue);
        setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
      }
    } catch (err) {
      console.error('Rename failed', err);
    }

    setShowRenameModal(false);
    setSelectedItem(null);
  };

  const toggleStar = async (file) => {
    try {
      const updated = await api.toggleStarApi(token, file.id);
      setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
    } catch (err) {
      console.error('Could not toggle star', err);
    }
  };

  const downloadFile = async (file) => {
    try {
      const res = await fetch(api.getDownloadUrl(file.id), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const navigateToFolder = (folderId) => {
    setCurrentFolder(folderId);
    if (folderId === null) {
      setFolderPath([]);
    } else {
      const path = [];
      let currentId = folderId;
      while (currentId !== null) {
        const folder = folders.find(f => f.id === currentId);
        if (folder) {
          path.unshift(folder);
          currentId = folder.parentId;
        } else {
          break;
        }
      }
      setFolderPath(path);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFilteredItems = () => {
    const currentFolders = folders.filter(f => f.parent_id === currentFolder);
    const currentFiles = files.filter(f => f.folder_id === currentFolder);

    if (!searchQuery) {
      return { folders: currentFolders, files: currentFiles };
    }

    const query = searchQuery.toLowerCase();
    return {
      folders: currentFolders.filter(f => f.name.toLowerCase().includes(query)),
      files: currentFiles.filter(f => f.name.toLowerCase().includes(query))
    };
  };

  const { folders: displayFolders, files: displayFiles } = getFilteredItems();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
            <Folder className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-gray-600 font-medium">Loading your drive...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">SkyBox</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search in Drive"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-96 bg-white bg-opacity-90 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:bg-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
          >
            {viewMode === 'grid' ? <List className="w-5 h-5 text-white" /> : <Grid className="w-5 h-5 text-white" />}
          </button>
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">{user.email.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm text-white font-medium">{user.email}</span>
              </div>
              <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200" onClick={() => logout()}>Logout</button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-md" onClick={() => setShowAuthModal(true)}>Login / Sign up</button>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center space-x-2 text-sm">
        <button
          onClick={() => navigateToFolder(null)}
          className="flex items-center hover:bg-gray-100 px-2 py-1 rounded"
        >
          <Home className="w-4 h-4 mr-1" />
          My Drive
        </button>
        {folderPath.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => navigateToFolder(folder.id)}
              className="hover:bg-gray-100 px-2 py-1 rounded"
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white px-6 py-4 flex items-center space-x-3 border-b border-gray-200">
        <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
          <Upload className="w-5 h-5" />
          <span>Upload Files</span>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={() => setShowNewFolderModal(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FolderPlus className="w-5 h-5" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {displayFolders.length === 0 && displayFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Folder className="w-16 h-16 text-blue-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to My Drive</h2>
            <p className="text-lg text-gray-500 mb-4">Your files and folders will appear here</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 cursor-pointer transition-all duration-200 shadow-lg">
                <Upload className="w-5 h-5" />
                <span>Upload Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
              >
                <FolderPlus className="w-5 h-5" />
                <span>Create Folder</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Folders Section */}
            {displayFolders.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">FOLDERS</h3>
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-1'}>
                  {displayFolders.map(folder => (
                    <div
                      key={folder.id}
                      className={viewMode === 'grid' 
                        ? 'border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer group'
                        : 'flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer group'
                      }
                    >
                      <div
                        onClick={() => navigateToFolder(folder.id)}
                        className="flex items-center flex-1"
                      >
                        <Folder className="w-6 h-6 text-blue-500 mr-3" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem({ ...folder, type: 'folder' });
                            setRenameValue(folder.name);
                            setShowRenameModal(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(folder, true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {displayFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">FILES</h3>
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-1'}>
                  {displayFiles.map(file => (
                    <div
                      key={file.id}
                      className={viewMode === 'grid'
                        ? 'border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer group'
                        : 'flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer group'
                      }
                      onMouseEnter={() => handleMouseEnter(file)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div
                        onClick={() => openPreview(file)}
                        className="flex items-center flex-1"
                      >
                        <File className="w-6 h-6 text-gray-500 mr-3" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(file);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Star className={`w-4 h-4 ${file.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(file);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem({ ...file, type: 'file' });
                            setRenameValue(file.name);
                            setShowRenameModal(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(file, false);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Rename</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && renameItem()}
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={renameItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}

      {/* Hover Preview Modal */}
      {hoveredFile && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-40">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm truncate">{hoveredFile.name}</h4>
            <button
              onClick={() => setHoveredFile(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Size: {formatFileSize(hoveredFile.size)}
          </div>
          <button
            onClick={() => {
              openPreview(hoveredFile);
              setHoveredFile(null);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Click to view full preview
          </button>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold truncate" style={{ maxWidth: '80%' }}>{previewFile.name}</h3>
              <button
                onClick={() => {
                  setPreviewFile(null);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setPreviewMime(null);
                    setPreviewText(null);
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {previewMime && previewMime.startsWith('image/') ? (
                <img src={previewUrl} alt={previewFile.name} className="max-w-full" />
              ) : previewMime === 'application/pdf' ? (
                <iframe src={previewUrl} className="w-full h-96" title="PDF Preview" />
              ) : previewText ? (
                <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">{previewText}</pre>
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-96 border border-gray-200 rounded"
                  title={`${previewFile.name} Preview`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
              )}
              <div className="text-center text-gray-500 hidden">
                <p>File preview not supported for this file type.</p>
                <p>You can download the file to view it.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
