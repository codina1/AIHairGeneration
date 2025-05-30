import * as tf from '@tensorflow/tfjs'
import { loadGraphModel } from '@tensorflow/tfjs-converter'
import { REPLICATE_API_TOKEN } from '../config'

let model: tf.GraphModel | null = null

async function loadModel() {
  if (!model) {
    try {
      // لود کردن مدل از فایل محلی
      model = await loadGraphModel('/models/hair_generator/model.json')
      console.log('Model loaded successfully')
    } catch (error) {
      console.error('Error loading model:', error)
      throw new Error('خطا در بارگذاری مدل')
    }
  }
  return model
}

// تعریف مدل‌های مو
const HAIR_STYLES = [
  {
    name: 'موی کوتاه',
    image: '/images/hair/short.png',
    offsetY: 0.05,
    scale: 0.9,
    headWidth: 0.7,
    headHeight: 0.4
  },
  {
    name: 'موی بلند',
    image: '/images/hair/long.png',
    offsetY: 0.02,
    scale: 1.1,
    headWidth: 0.7,
    headHeight: 0.4
  },
  {
    name: 'موی موج‌دار',
    image: '/images/hair/wavy.png',
    offsetY: 0.03,
    scale: 1.0,
    headWidth: 0.7,
    headHeight: 0.4
  }
]

export async function processImage(imageUrl: string, hairStyleIndex: number = 0): Promise<string> {
  try {
    // ایجاد تصویر اصلی
    const mainImage = new Image()
    mainImage.src = imageUrl
    await new Promise((resolve) => {
      mainImage.onload = resolve
    })

    // ایجاد تصویر مو
    const hairStyle = HAIR_STYLES[hairStyleIndex]
    const hairImage = new Image()
    hairImage.src = hairStyle.image
    await new Promise((resolve, reject) => {
      hairImage.onload = resolve
      hairImage.onerror = () => reject(new Error(`خطا در لود کردن تصویر مو: ${hairStyle.image}`))
    })

    // ایجاد canvas
    const canvas = document.createElement('canvas')
    canvas.width = mainImage.width
    canvas.height = mainImage.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('خطا در ایجاد canvas')

    // کشیدن تصویر اصلی
    ctx.drawImage(mainImage, 0, 0)

    // محاسبه موقعیت و اندازه مو
    const headWidth = canvas.width * hairStyle.headWidth
    const headHeight = canvas.height * hairStyle.headHeight
    const headX = (canvas.width - headWidth) / 2
    const headY = canvas.height * hairStyle.offsetY

    // کشیدن مو
    ctx.drawImage(
      hairImage,
      headX - (headWidth * (hairStyle.scale - 1)) / 2,
      headY - (headHeight * (hairStyle.scale - 1)) / 2,
      headWidth * hairStyle.scale,
      headHeight * hairStyle.scale
    )

    // اضافه کردن سایه برای طبیعی‌تر شدن
    const shadowGradient = ctx.createRadialGradient(
      headX + headWidth / 2,
      headY + headHeight / 2,
      0,
      headX + headWidth / 2,
      headY + headHeight / 2,
      headWidth * 1.5
    )
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)')
    shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)')
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = shadowGradient
    ctx.fillRect(headX - headWidth, headY - headHeight, headWidth * 3, headHeight * 3)

    return canvas.toDataURL('image/jpeg')
  } catch (error) {
    console.error('Error processing image:', error)
    throw error
  }
}

export async function processImageWithTensorFlow(imageUrl: string): Promise<string> {
  try {
    const model = await loadModel()
    
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