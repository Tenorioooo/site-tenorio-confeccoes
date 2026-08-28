'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QuoteCartItem } from './utils';
import { calculateProductPrice, calculateDetailedProductPrice } from './pricing';

interface CartContextType {
  items: QuoteCartItem[];
  addItem: (item: Omit<QuoteCartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, newQty: number) => void;
  updateItem: (id: string, updated: Partial<QuoteCartItem>) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  totalQuantity: number;
  estimatedTotalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tenorio_quote_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('tenorio_quote_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<QuoteCartItem, 'id'>) => {
    let unitPrice = item.unitPrice || 0;
    let totalPrice = item.totalPrice || 0;

    if (!totalPrice || totalPrice === 0) {
      if (item.sizes && Object.keys(item.sizes).length > 0) {
        const detailed = calculateDetailedProductPrice(item.sizes, item.pricingTiers, item.basePrice);
        unitPrice = detailed.averageUnitPrice;
        totalPrice = detailed.totalPrice;
      } else {
        const pricing = calculateProductPrice(item.quantity, item.pricingTiers as any, item.basePrice);
        unitPrice = pricing.unitPrice;
        totalPrice = pricing.total;
      }
    }

    const newItem: QuoteCartItem = {
      ...item,
      unitPrice,
      totalPrice,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    };
    setItems((prev) => [...prev, newItem]);
    setIsDrawerOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // Scale sizes proportionally if single size or adjust
        let unitPrice = item.unitPrice || 0;
        let totalPrice = unitPrice * newQty;

        if (item.pricingTiers) {
          const pricing = calculateProductPrice(newQty, item.pricingTiers as any, item.basePrice);
          if (pricing.hasTiers) {
            unitPrice = pricing.unitPrice;
            totalPrice = unitPrice * newQty;
          }
        }

        return {
          ...item,
          quantity: newQty,
          unitPrice,
          totalPrice,
        };
      })
    );
  };

  const updateItem = (id: string, updated: Partial<QuoteCartItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextItem = { ...item, ...updated };

        let unitPrice = nextItem.unitPrice || 0;
        let totalPrice = unitPrice * nextItem.quantity;

        if (nextItem.sizes && Object.keys(nextItem.sizes).length > 0) {
          const detailed = calculateDetailedProductPrice(nextItem.sizes, nextItem.pricingTiers, nextItem.basePrice);
          if (detailed.hasPricing) {
            unitPrice = detailed.averageUnitPrice;
            totalPrice = detailed.totalPrice;
          }
        }

        return {
          ...nextItem,
          unitPrice,
          totalPrice,
        };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedTotalPrice = items.reduce(
    (sum, item) => sum + (item.totalPrice || (item.unitPrice ? item.unitPrice * item.quantity : 0)),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateItem,
        clearCart,
        isDrawerOpen,
        setIsDrawerOpen,
        totalQuantity,
        estimatedTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useQuoteCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useQuoteCart must be used within a CartProvider');
  }
  return context;
}
