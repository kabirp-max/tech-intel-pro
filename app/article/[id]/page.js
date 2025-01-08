'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { MdOutlineCancel } from 'react-icons/md';
import { useUser } from '@/app/Context/UserContext';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { FiEdit, FiSave, FiEye, FiUser,FiLogOut } from 'react-icons/fi';

import { v4 as uuidv4 } from 'uuid';
import { BsPersonCircle } from 'react-icons/bs';
import Link from 'next/link';


export default function ArticlePage({ params: paramsPromise }) {
  const params = React.use(paramsPromise); // Unwrap params using React.use()
  const { id } = params;
  const { user } = useUser();
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

  let title = '';

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('Articles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching article:', error);
          return;
        }

        if (data) {
          title = data.title;
          setArticle(data);
          setFormData({
            title: data.title || '',
            content: data.content || '',
            image: data.image || '',
            author: data.author || '',
            tags: data.tags || '',
          });
        } else {
          console.log('No article found with the given ID.');
        }
      } catch (error) {
        console.error('Unexpected error fetching article:', error);
      }
      setLoading(false);
    };

    const trackUserVisit = async () => {
      try {
        const { data, error } = await supabase
          .from('UserArticleVisits')
          .select('*')
          .eq('article_id', id)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user activity:', error);
          return;
        }

        if (data && data.length > 0) {
          const lastVisit = data[0];
          const lastVisitTime = new Date(lastVisit.created_at);
          const currentTime = new Date();
          const timeDifference = (currentTime - lastVisitTime) / 1000 / 60;

          if (timeDifference < 1) {
            console.log('Visit already tracked within the last minute.');
            return;
          }
        }

        if (data && title !== '') {
          await supabase
            .from('UserArticleVisits')
            .insert({ article_id: id, user_id: user?.id, title: title, user_name: user?.name });
          console.log('New visit tracked.');
        } else {
          console.log('No data found or invalid title.');
        }
      } catch (error) {
        console.error('Error while fetching user activity:', error);
      }
    };

    fetchArticle();
    trackUserVisit();
  }, []);

  const printData = () => {
    console.log(article.title);
    console.log(user);
  };

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

  if (!article) {
    return <p style={styles.loading}>Article not found!</p>;
  }

  return (
    <div style={styles.container}>
       {/* Navbar */}
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
          {user ? (
            <>
              <BsPersonCircle size={24} style={styles.userIcon} />
              <span style={styles.userName}>{user.name}</span>
              <button style={styles.signOutButton}>
                <FiLogOut /> Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              style={styles.signInButton}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
      <h1 style={styles.title}>{article.title}</h1>
      <img
            src={
              article.image ||
              'https://c.ndtvimg.com/2025-01/hm8m7qrg_south-korea-yoon-arrest_625x300_03_January_25.jpeg'
            }
            alt={article.title}
            style={styles.image}
          />
      {!editMode ? (
        <>
          <p style={styles.content}>{article.content}</p>
          <p style={styles.meta}>
            <FiUser /> {article.author || 'Unknown'}
          </p>
          <p style={styles.meta}>
            <FiEye /> Unique Visitors: {visitorCount}
          </p>
          <button style={styles.editButton} onClick={() => setEditMode(true)}>
            <FiEdit /> Edit Article
          </button>
          <button style={styles.editButton} onClick={printData}>
            click
          </button>
        </>
      ) : (
        <form style={styles.editForm}>
          <label style={styles.label}>
            Title
            <input
              type="text"
              style={styles.input}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </label>
          <label style={styles.label}>
            Content
            <textarea
              style={styles.textarea}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </label>
          <label style={styles.label}>
            Author
            <input
              type="text"
              style={styles.input}
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </label>
          <button style={styles.saveButton} type="button" onClick={handleSave}>
            <FiSave /> Save
          </button>
          <button
            style={{ ...styles.saveButton, backgroundColor: '#ddd', color: '#333' }}
            type="button"
            onClick={() => setEditMode(false)}
          >
            <MdOutlineCancel /> Cancel
          </button>
        </form>
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