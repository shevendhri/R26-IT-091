import './globals.css';
import '../styles/dashboard.css';
import { ThemeProvider } from './ThemeProvider';
import { ProjectProvider } from '@/context/ProjectContext';
import { MaterialProvider } from '@/context/MaterialContext';

export const metadata = {
  title: 'GreenConstruct AI — Biophilic Architecture & Material Intelligence Platform',
  description: 'AI-powered biophilic architectural decision-support platform for intelligent plan analysis, sustainable material specification, GreenSL pre-assessment, and fire compliance in Sri Lanka.',
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
