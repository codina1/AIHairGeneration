import { ChakraProvider, Box, VStack, Heading, Text, Button, useToast, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react'
import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import { processImage } from './services/ai'

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setProcessedImage(null)
    setError(null)
  }

  const handleProcess = async () => {
    if (!selectedImage) return
    setIsProcessing(true)
    setError(null)
    try {
      const result = await processImage(selectedImage)
      setProcessedImage(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50" py={10}>
        <VStack spacing={8} maxW="container.md" mx="auto" px={4}>
          <Heading>AI Hair Change</Heading>
          <Text>Upload your photo and see how you would look with different hairstyles!</Text>
          <ImageUploader onImageSelect={handleImageSelect} />
          {selectedImage && (
            <Button
              colorScheme="blue"
              onClick={handleProcess}
              isLoading={isProcessing}
              loadingText="Processing..."
            >
              Process Image
            </Button>
          )}
          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {processedImage && (
            <Box>
              <Heading size="md" mb={4}>Result</Heading>
              <img src={processedImage} alt="Processed" style={{ maxWidth: '100%' }} />
            </Box>
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  )
}

export default App 