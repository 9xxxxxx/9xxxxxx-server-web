"use client";

/**
 * 图片编辑器组件
 * 
 * 功能：
 * - 图片裁剪、旋转、缩放
 * - 支持上传和 URL 输入
 * - 预览和确认
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import {
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Upload,
  Link as LinkIcon,
  Check,
  RefreshCw,
} from 'lucide-react'

interface ImageEditorProps {
  /** 初始图片 URL（编辑模式） */
  initialImage?: string
  /** 完成回调，返回最终图片 URL */
  onComplete: (imageUrl: string) => void
  /** 取消回调 */
  onCancel: () => void
  /** 裁剪比例 */
  aspect?: number
  /** 上传处理函数 */
  onUpload?: (file: File) => Promise<string>
}

export default function ImageEditor({
  initialImage,
  onComplete,
  onCancel,
  aspect = 16 / 9,
  onUpload,
}: ImageEditorProps) {
  const [imageUrl, setImageUrl] = useState(initialImage || '')
  const [urlInput, setUrlInput] = useState('')
  const [mode, setMode] = useState<'select' | 'edit'>(initialImage ? 'edit' : 'select')
  
  // 裁剪状态
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // 文件选择处理
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (onUpload) {
      // 如果有上传函数，先上传再编辑
      setIsUploading(true)
      try {
        const url = await onUpload(file)
        setImageUrl(url)
        setMode('edit')
      } catch (error) {
        console.error('Upload failed:', error)
        alert('图片上传失败')
      } finally {
        setIsUploading(false)
      }
    } else {
      // 没有上传函数，使用本地预览
      const objectUrl = URL.createObjectURL(file)
      setImageUrl(objectUrl)
      setMode('edit')
    }
  }

  // URL 输入处理
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return
    setImageUrl(urlInput.trim())
    setMode('edit')
    setUrlInput('')
  }

  // 裁剪完成
  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // 创建裁剪后的图片
  const createCroppedImage = async (): Promise<string> => {
    if (!croppedAreaPixels || !imageUrl) return imageUrl

    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(imageUrl)
          return
        }

        // 设置画布大小为裁剪区域
        canvas.width = croppedAreaPixels.width
        canvas.height = croppedAreaPixels.height

        // 绘制裁剪区域
        ctx.save()
        
        // 如果有旋转，需要额外处理
        if (rotation !== 0) {
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          ctx.translate(centerX, centerY)
          ctx.rotate((rotation * Math.PI) / 180)
          ctx.translate(-centerX, -centerY)
        }

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        )
        
        ctx.restore()

        // 转换为 blob URL 或 base64
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(imageUrl)
              return
            }
            const url = URL.createObjectURL(blob)
            resolve(url)
          },
          'image/jpeg',
          0.9
        )
      }
      
      image.onerror = () => {
        // 加载失败，返回原始 URL
        resolve(imageUrl)
      }
      
      image.src = imageUrl
    })
  }

  // 确认完成
  const handleConfirm = async () => {
    // 如果没有裁剪，直接返回原图
    if (zoom === 1 && rotation === 0 && crop.x === 0 && crop.y === 0) {
      onComplete(imageUrl)
      return
    }

    try {
      const croppedUrl = await createCroppedImage()
      onComplete(croppedUrl)
    } catch (error) {
      console.error('Crop failed:', error)
      onComplete(imageUrl)
    }
  }

  // 旋转
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // 重置
  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {mode === 'select' ? '选择图片' : '编辑图片'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6">
          {mode === 'select' ? (
            // 选择模式
            <div className="space-y-6">
              {/* 上传区域 */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  点击上传图片
                </p>
                <p className="text-xs text-slate-400">
                  支持 JPG、PNG、GIF、WebP
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* 分隔线 */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400">或</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* URL 输入 */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    placeholder="输入图片 URL..."
                    className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  确定
                </button>
              </div>

              {isUploading && (
                <div className="text-center text-sm text-slate-500">
                  <RefreshCw className="w-4 h-4 inline animate-spin mr-2" />
                  上传中...
                </div>
              )}
            </div>
          ) : (
            // 编辑模式
            <div className="space-y-4">
              {/* 裁剪区域 */}
              <div className="relative h-80 bg-slate-900 rounded-xl overflow-hidden">
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* 控制工具栏 */}
              <div className="flex items-center justify-center gap-4">
                {/* 缩小 */}
                <button
                  onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="缩小"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                {/* 缩放滑块 */}
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-32 accent-indigo-600"
                />

                {/* 放大 */}
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="放大"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

                {/* 旋转 */}
                <button
                  onClick={handleRotate}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="旋转 90°"
                >
                  <RotateCw className="w-5 h-5" />
                </button>

                {/* 重置 */}
                <button
                  onClick={handleReset}
                  className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="重置"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {mode === 'edit' && (
            <button
              onClick={() => {
                setMode('select')
                setImageUrl('')
                handleReset()
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              重新选择
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            取消
          </button>
          {mode === 'edit' && (
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              确认
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
