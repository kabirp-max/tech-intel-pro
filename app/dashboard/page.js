'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch all articles
        const { data: articlesData, error } = await supabase
          .from('Articles')
          .select('id, title, created_at');
    
        if (error) {
          console.error('Error fetching articles:', error);
          setLoading(false);
          return;
        }
    
        // Fetch all visits in a single query to reduce multiple calls
        const { data: visitsData, error: visitsError } = await supabase
          .from('ArticleVisits')
          .select('article_id, ip_address');
    
        if (visitsError) {
          console.error('Error fetching visitor data:', visitsError);
          setLoading(false);
          return;
        }
    
        // Process articles with visitor counts
        const articlesWithVisitorCount = articlesData.map((article) => {
          const articleVisits = visitsData.filter(
            (visit) => visit.article_id === article.id
          );
    
          // Use a Set to filter unique IPs
          const uniqueIPs = new Set(articleVisits.map((visit) => visit.ip_address));
    
          return {
            ...article,
            visitorCount: uniqueIPs.size, // Count of unique visitors
          };
        });
    
        setArticles(articlesWithVisitorCount);
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };
    

    fetchArticles();
  }, []);

  const sortArticles = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedArticles = [...articles].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setArticles(sortedArticles);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <FiArrowUp /> : <FiArrowDown />;
    }
    return null;
  };

  if (loading) {
    return <p style={styles.loading}>Loading...</p>;
  }

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
      

      {/* Dashboard Content */}
      <h1 style={styles.title}>Articles Dashboard</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Article Title</th>
            <th
              style={styles.tableHeader}
              onClick={() => sortArticles('created_at')}
            >
              Created At {getSortIcon('created_at')}
            </th>
            <th
              style={styles.tableHeader}
              onClick={() => sortArticles('visitorCount')}
            >
              Visitor Count {getSortIcon('visitorCount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td style={styles.tableCell}>{article.title}</td>
              <td style={styles.tableCell}>
                {new Date(article.created_at).toLocaleDateString()}
              </td>
              <td style={styles.tableCell}>{article.visitorCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    backgroundColor: '#333',
    color: '#fff',
  },
  navBrand: {
    fontSize: '24px',
  },
  navLinks: {
    display: 'flex',
  },
  navLink: {
    marginLeft: '15px',
    color: '#fff',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  title: {
    fontSize: '28px',
    margin: '20px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  tableHeader: {
    textAlign: 'left',
    padding: '10px',
    backgroundColor: '#f1f1f1',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
  },
  tableCell: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  loading: {
    fontSize: '20px',
    textAlign: 'center',
    marginTop: '50px',
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
