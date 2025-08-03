// scripts/seedData.ts
import { Video } from '../lib/entities/models.ts';
import { types } from 'cassandra-driver';

async function seedData() {
  try {
    // Add some test videos
    const videos: Video[] = [
      {
        video_id: types.Uuid.random(),
        title: 'The Jerusalem Has Come',
        description: 'Test Video - 1',
        duration: 198, // 3:18 minutes
        thumbnail_url: 'https://img.youtube.com/vi/xQP0QB4xWHo/0.jpg',
        video_url: 'https://www.youtube.com/watch?v=xQP0QB4xWHo',
        metadata: { quality: '1080p' },
        created_at: new Date(),
        // tags: new Set(['test', 'sample']),
      },
      {
        video_id: types.Uuid.random(),
        title: 'Apple - 1984',
        description: 'Test Video - 2',
        duration: 59, // 59 seconds
        thumbnail_url: 'https://img.youtube.com/vi/R706isyDrqI/0.jpg',
        video_url: 'https://www.youtube.com/watch?v=R706isyDrqI',
        metadata: { quality: '240p' },
        created_at: new Date(),
        // tags: new Set(['test', 'sample']),
      },
      {
        video_id: types.Uuid.random(),
        title: 'Home Video',
        description: 'Test Video - 1',
        duration: 21, // 21 seconds
        thumbnail_url: '/seed_data/photos/home.jpg',
        video_url: '/seed_data/videos/home.mp4',
        metadata: { quality: '1080p' },
        created_at: new Date(),
        // tags: new Set(['test', 'sample']),
      }
    ];

    // for (const video of videos) {
    //   const videoId = await dbOperations.createVideo(video);
    //   console.log(`Created video with ID: ${videoId}`);
    // }

    console.log('Seed data added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();