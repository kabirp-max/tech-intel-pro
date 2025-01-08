'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Link from 'next/link';
import { FiEdit, FiSave, FiEye, FiUser } from 'react-icons/fi';
import { MdOutlineCancel } from 'react-icons/md';
import { useUser } from '@/app/Context/UserContext';

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

  let title = ''

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
        // Fetch existing visits for the article and user
        const { data, error } = await supabase
          .from('UserArticleVisits')
          .select('*')
          .eq('article_id', id)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }) // Order by latest first
    
        if (error) {
          console.error('Error fetching user activity:', error);
          return;
        }
    
        // Check if there's already an entry within a minute
        if (data && data.length > 0) {
          const lastVisit = data[0]; // The latest visit (most recent due to sorting)
    
          const lastVisitTime = new Date(lastVisit.created_at);
          const currentTime = new Date();
          const timeDifference = (currentTime - lastVisitTime) / 1000 / 60; // Time difference in minutes
    
          // If the last visit was within a minute, do not insert a new record
          if (timeDifference < 1) {
            console.log('Visit already tracked within the last minute.');
            return;
          }
        }
    
        // If no recent visit found or the visit is more than a minute ago, insert new visit
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
    
  
    const fetchVisitorCount = async () => {
      
    };
  
    // Call the functions in sequence
    fetchArticle();
    trackUserVisit()
  
  }, []);
  
  const printData = () => {
    console.log(article.title);
    console.log(user);
    
    
  }

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
    return <p>Loading...</p>;
  }

  if (!article) {
    return <p>Article not found!</p>;
  }

  return (
    <div>
      <h1>{article.title}</h1>
      {!editMode ? (
        <>
          <p>{article.content}</p>
          <p>
            <FiUser /> {article.author || 'Unknown'}
          </p>
          <p>
            <FiEye /> Unique Visitors: {visitorCount}
          </p>
          <button onClick={() => setEditMode(true)}>
            <FiEdit /> Edit Article
          </button>
          <button onClick={printData}>click</button>
        </>
      ) : (
        <form>
          <label>
            Title
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </label>
          <label>
            Content
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </label>
          <label>
            Author
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </label>
          <button type="button" onClick={handleSave}>
            <FiSave /> Save
          </button>
          <button type="button" onClick={() => setEditMode(false)}>
            <MdOutlineCancel /> Cancel
          </button>
        </form>
      )}
    </div>
  );
}
