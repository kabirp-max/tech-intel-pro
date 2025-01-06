'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { FiLogOut, FiTrash2 } from 'react-icons/fi';
import { BsPersonCircle } from 'react-icons/bs';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const emailName = user.user.email.split('@')[0];
        setUser({ ...user.user, name: emailName });
      }
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
      const { data: existingArticles } = await supabase.from('Articles').select('title');
      const existingTitles = new Set(existingArticles.map((article) => article.title));

      const response = await fetch(
        'https://newsdata.io/api/1/latest?apikey=pub_64142c718a17d829478a23b1319a33ebfca15&q=usa$language=english'
      );
      const data = await response.json();

      if (data.results) {
        const uniqueArticles = data.results.filter(
          (article) => !existingTitles.has(article.title)
        );

        if (uniqueArticles.length === 0) {
          alert('No new unique articles to add.');
          setLoading(false);
          return;
        }

        const formattedArticles = uniqueArticles.slice(0, 1).map((article) => ({
          title: article.title,
          content: article.description || '',
          author: article.creator ? article.creator.join(', ') : 'Unknown',
          image: article.image_url || '',
        }));

        await supabase.from('Articles').insert(formattedArticles);
        const { data: updatedArticles } = await supabase.from('Articles').select('*');
        setArticles(updatedArticles);
        // alert('New unique articles fetched and saved!');
      }
    } catch (error) {
      console.error('Error fetching new articles:', error);
    }
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    alert('Signed out successfully');
  };

  const deleteArticle = async (id) => {
    if (confirm('Do you want to delete this article?')) {
      await supabase.from('Articles').delete().eq('id', id);
      setArticles(articles.filter((article) => article.id !== id));
    }
  };

  if (loading) {
    return <p style={styles.loading}>Loading...</p>;
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
              <button onClick={signOut} style={styles.signOutButton}>
                <FiLogOut /> Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} style={styles.signInButton}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.heading}>Welcome to the Homepage</h1>
          <button onClick={fetchNewArticles} style={styles.fetchButton}>
            Fetch New Articles
          </button>
        </div>

        <div style={styles.grid}>
          {articles.slice().reverse().map((article) => (
            <div key={article.id} style={styles.card}>
              <img
                src={article.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={article.title}
                style={styles.thumbnail}
              />
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>{article.title}</h2>
                <p style={styles.cardAuthor}>By: {article.author || 'Unknown'}</p>
                <Link href={`/article/${article.id}`} style={styles.readMore}>
                  Read More
                </Link>
                <p></p>
                {/* <button onClick={() => deleteArticle(article.id)} style={styles.deleteButton}>
                  <FiTrash2 /> 
                </button> */}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} My Articles. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f4',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
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
  mainContent: {
    padding: '20px',
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  heading: {
    fontSize: '24px',
  },
  fetchButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  cardBody: {
    padding: '10px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  cardAuthor: {
    fontSize: '14px',
    color: '#555',
  },
  readMore: {
    display: 'inline-block',
    marginTop: '10px',
    color: '#0070f3',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  deleteButton: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '10px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  footer: {
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
    padding: '10px 0',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
    color: '#555',
  },
};
