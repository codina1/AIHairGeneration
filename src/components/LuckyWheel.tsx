import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Box, Button, Text, VStack, useToast } from '@chakra-ui/react'

const PRIZES = [
  { id: 1, text: 'کد تخفیف 50%', color: '#FF6B6B' },
  { id: 2, text: 'کد تخفیف 30%', color: '#4ECDC4' },
  { id: 3, text: 'کد تخفیف 20%', color: '#FFD93D' },
  { id: 4, text: 'کد تخفیف 10%', color: '#95E1D3' },
  { id: 5, text: 'کد تخفیف 5%', color: '#F8B195' }
]

interface LuckyWheelProps {
  onSpinComplete: (prize: string) => void
}

export const LuckyWheel: React.FC<LuckyWheelProps> = ({ onSpinComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null)
  const toast = useToast()

  const spinWheel = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setSelectedPrize(null)

    // انتخاب تصادفی جایزه
    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)]
    
    // محاسبه زاویه چرخش
    const prizeIndex = PRIZES.findIndex(p => p.id === randomPrize.id)
    const prizeAngle = (prizeIndex * (360 / PRIZES.length))
    const extraSpins = 5 // تعداد دورهای اضافی
    const totalRotation = 360 * extraSpins + prizeAngle

    setRotation(prev => prev + totalRotation)

    // اتمام چرخش
    setTimeout(() => {
      setIsSpinning(false)
      setSelectedPrize(randomPrize.text)
      onSpinComplete(randomPrize.text)
      
      toast({
        title: 'تبریک!',
        description: `شما ${randomPrize.text} برنده شدید!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }, 5000)
  }

  return (
    <VStack spacing={8} w="full" align="center">
      <Box position="relative" w="300px" h="300px">
        {/* گردونه */}
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `conic-gradient(${PRIZES.map((prize, index) => 
              `${prize.color} ${index * (360 / PRIZES.length)}deg ${(index + 1) * (360 / PRIZES.length)}deg`
            ).join(', ')})`,
            boxShadow: '0 0 20px rgba(0,0,0,0.2)'
          }}
          animate={{ rotate: rotation }}
          transition={{ 
            duration: 5,
            ease: [0.2, 0.8, 0.2, 1],
            times: [0, 0.2, 0.8, 1]
          }}
        />

        {/* نشانگر */}
        <Box
          position="absolute"
          top="-10px"
          left="50%"
          transform="translateX(-50%)"
          width="0"
          height="0"
          borderLeft="10px solid transparent"
          borderRight="10px solid transparent"
          borderTop="20px solid #fff"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          zIndex={2}
        />

        {/* متن‌های جایزه */}
        {PRIZES.map((prize, index) => {
          const angle = (index * (360 / PRIZES.length) + (360 / PRIZES.length) / 2) * (Math.PI / 180)
          const radius = 120
          const x = Math.sin(angle) * radius
          const y = -Math.cos(angle) * radius

          return (
            <Text
              key={prize.id}
              position="absolute"
              left={`calc(50% + ${x}px)`}
              top={`calc(50% + ${y}px)`}
              transform="translate(-50%, -50%) rotate(90deg)"
              color="white"
              fontWeight="bold"
              fontSize="sm"
              textShadow="1px 1px 2px rgba(0,0,0,0.5)"
              zIndex={1}
            >
              {prize.text}
            </Text>
          )
        })}
      </Box>

      {/* دکمه چرخش */}
      <Button
        onClick={spinWheel}
        isDisabled={isSpinning}
        colorScheme="blue"
        size="lg"
        width="200px"
        isLoading={isSpinning}
        loadingText="در حال چرخش..."
      >
        چرخش گردونه
      </Button>

      {/* نمایش جایزه انتخاب شده */}
      {selectedPrize && (
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="green.500"
          animation="bounce 1s infinite"
        >
          تبریک! شما {selectedPrize} برنده شدید!
        </Text>
      )}
    </VStack>
  )
} 