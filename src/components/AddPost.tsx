import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import axios from "axios";

const API_BASE_URL = "https://2eed2842-a8dd-4a5c-bf54-3b3bdfa31948-00-2v7nkrzxtb2zv.kirk.replit.dev";

const AddPost: React.FC = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingImageToText, setLoadingImageToText] = useState(false);
  const [loadingVideoToText, setLoadingVideoToText] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setGeneratedImageUrl(null);

      setLoadingImageToText(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const imageRef = ref(storage, `temp/${user.uid}/${Date.now()}`);
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);

        const response = await axios.post(
          `${API_BASE_URL}/openai/image-to-text`,
          { imageUrl }
        );
        setTitle(response.data.title);
        setText(response.data.content);
        setGeneratedImageUrl(imageUrl);
      } catch (error) {
        console.error("Error generating text from image:", error);
      } finally {
        setLoadingImageToText(false);
      }
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideo(file);
      setGeneratedVideoUrl(null);
      setAudioUrl(null);

      setLoadingVideoToText(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const videoRef = ref(storage, `temp/${user.uid}/${Date.now()}`);
        await uploadBytes(videoRef, file);
        const videoUrl = await getDownloadURL(videoRef);

        const response = await axios.post(
          `${API_BASE_URL}/openai/video-to-text`,
          { videoUrl }
        );
        setTitle(response.data.description);
        setText(response.data.description);
        setGeneratedVideoUrl(videoUrl);
        setAudioUrl(response.data.audio_url);
      } catch (error) {
        console.error("Error generating text from video:", error);
      } finally {
        setLoadingVideoToText(false);
      }
    }
  };

  const fetchSuggestion = async (title: string) => {
    setLoadingText(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/openai/text`,
        { prompt: title }
      );
      setText(response.data.response);
    } catch (error) {
      console.error("Error generating post text:", error);
      setText("Error generating post text. Please try again.");
    } finally {
      setLoadingText(false);
    }
  };

  const fetchImage = async (prompt: string) => {
    setLoadingImage(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/flux/image`,
        { prompt }
      );
      setGeneratedImageUrl(response.data.image_url);
    } catch (error) {
      console.error("Error generating image:", error);
      setGeneratedImageUrl(null);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (e.target.value) {
      fetchSuggestion(e.target.value);
    } else {
      setText("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingText(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      let imageUrl = generatedImageUrl || "";
      if (image) {
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "posts"), {
        title,
        text,
        imageUrl,
        videoUrl: generatedVideoUrl,
        audioUrl,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      navigate("/");
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoadingText(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-post p-4 mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Create a New Post</h2>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Enter post title"
        className="w-full p-2 mb-4 border rounded"
        readOnly={loadingImageToText || loadingVideoToText}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Post content will be generated based on the title"
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        type="button"
        onClick={() => fetchSuggestion(title)}
        className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
        disabled={loadingText}
      >
        {loadingText ? "Loading..." : "Get Another Suggestion"}
      </button>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
          Image
        </label>
        <input
          type="file"
          id="image"
          onChange={handleImageChange}
          accept="image/*"
          className="mb-4"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="video">
          Video
        </label>
        <input
          type="file"
          id="video"
          onChange={handleVideoChange}
          accept="video/*"
          className="mb-4"
        />
      </div>
      {(loadingImageToText || loadingVideoToText) && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      <button
        type="button"
        onClick={() => fetchImage(title)}
        className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
        disabled={loadingImage}
      >
        {loadingImage ? "Loading..." : "Generate Image"}
      </button>
      {generatedImageUrl && (
        <div className="mb-4">
          <img src={generatedImageUrl} alt="Generated" className="w-full h-64 object-cover rounded-lg mb-4" />
          <button
            type="button"
            onClick={() => fetchImage(title)}
            className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
            disabled={loadingImage}
          >
            {loadingImage ? "Loading..." : "Generate Another Image"}
          </button>
        </div>
      )}
      {generatedVideoUrl && (
        <div className="mb-4">
          <video src={generatedVideoUrl} controls className="w-full h-64 object-cover rounded-lg mb-4" />
          {audioUrl && (
            <audio src={audioUrl} controls className="w-full mb-4" />
          )}
        </div>
      )}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Post
      </button>
    </form>
  );
};

export default AddPost;