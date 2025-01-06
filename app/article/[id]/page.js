'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Link from 'next/link';

export default function ArticlePage({ params: paramsPromise }) {
  const params = React.use(paramsPromise); // Unwrap params using React.use()
  const { id } = params;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    author: '',
    tags: '',
  });

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from('Articles')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) {
        setArticle(data);
        setFormData({
          title: data.title || '',
          content: data.content || '',
          image: data.image || '',
          author: data.author || '',
          tags: data.tags || '',
        });
      }
      setLoading(false);
    };

    const logVisit = async () => {
      await fetch('/api/log-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: id }),
      });
    };

    const fetchVisitorCount = async () => {
      const { count, error } = await supabase
        .from('ArticleVisits')
        .select('ip_address', { count: 'exact' })
        .eq('article_id', id);

      if (!error) {
        setVisitorCount(count || 0);
      }
    };

    fetchArticle();
    logVisit();
    fetchVisitorCount();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    const { title, content, image, author, tags } = formData;

    const { error } = await supabase
      .from('Articles')
      .update({ title, content, image, author, tags })
      .eq('id', id);

    if (error) {
      console.error('Error updating article:', error);
    } else {
      setArticle({ ...article, title, content, image, author, tags });
      setEditMode(false);
    }
  };

  if (loading) {
    return <p style={styles.loading}>Loading...</p>;
  }

  if (!article) {
    return <p style={styles.loading}>Article not found!</p>;
  }

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

      {/* Article View */}
      {!editMode ? (
        <div style={styles.article}>
          <h1 style={styles.title}>{article.title}</h1>
          <img
            src={
              article.image ||
              'https://c.ndtvimg.com/2025-01/hm8m7qrg_south-korea-yoon-arrest_625x300_03_January_25.jpeg'
            }
            alt={article.title}
            style={styles.image}
          />
          <p style={styles.content}>{article.content}</p>
          <div style={styles.meta}>
            <p style={styles.author}>By: {article.author || 'Unknown'}</p>
            <p style={styles.date}>
              Published: {new Date(article.created_at).toLocaleDateString()}
            </p>
            <p style={styles.visitors}>
              Unique Visitors: {visitorCount}
            </p>
          </div>
          <button style={styles.editButton} onClick={() => setEditMode(true)}>
            Edit Article
          </button>
        </div>
      ) : (
        // Edit Mode
        <div style={styles.editForm}>
          <h2 style={styles.editTitle}>Edit Article</h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              style={styles.textarea}
            ></textarea>
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
          <div style={styles.formGroup}>
            <label style={styles.label}>Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <button style={styles.saveButton} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    color: '#333',
    padding: 0,
    margin: 0,
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
  article: {
    padding: '20px',
  },
  title: {
    fontSize: '28px',
    marginBottom: '10px',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  content: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#666',
  },
  author: {
    margin: 0,
  },
  date: {
    margin: 0,
  },
  editButton: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0070f3',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  editForm: {
    padding: '20px',
  },
  editTitle: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    height: '100px',
    resize: 'vertical',
  },
  saveButton: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0070f3',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
    color: '#555',
  },
};
