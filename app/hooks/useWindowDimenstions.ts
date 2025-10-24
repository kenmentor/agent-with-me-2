'use client'
import { useState, useEffect } from 'react';

// Define the shape of our dimension object
interface WindowDimensions {
  width: number;
  height: number;
}

// Function to safely get dimensions (handles SSR)
function getWindowDimensions(): WindowDimensions {
  if (typeof window !== 'undefined') {
    const { innerWidth: width, innerHeight: height } = window;
    return { width, height };
  }
  // Return a default value for server-side rendering
  return { width: 0, height: 0 };
}

export default function useWindowDimensions(): WindowDimensions {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    // This effect will only run on the client side
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []); // The empty dependency array ensures this runs once on mount

  return windowDimensions;
}
