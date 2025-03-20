import React, { useState } from "react";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [responseData, setResponseData] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(true);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      alert("⚠️ Please upload an image first!");
      return;
    }

    setLoading(true);
    setUploadVisible(false);

    try {
      const apiKey = "AIzaSyB7JedGtsUDzQZ-w5cSdCeQQParNf7fgPc"; // Replace with actual API key
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1];

        const requestData = {
          contents: [
            {
              parts: [
                { text: "🔍 Analyze this image for plant diseases and provide a clear diagnosis with symptoms, causes, solutions, and recommended pesticides." },
                {
                  inline_data: {
                    mime_type: selectedImage.type,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        };

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "❌ No response received.";

        const formattedResponse = aiResponse
          .replace(/#/g, "")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/\n/g, "<br>");

        setResponseData(formattedResponse);
      };
    } catch (error) {
      console.error("❌ Error analyzing image:", error);
      setResponseData(
        "<h3 style='color: red;'>❌ Error: Could not retrieve disease information.</h3><p>Please try again later.</p>"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>🌿 AI Plant Disease Detection</h1>
      {uploadVisible && (
        <div id="upload-container">
          <label htmlFor="imageUpload">Upload an image:</label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      )}
      {previewSrc && (
        <div id="image-preview-container">
          <img id="previewImage" src={previewSrc} alt="Preview" className="centered-image" />
        </div>
      )}

      {uploadVisible && (
        <button id="analyzeButton" onClick={analyzeImage} disabled={loading}>
          {loading ? "Analyzing..." : "Detect Disease"}
        </button>
      )}

      <div
        id="disease-info"
        dangerouslySetInnerHTML={{ __html: responseData }}
      ></div>
    </div>
  );
}

export default App;