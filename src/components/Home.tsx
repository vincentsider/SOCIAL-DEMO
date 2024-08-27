import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface Post {
  id: string;
  text: string;
  imageUrl: string;
  videoUrl: string;
  audioUrl: string;
  userId: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(newPosts);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our App</h1>
        <p className="text-xl mb-8">A modern and sleek social media experience</p>
        <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded shadow-md hover:bg-gray-100">
          Get Started
        </button>
      </div>

      {/* Posts Section */}
      <div className="posts py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Recent Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="post bg-white shadow-lg rounded-lg p-6">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              {post.videoUrl && (
                <video
                  src={post.videoUrl}
                  controls
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              {post.audioUrl && (
                <audio
                  src={post.audioUrl}
                  controls
                  className="w-full mb-4"
                />
              )}
              <p className="text-gray-800">{post.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer bg-gray-800 text-white py-6 text-center">
        <p>&copy; 2024 Our App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;