// visualizations.js

// Define paths to additional HTML files
const contentUrls = ["donut.html", "scatter.html"];
let currentIndex = 0;

// DOM elements
const dynamicContent = document.getElementById("dynamic-content");
const loadingIndicator = document.getElementById("loading");

// Function to load and inject HTML content
async function loadContent() {
  if (currentIndex >= contentUrls.length) {
    observer.disconnect(); // Stop observing when all content is loaded
    loadingIndicator.classList.add("hidden"); // Hide loading indicator
    return;
  }

  // Show loading indicator
  loadingIndicator.classList.remove("hidden");

  try {
    const response = await fetch(contentUrls[currentIndex]);
    if (!response.ok) throw new Error("Network response was not ok");

    // Parse and inject HTML
    const html = await response.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Move all elements from tempDiv to the actual content
    Array.from(tempDiv.children).forEach((child) => {
      dynamicContent.appendChild(child);
    });

    // Execute any <script> tags within the loaded content
    tempDiv.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      if (oldScript.src) {
        newScript.src = oldScript.src; // Copy script src if it's external
      } else {
        newScript.textContent = oldScript.textContent; // Copy inline script
      }
      document.body.appendChild(newScript); // Append to body to execute
    });

    currentIndex++;
    observer.observe(dynamicContent.lastElementChild); // Observe the last added section
  } catch (error) {
    console.error("Failed to load content:", error);
  } finally {
    loadingIndicator.classList.add("hidden");
  }
}

// Intersection Observer to trigger loading when the last section is in view
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadContent();
  }
}, {
  rootMargin: "0px",
  threshold: 1.0,
});

// Start observing the initial section
observer.observe(dynamicContent);
