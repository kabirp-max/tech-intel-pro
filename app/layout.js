export const metadata = {
  title: 'News App',
  description: 'Track unique visits for articles',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
