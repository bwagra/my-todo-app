import './globals.css';

export const metadata = {
  title: 'Day Planner',
  description: 'A simple to-do and reminder planner built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
