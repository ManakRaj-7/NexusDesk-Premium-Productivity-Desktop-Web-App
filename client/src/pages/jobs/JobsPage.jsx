import { MainLayout } from '../../components/layout';
import { Card, Button } from '../../components/ui';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';

export default function JobsPage() {
  const sampleLinks = [
    {
      id: 1,
      title: 'React Documentation',
      url: 'https://react.dev',
      category: 'development',
    },
    {
      id: 2,
      title: 'MongoDB Docs',
      url: 'https://docs.mongodb.com',
      category: 'database',
    },
    {
      id: 3,
      title: 'Job Board',
      url: 'https://jobs.github.com',
      category: 'jobs',
    },
  ];

  return (
    <MainLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Jobs & Links</h1>
          <Button variant="primary">
            <Plus size={16} />
            Save Link
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleLinks.map((link) => (
            <Card key={link.id} className="p-4">
              <h3 className="font-semibold text-slate-100 mb-2">{link.title}</h3>
              <p className="text-xs text-slate-400 mb-3 truncate">{link.url}</p>
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
                  {link.category}
                </span>
                <div className="flex gap-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-dark-hover rounded transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button className="p-1 hover:bg-dark-hover rounded transition-colors text-red-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
