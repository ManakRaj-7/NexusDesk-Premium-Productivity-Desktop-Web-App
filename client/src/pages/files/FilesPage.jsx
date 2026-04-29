import { MainLayout } from '../../components/layout';
import { Card } from '../../components/ui';

export default function FilesPage() {
  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">Files</h1>
        <Card className="p-12 text-center">
          <p className="text-slate-400">File explorer coming soon</p>
        </Card>
      </div>
    </MainLayout>
  );
}
