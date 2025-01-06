'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: user } = await supabase.auth.getUser();
      setUser(user.user);
    };

    const fetchArticles = async () => {
      const { data, error } = await supabase.from('Articles').select('*');
      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        setArticles(data);
      }
      setLoading(false);
    };

    fetchUser();
    fetchArticles();
  }, []);

  const fetchNewArticles = async () => {
    setLoading(true);

    try {
      const { data: existingArticles, error: existingError } = await supabase
        .from('Articles')
        .select('title');

      if (existingError) {
        console.error('Error fetching existing articles:', existingError);
        setLoading(false);
        return;
      }

      const existingTitles = new Set(existingArticles.map((article) => article.title));

      const response = await fetch(
        'https://newsdata.io/api/1/latest?apikey=pub_64142c718a17d829478a23b1319a33ebfca15&q=apple$language=english'
      );
      const data = await response.json();

      if (data.results) {
        let uniqueArticles = data.results.filter(
          (article) => !existingTitles.has(article.title)
        );

        if (uniqueArticles.length === 0) {
          alert('No new unique articles to add.');
          setLoading(false);
          return;
        }

        uniqueArticles = [uniqueArticles[0]];

        const formattedArticles = uniqueArticles.map((article) => ({
          title: article.title,
          content: article.description || '',
          author: article.creator ? article.creator.join(', ') : 'Unknown',
          image: article.image_url || '',
        }));

        const { error: insertError } = await supabase.from('Articles').insert(formattedArticles);

        if (insertError) {
          console.error('Error storing articles in Supabase:', insertError);
        } else {
          alert('New unique articles fetched and saved!');
          const { data: updatedArticles, error: fetchError } = await supabase
            .from('Articles')
            .select('*');
          if (fetchError) {
            console.error('Error fetching updated articles:', fetchError);
          } else {
            setArticles(updatedArticles);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching new articles:', error);
    }

    setLoading(false);
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `http://google.com`,
      },
    });

    if (error) {
      console.log(error);
    } else {
      alert('Signed in successfully');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null);
      alert('Signed out successfully');
    }
  };

  const deleteArticle = async (id) => {
    const confirmed = confirm('Do you want to delete this article?');
    if (confirmed) {
      const { error } = await supabase.from('Articles').delete().eq('id', id);
      if (error) {
        console.error('Error deleting article:', error);
      } else {
        alert('Article deleted successfully');
        setArticles(articles.filter((article) => article.id !== id));
      }
    }
  };

  if (loading) {
    return <p style={styles.loading}>Loading...</p>;
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
        <div style={styles.userInfo}>
          {user ? (
            <>
              <span style={styles.userName}>{user.email}</span>
              <button onClick={signOut} style={styles.signOutButton}>
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={signIn} style={styles.signInButton}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.heading}>Welcome to the Homepage</h1>
        <button onClick={fetchNewArticles} style={styles.fetchButton}>
          Fetch New Articles
        </button>

        <p style={styles.subheading}>Explore the latest articles below:</p>
        <div style={styles.grid}>
          {articles.slice().reverse().map((article) => (
            <div key={article.id} style={styles.card}>
              <img
                src={
                  article.image ||
                  'https://via.placeholder.com/300x200?text=No+Image'
                }
                alt={article.title}
                style={styles.thumbnail}
              />
              <h2 style={styles.cardTitle}>{article.title}</h2>
              <p style={styles.cardAuthor}>By: {article.author || 'Unknown'}</p>
              <Link href={`/article/${article.id}`} style={styles.readMore}>
                Read More
              </Link>
              <button
                onClick={() => deleteArticle(article.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
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
  mainContent: {
    padding: '20px',
  },
  heading: {
    fontSize: '28px',
    textAlign: 'center',
    margin: '20px 0',
  },
  subheading: {
    fontSize: '18px',
    textAlign: 'center',
    margin: '10px 0 20px',
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease',
    cursor: 'pointer',
  },
  thumbnail: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  cardTitle: {
    fontSize: '18px',
    margin: '10px 15px',
  },
  cardAuthor: {
    fontSize: '14px',
    margin: '0 15px',
    color: '#666',
  },
  readMore: {
    display: 'inline-block',
    margin: '15px',
    color: '#0070f3',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
    color: '#555',
  },
};
