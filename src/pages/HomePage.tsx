import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our App</h1>
        <p className="text-xl mb-8">A modern and sleek social media experience</p>
        <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded shadow-md hover:bg-gray-100">
          Get Started
        </button>
      </div>

      {/* Features Section */}
      <div className="features py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-2xl font-semibold mb-4">User Authentication</h3>
            <p>Secure and easy Google Sign-In</p>
          </div>
          <div className="feature-card bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-2xl font-semibold mb-4">Create Posts</h3>
            <p>Share your thoughts and images with the world</p>
          </div>
          <div className="feature-card bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-2xl font-semibold mb-4">Public Feed</h3>
            <p>View posts from all users in a beautiful feed</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer bg-gray-800 text-white py-6 text-center">
        <p>&copy; 2024 Our App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;