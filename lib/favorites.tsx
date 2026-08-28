'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface FavoritesContextType {
  favoritePrints: string[];
  favoriteProducts: string[];
  toggleFavoritePrint: (code: string) => void;
  toggleFavoriteProduct: (id: string) => void;
  isPrintFavorite: (code: string) => boolean;
  isProductFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoritePrints, setFavoritePrints] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedPrints = localStorage.getItem('tenorio_fav_prints');
      const savedProducts = localStorage.getItem('tenorio_fav_products');
      if (savedPrints) setFavoritePrints(JSON.parse(savedPrints));
      if (savedProducts) setFavoriteProducts(JSON.parse(savedProducts));
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('tenorio_fav_prints', JSON.stringify(favoritePrints));
        localStorage.setItem('tenorio_fav_products', JSON.stringify(favoriteProducts));
      } catch (e) {
        console.error(e);
      }
    }
  }, [favoritePrints, favoriteProducts, isLoaded]);

  const toggleFavoritePrint = (code: string) => {
    setFavoritePrints((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleFavoriteProduct = (id: string) => {
    setFavoriteProducts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isPrintFavorite = (code: string) => favoritePrints.includes(code);
  const isProductFavorite = (id: string) => favoriteProducts.includes(id);

  return (
    <FavoritesContext.Provider
      value={{
        favoritePrints,
        favoriteProducts,
        toggleFavoritePrint,
        toggleFavoriteProduct,
        isPrintFavorite,
        isProductFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
