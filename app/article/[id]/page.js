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

        const logVisitor = async () => {
          try {
            const response = await fetch('/api/get-ip');
            const { ip } = await response.json();
      
            if (ip) {
              // Check if the IP address is already recorded for this article
              const { data, error } = await supabase
                .from('ArticleVisits')
                .select('ip_address')
                .eq('article_id', id)
                .eq('ip_address', ip)
                .single();  // Expecting only one result for this IP address
      
              // If no data is found, insert the IP address
              if (error || !data) {
                await supabase.from('ArticleVisits').insert({ article_id: id, ip_address: ip });
              }
            }
          } catch (error) {
            console.error('Error logging visitor:', error);
          }
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
    logVisitor();
  }, [id]);

  const handleSave = async () => {
    const { title, content, image, author, tags } = formData;
    const { error } = await supabase
      .from('Articles')
      .update({ title, content, image, author, tags })
      .eq('id', id);

    if (!error) {
      setEditMode(false);
    }
  };


  if (!article) return <p>Article not found!</p>;

  return (
    <div>
      <div>
        {!editMode ? (
          <>
            <h1>{article.title}</h1>
            <img src={article.image || '/placeholder.jpg'} alt={article.title} />
            <p>{article.content}</p>
            <p>By: {article.author || 'Unknown'}</p>
            <p>Unique Visitors: {visitorCount}</p>
            <button onClick={() => setEditMode(true)}>Edit Article</button>
          </>
        ) : (
          <form>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {/* Add other fields here */}
            <button type="button" onClick={handleSave}>
              Save
            </button>
          </form>
        )}
      </div>
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