import React, { useState } from 'react'
import { ChakraProvider, Box, VStack, Heading, Text, Button, Image, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Input, FormControl, FormLabel, useToast, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react'
import { processImage } from './services/ai'
import { ImageUploader } from './components/ImageUploader'
import { HairStyleSelector } from './components/HairStyleSelector'
import { LuckyWheel } from './components/LuckyWheel'
import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [selectedHairStyle, setSelectedHairStyle] = useState(0)
  const [showWheel, setShowWheel] = useState(false)
  const [prize, setPrize] = useState<string | null>(null)

  const handleImageUpload = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setProcessedImage(null)
    setError(null)
  }

  const handleHairStyleChange = (index: number) => {
    setSelectedHairStyle(index)
    setProcessedImage(null)
    setError(null)
  }

  const handleProcessImage = async () => {
    if (!selectedImage) return

    setIsProcessing(true)
    setError(null)

    try {
      const result = await processImage(selectedImage, selectedHairStyle)
      setProcessedImage(result)
      onOpen()
    } catch (err) {
      setError('خطا در پردازش تصویر')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.length === 11) {
      setShowWheel(true)
      onClose()
    }
  }

  const handleSpinComplete = (prize: string) => {
    setPrize(prize)
  }

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50" py={10}>
        <VStack spacing={8} maxW="800px" mx="auto" px={4}>
          <Heading>تغییر مدل مو با هوش مصنوعی</Heading>
          <Text textAlign="center">
            عکس خود را آپلود کنید تا با هوش مصنوعی ببینید بعد از کاشت مو چه شکلی میشید
          </Text>

          <ImageUploader onImageUpload={handleImageUpload} />
          
          {selectedImage && (
            <>
              <HairStyleSelector
                selectedStyle={selectedHairStyle}
                onStyleChange={handleHairStyleChange}
              />

              <Button
                onClick={handleProcessImage}
                isLoading={isProcessing}
                loadingText="در حال پردازش..."
                colorScheme="blue"
                size="lg"
                width="full"
              >
                پردازش تصویر
              </Button>
            </>
          )}

          {error && (
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>خطا!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}

          {selectedImage && (
            <Box w="full">
              <Heading size="md" mb={4}>تصویر اصلی:</Heading>
              <Image
                src={selectedImage}
                alt="تصویر اصلی"
                borderRadius="lg"
                w="full"
                h="auto"
              />
            </Box>
          )}
          
          {processedImage && (
            <Box w="full">
              <Heading size="md" mb={4}>تصویر پردازش شده:</Heading>
              <Image
                src={processedImage}
                alt="تصویر پردازش شده"
                borderRadius="lg"
                w="full"
                h="auto"
              />
            </Box>
          )}
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>شانس خود را برای کاشت مو رایگان امتحان کنید!</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>شماره تماس خود را وارد کنید</FormLabel>
                <Input
                  placeholder="شماره تماس"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={11}
                />
              </FormControl>
              <Button
                mt={4}
                colorScheme="blue"
                onClick={handlePhoneSubmit}
                isDisabled={phoneNumber.length !== 11}
                width="full"
              >
                دریافت جایزه
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>

        {showWheel && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.8)"
            zIndex={1000}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              bg="white"
              p={8}
              borderRadius="xl"
              maxW="500px"
              w="full"
              mx={4}
            >
              <Heading size="lg" mb={6} textAlign="center">گردونه شانس</Heading>
              <LuckyWheel onSpinComplete={handleSpinComplete} />
            </Box>
          </Box>
        )}

        {prize && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.8)"
            zIndex={1000}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              bg="white"
              p={8}
              borderRadius="xl"
              maxW="500px"
              w="full"
              mx={4}
              textAlign="center"
            >
              <Heading size="lg" color="green.500" mb={4}>تبریک!</Heading>
              <Text fontSize="xl" mb={4}>
                شما {prize} برنده شدید!
              </Text>
              <Text color="gray.600" mb={6}>
                کد تخفیف به شماره {phoneNumber} ارسال خواهد شد.
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => {
                  setShowWheel(false)
                  setPrize(null)
                }}
              >
                بستن
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </ChakraProvider>
  )
}

export default App 