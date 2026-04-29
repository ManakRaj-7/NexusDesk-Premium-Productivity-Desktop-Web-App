import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MainLayout } from '../../components/layout';
import { Card, Button, Input, Modal } from '../../components/ui';
import { notesService } from '../../services';
import { setNotes, addNote } from '../../store/slices/notesSlice';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function NotesPage() {
  const dispatch = useDispatch();
  const { items: notes } = useSelector((state) => state.notes);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await notesService.getAll(1, 100, { search });
        dispatch(setNotes(response.data.notes));
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    };

    fetchNotes();
  }, [dispatch, search]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      const response = await notesService.create({
        title: formData.title,
        content: formData.content,
        tags: [],
      });
      dispatch(addNote(response.data.note));
      setFormData({ title: '', content: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Notes</h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            New Note
          </Button>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search size={16} />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card
              key={note._id}
              className="p-4 cursor-pointer hover:glow transition-all"
              onClick={() => setSelectedNote(note)}
            >
              <h3 className="font-semibold text-slate-100 mb-2 line-clamp-1">{note.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-3 mb-4">{note.content || 'No content'}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="p-1 hover:bg-dark-hover rounded transition-colors">
                  <Edit2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Note"
          size="lg"
        >
          <form onSubmit={handleCreateNote} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Note title"
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your note (supports Markdown)"
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent h-32"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Note
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}
