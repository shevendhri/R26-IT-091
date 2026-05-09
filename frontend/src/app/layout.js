import './globals.css';
import { ThemeProvider } from './ThemeProvider';
import { ProjectProvider } from '@/context/ProjectContext';

export const metadata = {
  title: 'IntelliBuild AI - Blueprint & Material System',
  description: 'AI-powered web application for intelligent building layout analysis and sustainable material specification.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ProjectProvider>
            {children}
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
