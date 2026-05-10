//import { Sidebar } from '@/components/Sidebar';
//import { Topbar } from '@/components/Topbar';

export default function ResultsLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
    
      
      <main className="flex flex-1 flex-col overflow-hidden">
     
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
