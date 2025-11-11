// src/components/ai/FoodScanner.tsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, Loader2, Package, MapPin, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FoodScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScanResult {
  foodName: string;
  description: string;
  nutritionalInfo: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fats?: string;
    fiber?: string;
    vitamins?: string[];
  };
  ingredients?: string[];
  availability: {
    stores: string[];
    priceRange?: string;
    commonBrands?: string[];
  };
  storageAdvice?: string;
  shelfLife?: string;
}

// 🛑 EXPOSED API KEY - FOR PRESENTATION ONLY!
// WARNING: This key is public. Change this immediately after your presentation.
const GEMINI_API_KEY = "AIzaSyBf_93Cqsyq9bYMWxhpolte9SdAytmDa_M"; 
const GEMINI_MODEL = "gemini-2.5-flash"; 

export default function FoodScanner({ isOpen, onClose }: FoodScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions and try again.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); 
      const imageData = canvas.toDataURL("image/jpeg");
      setImage(imageData);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const analyzeFood = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      // Extract the base64 part of the data URL
      const base64Data = image.split(",")[1];

      const prompt = `Analyze the food item in this image. Provide detailed information in a valid JSON object. Include:
1.  **foodName**: A short name for the food.
2.  **description**: A brief one-sentence description.
3.  **nutritionalInfo**: An object with calories (per 100g), protein, carbs, fats, fiber, and key vitamins (as an array of strings).
4.  **ingredients**: An array of main ingredients, if visible or obvious.
5.  **availability**: An object containing 'stores' (an array of major South African retailers like Pick n Pay, Checkers, Woolworths, Shoprite, Spar), 'priceRange' (a string estimate in ZAR), and 'commonBrands' (as an array of strings).
6.  **storageAdvice**: A string with storage tips.
7.  **shelfLife**: A string describing the typical shelf life.

Respond ONLY with the raw JSON object, without any markdown formatting like \`\`\`json or \`\`\`.`;

      // ✅ Calling the external API directly with the exposed key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: prompt }] },
              {
                inline_data: {
                  mime_type: "image/jpeg", 
                  data: base64Data,
                },
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        // Simple error handling for external API failure
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json(); 

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid or empty response from API. The model may not have been able to identify the food.");
      }

      const textContent = data.candidates[0].content.parts[0].text;

      // Clean up common markdown formatting
      const cleanedText = textContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsedResult = JSON.parse(cleanedText);
      setResult(parsedResult);
    } catch (err: any) {
      console.error("Analysis error:", err);
      // Simplified error message
      setError(`Failed to analyze the food item. Error: ${err.message || 'Check network connection or API key.'}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    stopCamera();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Food Scanner</h2>
                  <p className="text-blue-100 text-sm">Powered by Google Gemini AI</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-grow">
            {!image && !cameraActive && (
              <div className="space-y-4 text-center py-8">
                <p className="text-gray-600 mb-6">
                  Take a photo or upload an image to analyze food details
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button
                    onClick={startCamera}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Use Camera
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Image
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 max-w-md mx-auto text-left">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    What You'll Get
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Detailed nutritional information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Where to buy in South Africa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Price estimates in ZAR</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Storage and shelf life tips</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {cameraActive && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="flex gap-4 justify-center">
                  <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                    Capture Photo
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {image && !result && (
              <div className="space-y-4">
                <div className="flex justify-center">
                    <img src={image} alt="Food to analyze" className="max-w-full rounded-lg max-h-96 object-contain" />
                </div>
                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    onClick={analyzeFood}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Package className="w-5 h-5" />
                        Analyze Food
                      </>
                    )}
                  </Button>
                  <Button onClick={reset} variant="outline" disabled={loading}>
                    Try Another
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex flex-col items-center gap-4">
                <div className="flex items-start gap-2 text-center">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
                <Button onClick={reset} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <img src={image!} alt="Scanned food" className="w-32 h-32 rounded-lg object-cover flex-shrink-0 mx-auto md:mx-0" />
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900">{result.foodName}</h3>
                    <p className="text-gray-600 mt-1">{result.description}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Nutritional Information</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {result.nutritionalInfo.calories && (
                      <div>
                        <p className="text-sm text-gray-600">Calories</p>
                        <p className="font-semibold text-lg">{result.nutritionalInfo.calories}</p>
                      </div>
                    )}
                    {result.nutritionalInfo.protein && (
                      <div>
                        <p className="text-sm text-gray-600">Protein</p>
                        <p className="font-semibold text-lg">{result.nutritionalInfo.protein}</p>
                      </div>
                    )}
                    {result.nutritionalInfo.carbs && (
                        <div>
                            <p className="text-sm text-gray-600">Carbohydrates</p>
                            <p className="font-semibold text-lg">{result.nutritionalInfo.carbs}</p>
                        </div>
                    )}
                    {result.nutritionalInfo.fats && (
                      <div>
                        <p className="text-sm text-gray-600">Fats</p>
                        <p className="font-semibold text-lg">{result.nutritionalInfo.fats}</p>
                      </div>
                    )}
                    {result.nutritionalInfo.fiber && (
                      <div>
                        <p className="text-sm text-gray-600">Fiber</p>
                        <p className="font-semibold text-lg">{result.nutritionalInfo.fiber}</p>
                      </div>
                    )}
                  </div>
                  {result.nutritionalInfo.vitamins && result.nutritionalInfo.vitamins.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Key Vitamins & Minerals</p>
                      <div className="flex flex-wrap gap-2">
                        {result.nutritionalInfo.vitamins.map((vitamin, idx) => (
                          <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            {vitamin}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {result.ingredients && result.ingredients.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Main Ingredients</h4>
                    <p className="text-gray-700">{result.ingredients.join(", ")}</p>
                  </div>
                )}

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Available in South Africa</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Where to Buy</p>
                      <div className="flex flex-wrap gap-2">
                        {result.availability.stores.map((store, idx) => (
                          <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                            {store}
                          </span>
                        ))}
                      </div>
                    </div>
                    {result.availability.priceRange && (
                      <div>
                        <p className="text-sm text-gray-600">Typical Price Range</p>
                        <p className="font-semibold text-gray-900 text-lg">{result.availability.priceRange}</p>
                      </div>
                    )}
                    {result.availability.commonBrands && result.availability.commonBrands.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Common Brands</p>
                        <p className="text-gray-700">{result.availability.commonBrands.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </div>

                {(result.storageAdvice || result.shelfLife) && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Storage Information</h4>
                    {result.storageAdvice && (
                      <p className="text-gray-700 mb-2">{result.storageAdvice}</p>
                    )}
                    {result.shelfLife && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Typical Shelf Life:</span> {result.shelfLife}
                      </p>
                    )}
                  </div>
                )}

                <Button onClick={reset} variant="outline" className="w-full">
                  Scan Another Item
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}