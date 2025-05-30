import React from 'react'
import { HStack, Button } from '@chakra-ui/react'

interface HairStyleSelectorProps {
  selectedStyle: number
  onStyleChange: (index: number) => void
}

export const HairStyleSelector: React.FC<HairStyleSelectorProps> = ({
  selectedStyle,
  onStyleChange,
}) => {
  const styles = ['موی کوتاه', 'موی بلند', 'موی موج‌دار']

  return (
    <HStack spacing={4} justify="center" w="full">
      {styles.map((style, index) => (
        <Button
          key={index}
          onClick={() => onStyleChange(index)}
          colorScheme={selectedStyle === index ? 'blue' : 'gray'}
          variant={selectedStyle === index ? 'solid' : 'outline'}
          size="lg"
        >
          {style}
        </Button>
      ))}
    </HStack>
  )
} 