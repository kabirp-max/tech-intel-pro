export const metadata = {
  title: 'News App',
  description: 'Track unique visits for articles',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white' }}>
          <a href="/" style={{ margin: '0 10px', color: 'white', textDecoration: 'none' }}>
            Home
          </a>
        </nav>
        {children}
      </body>
    </html>
  );
}
