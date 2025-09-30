import React, { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ 
  value, 
  size = 200, 
  level = 'M',
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    // Simple QR code generation using a library-like approach
    // In a real app, you'd use a library like qrcode.js
    generateQRCode(canvasRef.current, value, size);
  }, [value, size]);

  const generateQRCode = (canvas: HTMLCanvasElement, text: string, size: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Simple pattern generation (mockup)
    // In production, use a proper QR code library
    const moduleSize = size / 25; // 25x25 grid
    ctx.fillStyle = '#000000';

    // Generate a pseudo-QR pattern based on the text hash
    const hash = simpleHash(text);
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if (shouldDrawModule(i, j, hash)) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add corner squares (finder patterns)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, 0, 18, moduleSize);
    drawFinderPattern(ctx, 18, 0, moduleSize);

    // Add logo space in center
    const logoSize = moduleSize * 5;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(logoX, logoY, logoSize, logoSize);
    
    // Add a simple logo
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, logoSize / 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add Om symbol or temple icon in center
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${moduleSize * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ॐ', size / 2, size / 2);
  };

  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const shouldDrawModule = (row: number, col: number, hash: number): boolean => {
    // Skip finder pattern areas
    if ((row < 9 && col < 9) || 
        (row < 9 && col > 15) || 
        (row > 15 && col < 9)) {
      return false;
    }
    
    // Skip center logo area
    if (row >= 10 && row <= 14 && col >= 10 && col <= 14) {
      return false;
    }

    // Pseudo-random pattern based on position and hash
    return ((row * col + hash) % 3) === 0;
  };

  const drawFinderPattern = (ctx: CanvasRenderingContext2D, startX: number, startY: number, moduleSize: number) => {
    // Outer square
    ctx.fillStyle = '#000000';
    ctx.fillRect(startX * moduleSize, startY * moduleSize, 7 * moduleSize, 7 * moduleSize);
    
    // Inner white square
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect((startX + 1) * moduleSize, (startY + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
    
    // Center black square
    ctx.fillStyle = '#000000';
    ctx.fillRect((startX + 2) * moduleSize, (startY + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'family-invite-qr.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="border border-gray-200 rounded-lg shadow-sm"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <button
        onClick={downloadQRCode}
        className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
      >
        <Icon icon="solar:download-bold-duotone" className="text-lg" />
        Download QR Code
      </button>
      <p className="mt-2 text-xs text-gray-500 text-center max-w-48">
        Family members can scan this QR code to join your group
      </p>
    </div>
  );
};

export default QRCode;