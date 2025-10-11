// src/components/ai/FoodQualityChecker.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Scan,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Sparkles,
  Loader2,
  Info,
  ThumbsUp,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { aiService, FoodQualityResult } from '@/lib/aiService';

interface FoodQualityCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  onResult?: (result: FoodQualityResult) => void;
}

const FoodQualityChecker: React.FC<FoodQualityCheckerProps> = ({ 
  isOpen, 
  onClose, 
  onResult 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [foodType, setFoodType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodQualityResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'result'>('upload');

  const foodTypes = [
    'bread', 'fresh produce', 'vegetables', 'fruit', 'dairy', 
    'meat', 'prepared meals', 'canned goods', 'other'
  ];

  // Helper functions moved inside component
  const getShelfLifeForType = (foodType?: string): string => {
    const shelfLifeMap: Record<string, string> = {
      'bread': '3-7 days at room temperature, 2-3 weeks frozen',
      'fresh produce': '3-14 days depending on type and storage',
      'vegetables': '1-2 weeks refrigerated, varies by type',
      'fruit': '3-10 days at room temperature, longer refrigerated',
      'dairy': '1-2 weeks past sell-by date if refrigerated',
      'meat': '1-3 days refrigerated, 3-6 months frozen',
      'prepared meals': '3-4 days refrigerated, 2-3 months frozen',
      'canned goods': '2-5 years from manufacture date',
      'other': '1-7 days depending on food type'
    };
    
    return shelfLifeMap[foodType || 'other'] || 'Varies by food type and storage conditions';
  };

  const getRecommendationsForType = (foodType?: string): string[] => {
    const recommendationMap: Record<string, string[]> = {
      'bread': [
        'Store in cool, dry place away from direct sunlight',
        'Keep in original packaging or airtight container',
        'Freeze for longer storage',
        'Check for mold before consuming'
      ],
      'fresh produce': [
        'Store in refrigerator crisper drawer',
        'Keep fruits and vegetables separate',
        'Don\'t wash until ready to use',
        'Remove any spoiled items immediately'
      ],
      'vegetables': [
        'Store in refrigerator at 4°C or below',
        'Keep in perforated plastic bags for humidity',
        'Store root vegetables in cool, dark place',
        'Use within recommended timeframe'
      ],
      'fruit': [
        'Store ripe fruit in refrigerator',
        'Keep unripe fruit at room temperature',
        'Store bananas separately from other fruits',
        'Check regularly for signs of overripeness'
      ],
      'dairy': [
        'Keep refrigerated at 4°C or below',
        'Store in original containers',
        'Keep away from strong-smelling foods',
        'Check expiration dates regularly'
      ],
      'meat': [
        'Store in refrigerator at 4°C or below',
        'Use within 1-2 days of purchase',
        'Freeze if not using immediately',
        'Keep separate from other foods to prevent cross-contamination'
      ],
      'prepared meals': [
        'Refrigerate within 2 hours of cooking',
        'Store in shallow containers for quick cooling',
        'Reheat to 74°C before consuming',
        'Label with date prepared'
      ],
      'canned goods': [
        'Store in cool, dry place',
        'Check cans for dents or rust',
        'Use oldest items first',
        'Transfer to refrigerator after opening'
      ]
    };
    
    return recommendationMap[foodType || 'other'] || [
      'Store at appropriate temperature',
      'Check for signs of spoilage regularly',
      'Follow basic food safety guidelines',
      'When in doubt, don\'t consume'
    ];
  };

  const getFoodNameForType = (foodType?: string): string => {
    const nameMap: Record<string, string> = {
      'bread': 'Bread Loaf',
      'fresh produce': 'Fresh Produce Item',
      'vegetables': 'Fresh Vegetable',
      'fruit': 'Fresh Fruit',
      'dairy': 'Dairy Product',
      'meat': 'Meat Product',
      'prepared meals': 'Prepared Meal',
      'canned goods': 'Canned Food Item',
      'other': 'Food Item'
    };
    
    return nameMap[foodType || 'other'] || 'Food Item';
  };

  const getNutritionForType = (foodType?: string): string[] => {
    const nutritionMap: Record<string, string[]> = {
      'bread': ['Carbohydrates for energy', 'B vitamins', 'Iron', 'Fiber (if whole grain)'],
      'fresh produce': ['Vitamins and minerals', 'Fiber', 'Antioxidants', 'Low calories'],
      'vegetables': ['Vitamin A', 'Vitamin C', 'Folate', 'Potassium', 'Fiber'],
      'fruit': ['Vitamin C', 'Fiber', 'Natural sugars', 'Antioxidants', 'Potassium'],
      'dairy': ['Calcium', 'Protein', 'Vitamin D', 'Riboflavin', 'Phosphorus'],
      'meat': ['High-quality protein', 'Iron', 'Zinc', 'B vitamins', 'Essential amino acids'],
      'prepared meals': ['Varies by ingredients', 'May contain balanced nutrients', 'Check labels for details'],
      'canned goods': ['Long-term nutrition source', 'Varies by product', 'Often fortified with vitamins']
    };
    
    return nutritionMap[foodType || 'other'] || [
      'Nutritional content varies',
      'May provide essential nutrients',
      'Check product labels for details'
    ];
  };

  const handleImageSelect = (file: File) => {
    console.log('handleImageSelect called with file:', file);
    
    if (!file) {
      console.log('No file provided');
      return;
    }
    
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
if (!file.type.startsWith('image/')) {
  console.log('Invalid file type:', file.type);
  toast({
    title: 'Invalid file type',
    description: 'Please select a JPG, PNG, or WebP image file. HEIC files are not supported.',
    variant: 'destructive'
  });
  return;
}

// Add HEIC check
if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
  toast({
    title: 'HEIC format not supported',
    description: 'Please convert to JPG or PNG, or take a new photo in a different format.',
    variant: 'destructive'
  });
  return;
}

    console.log('Creating FileReader...');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log('FileReader onload triggered');
      const imageData = e.target?.result as string;
      console.log('Image data length:', imageData?.length);
      console.log('Image data preview:', imageData?.substring(0, 50) + '...');
      
      setSelectedImage(imageData);
      console.log('Selected image set, NOT moving to analyze step automatically');
      // Don't automatically move to analyze step - let user click the button
    };
    
    reader.onerror = (e) => {
      console.error('FileReader error:', e);
      toast({
        title: 'Error reading file',
        description: 'Unable to read the selected image',
        variant: 'destructive'
      });
    };
    
    console.log('Starting to read file as data URL...');
    reader.readAsDataURL(file);
  };

// REPLACE YOUR handleAnalyze FUNCTION IN FoodQualityChecker.tsx WITH THIS:

const handleAnalyze = async () => {
  if (!selectedImage) {
    console.log('No image selected for analysis');
    return;
  }

  console.log('🔍 Starting food analysis...');
  setIsAnalyzing(true);
  setCurrentStep('analyze');

  // Timeout fallback
  const analysisTimeout = setTimeout(() => {
    console.log('⏱️ Analysis timeout - using demo result');
    setIsAnalyzing(false);
    
    const demoResult: FoodQualityResult = {
      quality: 'good',
      confidence: 0.8,
      shelfLife: getShelfLifeForType(foodType),
      recommendations: getRecommendationsForType(foodType),
      safetyNotes: ['Demo result - manual inspection recommended'],
      foodName: getFoodNameForType(foodType) + ' (Demo)',
      freshness: 'Unable to assess - AI service timeout',
      nutritionalHighlights: getNutritionForType(foodType),
      visualObservations: ['Analysis timed out - manual inspection needed'],
      distributionSuitability: 'conditional',
      reasoningDetails: 'AI analysis timed out after 15 seconds'
    };
    
    setResult(demoResult);
    setCurrentStep('result');
    onResult?.(demoResult);
    
    toast({
      title: 'Analysis Timeout',
      description: 'Using demo result - please try again',
      variant: 'default'
    });
  }, 15000); // 15 second timeout

  try {
    console.log('🤖 Calling AI service with Gemini...');
    
    // TRY GEMINI FIRST (this is the new method)
   const analysisResult = await aiService.assessFoodQuality(selectedImage, foodType);
    
    clearTimeout(analysisTimeout);
    console.log('✅ Analysis completed:', analysisResult);
    
    setResult(analysisResult);
    setCurrentStep('result');
    onResult?.(analysisResult);
    
    toast({
      title: '✨ Analysis Complete',
      description: `Food assessed as ${analysisResult.quality}`,
    });
    
  } catch (error) {
    clearTimeout(analysisTimeout);
    console.error('❌ Analysis error:', error);
    
    // Fallback result
    const fallbackResult: FoodQualityResult = {
      quality: 'good',
      confidence: 0.75,
      shelfLife: getShelfLifeForType(foodType),
      recommendations: [
        'AI analysis unavailable - inspect manually',
        ...getRecommendationsForType(foodType)
      ],
      safetyNotes: ['Manual inspection required'],
      foodName: getFoodNameForType(foodType),
      freshness: 'Unable to assess automatically',
      nutritionalHighlights: getNutritionForType(foodType),
      visualObservations: ['AI analysis unavailable'],
      distributionSuitability: 'conditional',
      reasoningDetails: error instanceof Error ? error.message : 'AI service error'
    };
    
    setResult(fallbackResult);
    setCurrentStep('result');
    onResult?.(fallbackResult);
    
    toast({
      title: 'Using Fallback',
      description: 'AI unavailable - showing manual guidance',
      variant: 'destructive'
    });
  } finally {
    setIsAnalyzing(false);
  }
};

  const handleReset = () => {
    setSelectedImage(null);
    setFoodType('');
    setResult(null);
    setCurrentStep('upload');
  };

  const getQualityIcon = (quality: FoodQualityResult['quality']) => {
    switch (quality) {
      case 'excellent': return ThumbsUp;
      case 'good': return CheckCircle;
      case 'fair': return AlertTriangle;
      case 'poor': return AlertCircle;
      case 'unsafe': return XCircle;
      default: return Info;
    }
  };

  const getQualityColor = (quality: FoodQualityResult['quality']) => {
    switch (quality) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'unsafe': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
    // Only close if clicking the background, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/30 overflow-hidden"
      >
        <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Scan className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Food Information Assessment</CardTitle>
                <p className="text-white/80 text-sm">
                  Upload a photo to check food Details,Safety, Quality etc.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 flex items-center space-x-4">
            {['upload', 'analyze', 'result'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                  currentStep === step 
                    ? 'bg-white text-emerald-600 border-white' 
                    : index < ['upload', 'analyze', 'result'].indexOf(currentStep)
                    ? 'bg-white/20 text-white border-white/20'
                    : 'bg-white/10 text-white/60 border-white/20'
                }`}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    index < ['upload', 'analyze', 'result'].indexOf(currentStep)
                      ? 'bg-white/40'
                      : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

       <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Upload Image */}
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Upload Food Image</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Take a photo or upload an image of the food you want to assess
                  </p>
                </div>

                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="Selected food"
                        className="w-full h-64 object-cover rounded-2xl border border-gray-200"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label>Food Type (Optional)</Label>
                      <Select value={foodType} onValueChange={setFoodType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select food type for better accuracy" />
                        </SelectTrigger>
                        <SelectContent>
                          {foodTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleAnalyze}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      size="lg"
                    >
                      <Scan className="w-5 h-5 mr-2" />
                      Analyze Food Quality
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log('Camera button clicked');
                          cameraInputRef.current?.click();
                        }}
                        className="h-32 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300"
                      >
                        <Camera className="w-8 h-8 text-gray-400" />
                        <span className="font-medium">Take Photo</span>
                        <span className="text-sm text-gray-500">Use your camera</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log('Upload button clicked');
                          fileInputRef.current?.click();
                        }}
                        className="h-32 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="font-medium">Upload Image</span>
                        <span className="text-sm text-gray-500">From your device</span>
                      </Button>
                    </div>

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        console.log('Camera input change event:', e.target.files);
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageSelect(file);
                        } else {
                          console.log('No file selected from camera input');
                        }
                      }}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        console.log('File input change event:', e.target.files);
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageSelect(file);
                        } else {
                          console.log('No file selected from file input');
                        }
                      }}
                      className="hidden"
                    />

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Tips for best results:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Take photos in good lighting</li>
                            <li>• Show the food clearly and up close</li>
                            <li>• Include the full item or portion</li>
                            <li>• Avoid shadows or reflections</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Analyzing */}
            {currentStep === 'analyze' && (
              <motion.div
                key="analyze"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center relative">
                    <Scan className="w-10 h-10 text-white" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 border-4 border-white/30 border-t-white rounded-3xl animate-spin" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Food Quality</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Our AI is examining your image for freshness, safety, and quality indicators...
                    </p>
                  </div>

                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt="Analyzing"
                      className="w-48 h-32 object-cover rounded-xl mx-auto border border-gray-200"
                    />
                  )}
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    This usually takes 5-10 seconds...
                  </span>
                </div>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {currentStep === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Food Analysis Complete</h3>
                  <p className="text-gray-600">Detailed assessment of your food item</p>
                </div>

                {/* Food Identification */}
                {result.foodName && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Identified Food</h4>
                      <p className="text-blue-800">{result.foodName}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Quality Score */}
                <Card className={`border-2 ${getQualityColor(result.quality)}`}>
                  <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {React.createElement(getQualityIcon(result.quality), {
                          className: `w-12 h-12 ${getQualityColor(result.quality).split(' ')[0]}`
                        })}
                        <div>
                          <h4 className="text-2xl font-bold capitalize">{result.quality}</h4>
                          <p className="text-sm opacity-80">Quality Assessment</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">
                          {Math.round(result.confidence * 100)}%
                        </div>
                        <p className="text-sm opacity-80">Confidence</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold">Shelf Life</h4>
                      </div>
                      <p className="text-lg font-medium">{result.shelfLife}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-semibold">Safety Status</h4>
                      </div>
                      <Badge className={getQualityColor(result.quality)}>
                        {result.quality === 'unsafe' ? 'Do not consume' : 'Safe to distribute'}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Freshness Assessment */}
                {result.freshness && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-green-600" />
                        Freshness Assessment
                      </h4>
                      <p className="text-sm">{result.freshness}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Visual Observations */}
                {result.visualObservations && result.visualObservations.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Visual Analysis</h4>
                      <ul className="space-y-1">
                        {result.visualObservations.map((obs: string, index: number) => (
                          <li key={index} className="text-sm flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                            <span>{obs}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Nutritional Highlights */}
                {result.nutritionalHighlights && result.nutritionalHighlights.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Nutritional Information</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {result.nutritionalHighlights.map((highlight: string, index: number) => (
                          <div key={index} className="text-sm bg-green-50 p-2 rounded">
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Safety Notes */}
                {result.safetyNotes.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center text-orange-800">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Safety Notes
                      </h4>
                      <ul className="space-y-1">
                        {result.safetyNotes.map((note, index) => (
                          <li key={index} className="text-sm text-orange-700">
                            • {note}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    Analyze Another Item
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </motion.div>
    </motion.div>
  );
};

export default FoodQualityChecker;