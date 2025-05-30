import * as tf from '@tensorflow/tfjs'

const MODEL_URL = '/AIHairGeneration/models/hair_generator/model.json'

let model: tf.GraphModel | null = null

async function loadModel() {
  if (!model) {
    try {
      model = await tf.loadGraphModel(MODEL_URL)
      console.log('Model loaded successfully')
    } catch (error) {
      console.error('Error loading model:', error)
      throw new Error('Failed to load model')
    }
  }
  return model
}

export async function processImage(imageUrl: string): Promise<string> {
  try {
    // Load and preprocess the image
    const img = new window.Image()
    img.src = imageUrl
    await new Promise((resolve) => {
      img.onload = resolve
    })

    // Convert image to tensor
    const tensor = tf.browser.fromPixels(img)
      .resizeBilinear([256, 256])
      .expandDims(0)
      .div(255.0)

    // Load model if not loaded
    const model = await loadModel()

    // Run inference
    const result = model.predict(tensor) as tf.Tensor;

    // Handle output tensor shape
    let tensor3d: tf.Tensor3D;
    let squeezed: tf.Tensor | null = null;
    if (result.rank === 4) {
      squeezed = result.squeeze();
      if (squeezed.rank === 3) {
        tensor3d = squeezed as unknown as tf.Tensor3D;
      } else {
        tensor3d = squeezed.expandDims(-1) as unknown as tf.Tensor3D;
      }
    } else if (result.rank === 3) {
      tensor3d = result as unknown as tf.Tensor3D;
    } else if (result.rank === 2) {
      tensor3d = result.expandDims(-1) as unknown as tf.Tensor3D;
    } else {
      throw new Error('Unexpected output tensor rank: ' + result.rank);
    }
    // @ts-ignore
    const outputArray = await tf.browser.toPixels(tensor3d);
    
    // Create canvas and draw result
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    const imageData = new ImageData(outputArray, 256, 256)
    ctx.putImageData(imageData, 0, 0)

    // Clean up tensors
    tensor.dispose();
    if (squeezed) squeezed.dispose();
    if (tensor3d !== result && tensor3d !== squeezed) tensor3d.dispose();
    result.dispose();

    return canvas.toDataURL('image/jpeg')
  } catch (error) {
    console.error('Error processing image:', error)
    throw new Error('Failed to process image')
  }
}

export async function processImageWithTensorFlow(imageUrl: string): Promise<string> {
  try {
    // تبدیل تصویر به تنسور
    const img = new Image()
    img.src = imageUrl
    await new Promise((resolve) => {
      img.onload = resolve
    })

    // پیش‌پردازش تصویر
    const tensor = tf.browser.fromPixels(img)
      .resizeBilinear([256, 256])
      .expandDims(0)
      .div(255.0)

    // تشخیص ناحیه سر
    const headMask = tf.tidy(() => {
      const gray = tensor.mean(3)
      const threshold = tf.scalar(0.5)
      return gray.greater(threshold)
    })

    // تولید مو
    const hairTensor = tf.tidy(() => {
      // ایجاد گرادیان برای مو
      const gradient = tf.linspace(0, 1, 256)
      const hairPattern = gradient.expandDims(1).tile([1, 256])
      
      // اضافه کردن نویز برای طبیعی‌تر شدن
      const noise = tf.randomNormal([256, 256], 0, 0.1)
      return hairPattern.add(noise).clipByValue(0, 1)
    })

    // ترکیب تصویر اصلی با مو
    const result = tf.tidy(() => {
      const hairMask = headMask.expandDims(2).tile([1, 1, 3])
      const hairColor = tf.scalar(0.2) // رنگ مو
      const hairEffect = hairTensor.expandDims(2).tile([1, 1, 3]).mul(hairColor)
      
      return tensor.mul(tf.scalar(1).sub(hairMask))
        .add(hairEffect.mul(hairMask))
    })

    // تبدیل نتیجه به تصویر
    // @ts-ignore
    const output = await tf.browser.toPixels(result.squeeze())
    
    // ایجاد canvas برای نمایش نتیجه
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('خطا در ایجاد canvas')
    
    const imageData = new ImageData(new Uint8ClampedArray(output), 256, 256)
    ctx.putImageData(imageData, 0, 0)
    
    // پاکسازی تنسورها
    tf.dispose([tensor, headMask, hairTensor, result])
    
    return canvas.toDataURL('image/jpeg')
  } catch (error) {
    console.error('Error processing image:', error)
    throw error
  }
} 