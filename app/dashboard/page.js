'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { FiEdit, FiSave, FiEye, FiUser,FiLogOut } from 'react-icons/fi';

import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@/app/Context/UserContext';
import { BsPersonCircle } from 'react-icons/bs';



export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [userArticles, setUserArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('articles');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedUser, setSelectedUser] = useState('all');
  const user = useUser()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: articlesData, error: articlesError } = await supabase
          .from('Articles')
          .select('id, title, created_at');
        if (articlesError) throw new Error('Error fetching articles');

        const { data: userArticleVisits, error: userArticleVisitsError } = await supabase
          .from('UserArticleVisits')
          .select('user_id, user_name, article_id, created_at, title');
        if (userArticleVisitsError) throw new Error('Error fetching user article visits');

        const { data: visitsData, error: visitsError } = await supabase
          .from('ArticleVisits')
          .select('article_id, ip_address');
        if (visitsError) throw new Error('Error fetching visits');

        const articlesWithVisitorCount = articlesData.map((article) => {
          const articleVisits = visitsData.filter((visit) => visit.article_id === article.id);
          const uniqueIPs = new Set(articleVisits.map((visit) => visit.ip_address));
          return {
            ...article,
            visitorCount: uniqueIPs.size,
          };
        });

        const filteredUserArticleVisits = [];
        userArticleVisits.forEach((visit) => {
          const existingVisit = filteredUserArticleVisits.find(
            (entry) =>
              entry.user_id === visit.user_id &&
              entry.article_id === visit.article_id &&
              Math.abs(new Date(entry.created_at) - new Date(visit.created_at)) < 60000
          );

          if (!existingVisit) {
            filteredUserArticleVisits.push(visit);
          }
        });

        const uniqueUsers = filteredUserArticleVisits.reduce((acc, userVisit) => {
          if (!acc.some(user => user.user_id === userVisit.user_id)) {
            acc.push({
              user_id: userVisit.user_id,
              user_name: userVisit.user_name,
            });
          }
          return acc;
        }, []);

        setArticles(articlesWithVisitorCount);
        setUserArticles(filteredUserArticleVisits);
        setUsers(uniqueUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortData = (data, key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    return data.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
  };

  const sortArticles = (key) => {
    const sortedArticles = sortData([...articles], key);
    setArticles(sortedArticles);
    setSortConfig({ key, direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending' });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <FiArrowUp /> : <FiArrowDown />;
    }
    return null;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUser(userId);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const filteredUserArticles = selectedUser === 'all' ? userArticles : userArticles.filter((entry) => entry.user_id === selectedUser);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
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

      <div style={styles.tabContainer}>
        <div
          style={activeTab === 'articles' ? styles.activeTab : styles.tab}
          onClick={() => handleTabChange('articles')}
        >
          Articles
        </div>
        <div
          style={activeTab === 'user-article' ? styles.activeTab : styles.tab}
          onClick={() => handleTabChange('user-article')}
        >
          User-Article
        </div>
      </div>

      {activeTab === 'articles' && (
        <div>
          <h1>Articles Dashboard</h1>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Sr No</th>
                <th style={styles.tableHeader}>Article Title</th>
                <th onClick={() => sortArticles('created_at')} style={styles.tableHeader}>
                  Created At {getSortIcon('created_at')}
                </th>
                <th onClick={() => sortArticles('visitorCount')} style={styles.tableHeader}>
                  Visitor Count {getSortIcon('visitorCount')}
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, i) => (
                <tr key={uuidv4()}>
                  <td style={styles.tableCell}>{i + 1}</td>
                  <td style={styles.tableCell}>{article.title}</td>
                  <td style={styles.tableCell}>{formatDate(article.created_at)}</td>
                  <td style={styles.tableCell}>{article.visitorCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'user-article' && (
        <div>
          <h1>User Article Interactions</h1>
          <select onChange={handleUserChange} value={selectedUser} style={styles.select}>
            <option value="all">All</option>
            {users.map((user) => (
              <option key={uuidv4()} value={user.user_id}>
                {user.user_name}
              </option>
            ))}
          </select>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Sr no.</th>
                <th style={styles.tableHeader}>Title</th>
                <th style={styles.tableHeader}>User Name</th>
                <th style={styles.tableHeader}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredUserArticles.map((entry, i) => (
                <tr key={uuidv4()}>
                  <td style={styles.tableCell}>{i + 1}</td>
                  <td style={styles.tableCell}>{entry.title}</td>
                  <td style={styles.tableCell}>{entry.user_name}</td>
                  <td style={styles.tableCell}>{formatDate(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  tabContainer: {
    display: 'flex',
    marginTop: '20px',
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#f1f1f1',
    marginRight: '10px',
    borderRadius: '5px',
  },
  activeTab: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#0070f3',
    color: '#fff',
    marginRight: '10px',
    borderRadius: '5px',
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
  select: {
    margin: '10px',
    padding: '5px',
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
