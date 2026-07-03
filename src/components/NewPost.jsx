import React, { useState } from 'react';
import { ArrowLeft, UploadCloud, Images } from 'lucide-react';

const FILTERS = [
  { class: 'filter-none', name: 'Normal' },
  { class: 'filter-clarendon', name: 'Clarendon' },
  { class: 'filter-juno', name: 'Juno' },
  { class: 'filter-lark', name: 'Lark' },
  { class: 'filter-crema', name: 'Crema' },
  { class: 'filter-vintage', name: 'Vintage' },
  { class: 'filter-grayscale', name: 'Inkwell' },
  { class: 'filter-sepia', name: 'Sepia' },
  { class: 'filter-dramatic', name: 'Dramatic' }
];

export default function NewPost({ onSubmit, onCancel }) {
  const [images, setImages] = useState([]); // Array of base64 images
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('filter-none');
  const [dragActive, setDragActive] = useState(false);

  const processFiles = (filesList) => {
    const promises = Array.from(filesList).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64Images => {
      setImages(prev => [...prev, ...base64Images].slice(0, 5)); // Max 5 images
      setActivePreviewIdx(0);
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (images.length === 0) return;
    
    // If only 1 image, submit as string for database, else submit array
    const imagePayload = images.length === 1 ? images[0] : images;
    onSubmit(imagePayload, caption, selectedFilter);
  };

  return (
    <div className="new-post-container animate-slide-in">
      <div className="new-post-card">
        {/* Header */}
        <div className="new-post-header">
          <button className="back-btn" onClick={onCancel}>
            <ArrowLeft size={20} />
          </button>
          <h2>Create new post</h2>
          <button 
            className="share-btn" 
            onClick={handleSubmit} 
            disabled={images.length === 0}
          >
            Share
          </button>
        </div>

        {/* Content Body */}
        <div className="new-post-body">
          {/* Left panel: Image drag & drop */}
          <div className="image-upload-panel" style={{position: 'relative'}}>
            {images.length === 0 ? (
              <div 
                className={`drag-area ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <UploadCloud size={48} className="upload-icon" />
                <p>Drag photos here (Max 5 for Carousel)</p>
                <label className="select-btn">
                  Select from computer
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>
            ) : (
              <div className="preview-container">
                <img 
                  src={images[activePreviewIdx]} 
                  alt="Preview" 
                  className={`image-preview ${selectedFilter}`}
                />

                {/* Thumbnail list overlay at the bottom */}
                <div className="upload-multi-previews-list">
                  {images.map((img, idx) => (
                    <div 
                      key={idx}
                      className={`preview-thumbnail-item ${idx === activePreviewIdx ? 'active' : ''}`}
                      onClick={() => setActivePreviewIdx(idx)}
                    >
                      <img src={img} alt="thumb" className="thumbnail-img" />
                    </div>
                  ))}
                  <label className="preview-thumbnail-item" style={{display: 'flex', alignItems:'center', justifyContent:'center', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px dashed white'}}>
                    <Images size={18} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleImageChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Caption and Filters */}
          {images.length > 0 && (
            <div className="settings-panel animate-fade-in">
              {/* Caption field */}
              <div className="caption-section">
                <textarea 
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={1000}
                />
                <span className="char-count">{caption.length}/1000</span>
              </div>

              {/* Instagram Filters list */}
              <div className="filters-section">
                <h3>Select Filter</h3>
                <div className="filters-grid">
                  {FILTERS.map((filter) => (
                    <button 
                      key={filter.class}
                      type="button"
                      className={`filter-btn ${selectedFilter === filter.class ? 'active' : ''}`}
                      onClick={() => setSelectedFilter(filter.class)}
                    >
                      <div className="filter-preview-box">
                        <img 
                          src={images[activePreviewIdx]} 
                          alt={filter.name} 
                          className={`filter-preview-img ${filter.class}`} 
                        />
                      </div>
                      <span className="filter-name">{filter.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
