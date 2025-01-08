'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [userArticles, setUserArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('articles');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all articles
        const { data: articlesData, error: articlesError } = await supabase
          .from('Articles')
          .select('id, title, created_at');
        if (articlesError) throw new Error('Error fetching articles');
    
        // Fetch all user article visits (this will provide unique users and their interactions)
        const { data: userArticleVisits, error: userArticleVisitsError } = await supabase
          .from('UserArticleVisits')
          .select('user_id, user_name, article_id, created_at, title');
        if (userArticleVisitsError) throw new Error('Error fetching user article visits');
    
        // Fetch visits for articles (to compute visitor count)
        const { data: visitsData, error: visitsError } = await supabase
          .from('ArticleVisits')
          .select('article_id, ip_address');
        if (visitsError) throw new Error('Error fetching visits');
    
        // Process articles with visitor counts
        const articlesWithVisitorCount = articlesData.map((article) => {
          const articleVisits = visitsData.filter((visit) => visit.article_id === article.id);
          const uniqueIPs = new Set(articleVisits.map((visit) => visit.ip_address));
          return {
            ...article,
            visitorCount: uniqueIPs.size, // Count of unique visitors
          };
        });
    
        // Function to filter duplicate user-article visits within 1 minute
        const filteredUserArticleVisits = [];
        userArticleVisits.forEach((visit) => {
          const existingVisit = filteredUserArticleVisits.find(
            (entry) =>
              entry.user_id === visit.user_id &&
              entry.article_id === visit.article_id &&
              Math.abs(new Date(entry.created_at) - new Date(visit.created_at)) < 60000 // 1 minute in milliseconds
          );
    
          if (!existingVisit) {
            filteredUserArticleVisits.push(visit);
          }
        });
    
        // Extract unique users from UserArticleVisits
        const uniqueUsers = [
          ...new Map(
            filteredUserArticleVisits.map((userVisit) => [
              userVisit.user_id, // using user_id as the key to ensure uniqueness
              { user_id: userVisit.user_id, user_name: userVisit.user_name },
            ])
          ).values(),
        ];
    
        console.log(filteredUserArticleVisits);
    
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

  const sortUserArticles = (key) => {
    const sortedUserArticles = sortData([...userArticles], key);
    setUserArticles(sortedUserArticles);
  };

  const sortUsers = (key) => {
    const sortedUsers = sortData([...users], key);
    setUsers(sortedUsers);
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

  const handleUserClick = (userId) => {
    console.log('hi');
    
    const userVisits = userArticles.filter((visit) => visit.user_id === userId);
    setUserArticles(userVisits);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>Tech Intel Pro</div>
        <div style={styles.navLinks}>
          <Link href="/" style={styles.navLink}>Home</Link>
          <Link href="/dashboard" style={styles.navLink}>Dashboard</Link>
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
        <div
          style={activeTab === 'users' ? styles.activeTab : styles.tab}
          onClick={() => handleTabChange('users')}
        >
          Users
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
                  <td style={styles.tableCell}>{i+1}</td>
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
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Sr no.</th>
                <th style={styles.tableHeader}>Title</th>
                <th style={styles.tableHeader}>User Name</th>
                <th onClick={() => sortUserArticles('created_at')} style={styles.tableHeader}>
                  Created At {getSortIcon('created_at')}
                </th>
              </tr>
            </thead>
            <tbody>
              {userArticles.map((entry, i) => (
                <tr key={uuidv4()}>
                  <td style={styles.tableCell}>{i+1}</td>
                  <td style={styles.tableCell}>{entry.title}</td>
                  <td style={styles.tableCell}>{entry.user_name}</td>
                  <td style={styles.tableCell}>{formatDate(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h1>Users</h1>
          <table style={styles.table}>
            <thead>
              <tr>
                <th onClick={() => sortUsers('user_name')} style={styles.tableHeader}>
                  User Name {getSortIcon('user_name')}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={uuidv4()}>
                  <td
                    style={styles.tableCell}
                    onClick={() => handleUserClick(user.user_id)}
                  >
                    {user.user_name}
                  </td>
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
};
