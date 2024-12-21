// scripts/seedData.ts
import { dbOperations } from '../lib/scylla.ts';
import { types } from 'cassandra-driver';

async function seedData() {
  try {
    // Add some test videos
    const videos = [
      {
        title: 'The Jerusalem Has Come',
        description: 'This is a test video',
        duration: 198, // 3:18 minutes
        thumbnail_url: 'https://img.youtube.com/vi/xQP0QB4xWHo/0.jpg',
        video_url: 'https://youtu.be/xQP0QB4xWHo?si=iW5GY1-3NUZPVMw-',
        // tags: new Set(['test', 'sample']),
        metadata: { quality: '1080p' }
      },
    //   {
    //     title: 'Sample Video 2',
    //     description: 'Another test video',
    //     duration: 240, // 4 minutes
    //     thumbnail_url: '/thumbnails/2.jpg',
    //     video_url: '/videos/2.mp4',
    //     tags: new Set(['test', 'example']),
    //     metadata: { quality: '720p' }
    //   }
    ];

    for (const video of videos) {
      const videoId = await dbOperations.createVideo(video);
      console.log(`Created video with ID: ${videoId}`);
    }

    console.log('Seed data added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();