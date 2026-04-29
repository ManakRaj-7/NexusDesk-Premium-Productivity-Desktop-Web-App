import 'dotenv/config.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Task from '../models/Task.js';
import Folder from '../models/Folder.js';
import Link from '../models/Link.js';
import Session from '../models/Session.js';
import Settings from '../models/Settings.js';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexusdesk';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Note.deleteMany({});
    await Task.deleteMany({});
    await Folder.deleteMany({});
    await Link.deleteMany({});
    await Session.deleteMany({});
    await Settings.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const demoUser = new User({
      email: 'demo@nexusdesk.com',
      username: 'demouser',
      password: 'DemoPass123',
      profile: {
        fullName: 'Demo User',
        bio: 'Welcome to NexusDesk!',
      },
    });
    await demoUser.save();
    console.log(`👤 Created demo user: ${demoUser.email}`);

    // Create default settings
    const settings = new Settings({
      userId: demoUser._id,
      theme: 'dark',
    });
    await settings.save();
    console.log('⚙️  Created default settings');

    // Create folders
    const folderData = [
      { name: 'Dashboard', icon: 'grid', color: 'primary', order: 0 },
      { name: 'Projects', icon: 'folder', color: 'accent', order: 1 },
      { name: 'Notes', icon: 'file-text', color: 'slate', order: 2 },
      { name: 'Tasks', icon: 'check-square', color: 'cyan', order: 3 },
      { name: 'Resources', icon: 'link', color: 'violet', order: 4 },
    ];

    const folders = await Folder.insertMany(
      folderData.map(f => ({ ...f, userId: demoUser._id }))
    );
    console.log(`📁 Created ${folders.length} folders`);

    // Create sample notes
    const notes = await Note.insertMany([
      {
        title: 'Getting Started with NexusDesk',
        content: '# Welcome!\n\nThis is your first note. You can create, edit, and organize notes using folders and tags.\n\n## Features:\n- Markdown support\n- Tag organization\n- Star favorites\n- Auto-save',
        tags: ['welcome', 'tutorial'],
        folderId: folders[2]._id,
        userId: demoUser._id,
        starred: true,
      },
      {
        title: 'Project Ideas',
        content: '## Ideas to explore:\n1. AI-powered task automation\n2. Mobile companion app\n3. Team collaboration features\n4. Advanced analytics dashboard',
        tags: ['ideas', 'projects'],
        folderId: folders[1]._id,
        userId: demoUser._id,
      },
      {
        title: 'Daily Standup Template',
        content: '## What I did yesterday\n- [ ] Task 1\n- [ ] Task 2\n\n## What I\'m doing today\n- [ ] Task 3\n- [ ] Task 4\n\n## Blockers\n- None',
        tags: ['template', 'work'],
        folderId: folders[1]._id,
        userId: demoUser._id,
      },
      {
        title: 'Learning Resources',
        content: '## Frontend\n- React Docs\n- TailwindCSS\n\n## Backend\n- Node.js Best Practices\n- MongoDB Indexing\n\n## DevOps\n- Docker\n- GitHub Actions',
        tags: ['learning', 'development'],
        folderId: folders[4]._id,
        userId: demoUser._id,
      },
      {
        title: 'Meeting Notes - Q1 Planning',
        content: '## Attendees\n- Product Team\n- Engineering\n- Design\n\n## Key Decisions\n1. Focus on mobile optimization\n2. Improve search experience\n3. Add collaboration features\n\n## Action Items\n- [ ] Create roadmap\n- [ ] Setup sprints',
        tags: ['meeting', 'planning'],
        folderId: folders[2]._id,
        userId: demoUser._id,
      },
    ]);
    console.log(`📝 Created ${notes.length} sample notes`);

    // Create sample tasks
    const tasks = await Task.insertMany([
      {
        title: 'Implement dark mode toggle',
        description: 'Add theme switching capability to the dashboard',
        status: 'doing',
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        folderId: folders[1]._id,
        userId: demoUser._id,
      },
      {
        title: 'Create API documentation',
        description: 'Document all REST endpoints with examples',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        folderId: folders[1]._id,
        userId: demoUser._id,
      },
      {
        title: 'Write unit tests',
        description: 'Cover critical paths with unit tests',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        folderId: folders[1]._id,
        userId: demoUser._id,
      },
      {
        title: 'Review PR #45',
        description: 'Code review for new authentication module',
        status: 'doing',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        folderId: folders[1]._id,
        userId: demoUser._id,
      },
      {
        title: 'Fix responsive layout issues',
        description: 'Mobile and tablet layout fixes',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        folderId: folders[3]._id,
        userId: demoUser._id,
      },
      {
        title: 'Update dependencies',
        description: 'Upgrade npm packages and resolve conflicts',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        folderId: folders[1]._id,
        userId: demoUser._id,
      },
      {
        title: 'Prepare presentation slides',
        description: 'Create slides for product demo',
        status: 'done',
        priority: 'medium',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        folderId: folders[3]._id,
        userId: demoUser._id,
      },
      {
        title: 'Schedule team meeting',
        description: 'Coordinate with design and product teams',
        status: 'done',
        priority: 'medium',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        folderId: folders[3]._id,
        userId: demoUser._id,
      },
    ]);
    console.log(`✅ Created ${tasks.length} sample tasks`);

    // Create sample links
    const links = await Link.insertMany([
      {
        title: 'React Documentation',
        url: 'https://react.dev',
        category: 'development',
        tags: ['react', 'frontend'],
        notes: 'Official React docs - check hooks API',
        userId: demoUser._id,
      },
      {
        title: 'MongoDB Best Practices',
        url: 'https://docs.mongodb.com/manual/core/data-model-design/',
        category: 'development',
        tags: ['mongodb', 'database'],
        notes: 'Database design patterns',
        userId: demoUser._id,
      },
      {
        title: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        category: 'development',
        tags: ['css', 'ui'],
        notes: 'Utility-first CSS framework',
        userId: demoUser._id,
      },
      {
        title: 'GitHub - VSCode',
        url: 'https://github.com/microsoft/vscode',
        category: 'tools',
        tags: ['editor', 'vscode'],
        notes: 'Version control and code editor',
        userId: demoUser._id,
      },
      {
        title: 'Figma Design System',
        url: 'https://www.figma.com/design-systems',
        category: 'design',
        tags: ['design', 'ui'],
        notes: 'Collaborative design tool',
        userId: demoUser._id,
      },
    ]);
    console.log(`🔗 Created ${links.length} sample links`);

    // Create sample focus sessions
    const sessions = await Session.insertMany([
      {
        userId: demoUser._id,
        type: 'pomodoro',
        duration: 25,
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userId: demoUser._id,
        type: 'focus',
        duration: 60,
        completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        userId: demoUser._id,
        type: 'pomodoro',
        duration: 25,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`⏱️  Created ${sessions.length} focus sessions`);

    // Update user streak
    demoUser.focusStreak.current = 2;
    demoUser.focusStreak.longestStreak = 5;
    demoUser.focusStreak.lastSessionDate = new Date();
    await demoUser.save();

    console.log('\n✨ Database seeded successfully!');
    console.log('\n🔐 Demo Credentials:');
    console.log('   Email: demo@nexusdesk.com');
    console.log('   Password: DemoPass123');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
