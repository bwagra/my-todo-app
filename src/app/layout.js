export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/styles/ag-grid.css" />
        <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/styles/ag-theme-alpine.css" />
      </head>
      <body style={{ margin: 0, fontFamily: 'sans-serif' }}>
        <main style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  );
}