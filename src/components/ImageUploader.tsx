import { Button, VStack } from '@chakra-ui/react'
import { useRef } from 'react'

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void
}

const ImageUploader = ({ onImageSelect }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          onImageSelect(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <VStack spacing={4} w="full">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <Button
        colorScheme="blue"
        onClick={() => fileInputRef.current?.click()}
        w="full"
      >
        Upload Image
      </Button>
    </VStack>
  )
}

export default ImageUploader 