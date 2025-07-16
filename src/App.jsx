import { useState, useEffect } from "react";

function App() {
  const [images, setImages] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const imagesGlob = import.meta.glob("./img_patches/*.{png,jpg,jpeg,gif,bmp}", { eager: true });
    const loadedImages = Object.entries(imagesGlob).map(([path, module]) => ({
      name: path.split("/").pop(),
      src: module.default,
    }));
    setImages(loadedImages);
  }, []);

  const handleResponse = (answer) => {
  const currentImage = images[currentIdx].name;
  setResponses((prev) => [
    ...prev,
    {
      "File Name": currentImage,
      "User Answer": answer,
    },
  ]);

  if (currentIdx + 1 < images.length) {
    setCurrentIdx(currentIdx + 1);
  } else {
    setDone(true);
  }
};

  useEffect(() => {
    if (done) {
      // Send JSON to backend API automatically when done
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/save-responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responses),
      })
        .then((res) => {
          if (res.ok) alert("Responses saved to GitHub!");
          else alert("Failed to save responses.");
        })
        .catch(() => alert("Network error saving responses."));
    }
  }, [done]);

  if (!images.length) return <div>Loading images...</div>;
  if (done) return <div style={{ margin: "40px" }}>Done! Responses saved.</div>;

  return (
    <div style={{ margin: "70px" }}>
      <h1>Is this a vessel?</h1>
      <div
        style={{
          width: "400px",
          height: "400px",
          marginBottom: "40px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "none",
        }}
      >
        <img
          src={images[currentIdx].src}
          alt={images[currentIdx].name}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      </div>
      <div>
        <button
          onClick={() => handleResponse("Yes")}
          style={{
            marginRight: "10px",
            padding: "10px 50px",
            fontSize: "20px",
            cursor: "pointer",
            backgroundColor: "#bddcbeff",
          }}
        >
          Yes
        </button>
        <button
          onClick={() => handleResponse("No")}
          style={{
            padding: "10px 50px",
            fontSize: "20px",
            cursor: "pointer",
            backgroundColor: "#f8d7daff",
          }}
        >
          No
        </button>
      </div>
      <p>{`Image ${currentIdx + 1} of ${images.length}`}</p>
    </div>
  );
}

export default App;
