'use client';

import { useState } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';

export default function AddArticlePage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: '',
    image: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('Articles').insert([formData]);
    if (error) {
      console.error('Error adding article:', error);
      setMessage('Error adding article. Please try again.');
    } else {
      setMessage('Article added successfully!');
      setFormData({
        title: '',
        content: '',
        author: '',
        category: '',
        image: '',
      });
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>My Articles</div>
        <div style={styles.navLinks}>
          <Link href="/" style={styles.navLink}>
            Home
          </Link>
          <Link href="/add-article" style={styles.navLink}>
            Add Article
          </Link>
          <Link href="/about-us" style={styles.navLink}>
            About Us
          </Link>
        </div>
      </nav>

      {/* Form */}
      <div style={styles.formContainer}>
        <h1 style={styles.heading}>Add New Article</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              style={styles.textarea}
            ></textarea>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="">Select Category</option>
              <option value="Technology">Technology</option>
              <option value="Health">Health</option>
              <option value="Business">Business</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.submitButton}>
            Add Article
          </button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    color: '#333',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0070f3',
    padding: '10px 20px',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navBrand: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  navLinks: {
    display: 'flex',
    gap: '15px',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
  },
  formContainer: {
    margin: '20px auto',
    maxWidth: '600px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '24px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  textarea: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    height: '100px',
    resize: 'vertical',
  },
  select: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  submitButton: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0070f3',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  message: {
    textAlign: 'center',
    marginTop: '15px',
    color: 'green',
    fontWeight: 'bold',
  },
};
