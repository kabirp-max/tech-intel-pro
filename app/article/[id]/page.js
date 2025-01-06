'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Link from 'next/link';
import { FiEdit, FiSave, FiEye, FiUser } from 'react-icons/fi';
import { AiOutlineFieldNumber } from 'react-icons/ai';
import { MdOutlineCancel } from 'react-icons/md';

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

    const logVisitor = async () => {
      try {
        const response = await fetch('/api/get-ip');
        const { ip } = await response.json();

        if (ip) {
          const { data, error } = await supabase
            .from('ArticleVisits')
            .select('ip_address')
            .eq('article_id', id)
            .eq('ip_address', ip)
            .single();

          if (error || !data) {
            await supabase.from('ArticleVisits').insert({ article_id: id, ip_address: ip });
          }
        }
      } catch (error) {
        console.error('Error logging visitor:', error);
      }
    };
    const fetchVisitorCount = async () => {
      try {
        const { data, error } = await supabase
          .from('ArticleVisits')
          .select('ip_address')
          .eq('article_id', id);
    
        if (error) {
          console.error('Error fetching visitor data:', error);
          return;
        }
    
        // Filter unique IP addresses using a Set
        const uniqueIPs = new Set(data.map((entry) => entry.ip_address));
        setVisitorCount(uniqueIPs.size); // Set the visitor count to the size of the Set
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };
    

    fetchArticle();
    logVisitor();
    fetchVisitorCount();
  }, [id]);

  const handleSave = async () => {
    const { title, content, image, author, tags } = formData;
    const { error } = await supabase
      .from('Articles')
      .update({ title, content, image, author, tags })
      .eq('id', id);

    if (!error) {
      setEditMode(false);
      const { data } = await supabase.from('Articles').select('*').eq('id', id).single();
      setArticle(data);
    }
  };

  if (loading) {
    return <p style={styles.loading}>Loading...</p>;
  }

  if (!article) return <p>Article not found!</p>;

  return (
    <div>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>Tech Intel Pro</div>
        <div style={styles.navLinks}>
          <Link href="/" style={styles.navLink}>
            Home
          </Link>
          <Link href="/dashboard" style={styles.navLink}>
            Dashboard
          </Link>
        </div>
        <div style={styles.userInfo}>
          {/* {user ? (
            <>
              <BsPersonCircle size={24} style={styles.userIcon} />
              <span style={styles.userName}>{user.name}</span>
              <button onClick={signOut} style={styles.signOutButton}>
                <FiLogOut /> Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} style={styles.signInButton}>
              Sign In
            </button>
          )} */}
        </div>
      </nav>
    <div style={styles.container}>
      {/* Navbar */}
      
      <div style={styles.article}>
        {!editMode ? (
          <>
            <h1 style={styles.title}>
              <AiOutlineFieldNumber size={24} style={styles.icon} />
              {article.title}
            </h1>
            <img
              src={article.image || '/placeholder.jpg'}
              alt={article.title}
              style={styles.image}
            />
            <p style={styles.content}>{article.content}</p>
            <div style={styles.meta}>
              <p style={styles.metaItem}>
                <FiUser size={18} style={styles.icon} />
                {article.author || 'Unknown'}
              </p>
              <p style={styles.metaItem}>
                <FiEye size={18} style={styles.icon} />
                Unique Visitors: {visitorCount}
              </p>
            </div>
            <button
              onClick={() => setEditMode(true)}
              style={{ ...styles.button, ...styles.editButton }}
            >
              <FiEdit style={styles.buttonIcon} />
              Edit Article
            </button>
          </>
        ) : (
          <form style={styles.editForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                style={styles.textarea}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={handleSave}
                style={{ ...styles.button, ...styles.saveButton }}
              >
                <FiSave style={styles.buttonIcon} />
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                style={{ ...styles.button, ...styles.cancelButton }}
              >
                <MdOutlineCancel style={styles.buttonIcon} />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  article: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
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
  },
  metaItem: {
    fontSize: '14px',
    color: '#666',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  editButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#28a745',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
  },
  editForm: {
    marginTop: '20px',
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
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    height: '100px',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonIcon: {
    marginRight: '5px',
  },
  icon: {
    marginRight: '10px',
    color: '#555',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
    color: '#555',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '10px 20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userIcon: {
    color: '#fff',
  },
  userName: {
    color: '#fff',
    textTransform: 'capitalize',
  },
  signOutButton: {
    backgroundColor: '#ff4d4f',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
  },
  signInButton: {
    backgroundColor: '#0070f3',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
  },
};
