import { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout';
import { Card, Button, Input, Modal } from '../../components/ui';
import { linksService } from '../../services';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';

const emptyForm = {
  title: '',
  url: '',
  category: 'general',
  notes: '',
};

export default function JobsPage() {
  const [links, setLinks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const response = await linksService.getAll(1, 100);
      setLinks(response.data.links);
    } catch (err) {
      console.error('Failed to fetch links:', err);
      setError('Could not load saved links.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleCreateLink = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await linksService.create({
        ...formData,
        tags: [],
      });
      setLinks((current) => [response.data.link, ...current]);
      setFormData(emptyForm);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save link:', err);
      setError(err.response?.data?.error || 'Could not save link.');
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await linksService.delete(id);
      setLinks((current) => current.filter((link) => link._id !== id));
    } catch (err) {
      console.error('Failed to delete link:', err);
      setError('Could not delete link.');
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Jobs & Links</h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Save Link
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <Card className="p-6 text-slate-400">Loading links...</Card>
        ) : links.length === 0 ? (
          <Card className="p-6 text-slate-400">
            No links saved yet. Add your first job board, docs page, or resource.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <Card key={link._id} className="p-4">
                <h3 className="font-semibold text-slate-100 mb-2 line-clamp-1">
                  {link.title}
                </h3>
                <p className="text-xs text-slate-400 mb-3 truncate">{link.url}</p>
                {link.notes && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{link.notes}</p>
                )}
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
                      aria-label={`Open ${link.title}`}
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(link._id)}
                      className="p-1 hover:bg-dark-hover rounded transition-colors text-red-400 hover:text-red-500"
                      aria-label={`Delete ${link.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Save Link"
          size="lg"
        >
          <form onSubmit={handleCreateLink} className="space-y-4">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="React jobs board"
              required
            />
            <Input
              label="URL"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="jobs"
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Why this link matters"
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Link
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}
