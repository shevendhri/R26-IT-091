import './globals.css';
import '../styles/dashboard.css';
import { ThemeProvider } from './ThemeProvider';
import { ProjectProvider } from '@/context/ProjectContext';
import { MaterialProvider } from '@/context/MaterialContext';

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
            <MaterialProvider>
              {children}
            </MaterialProvider>
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
