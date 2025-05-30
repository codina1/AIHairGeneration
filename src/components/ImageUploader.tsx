import React from 'react'
import { Box, Button, Image, VStack } from '@chakra-ui/react'

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        onImageUpload(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <VStack spacing={4} w="full">
      <Box
        border="2px dashed"
        borderColor="gray.300"
        borderRadius="lg"
        p={6}
        w="full"
        textAlign="center"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button
            as="span"
            colorScheme="blue"
            cursor="pointer"
            size="lg"
          >
            انتخاب عکس
          </Button>
        </label>
      </Box>
    </VStack>
  )
} 