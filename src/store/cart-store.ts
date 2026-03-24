import { create } from 'zustand';

import type { CartItem, CartProductInput, ManualCartItemInput } from '@/types/models';

type CartState = {
  addConfiguredProduct: (input: CartProductInput) => void;
  addManualItem: (input: ManualCartItemInput) => void;
  clear: () => void;
  decrementItem: (cartItemId: string) => void;
  incrementItem: (cartItemId: string) => void;
  itemCount: number;
  items: CartItem[];
  removeItem: (cartItemId: string) => void;
  subtotal: number;
};

function recalculate(items: CartItem[]) {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return { itemCount, subtotal };
}

function buildProductSignature(input: CartProductInput) {
  const modifierIds = [...input.modifiers].map((modifier) => modifier.modifierId).sort().join(',');
  return `product:${input.productId}:${modifierIds}`;
}

function buildManualId() {
  return `manual:${Date.now()}:${Math.random().toString(16).slice(2, 8)}`;
}

export const useCartStore = create<CartState>((set) => ({
  ...recalculate([]),
  items: [],

  addConfiguredProduct(input) {
    set((state) => {
      const signature = buildProductSignature(input);
      const existing = state.items.find((item) => item.signature === signature);
      const modifierTotal = input.modifiers.reduce((total, modifier) => total + modifier.price, 0);

      const nextItems = existing
        ? state.items.map((item) =>
            item.signature === signature ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [
            ...state.items,
            {
              id: signature,
              imageUrl: input.imageUrl,
              kind: 'product' as const,
              modifiers: input.modifiers,
              name: input.name,
              price: input.price + modifierTotal,
              productId: input.productId,
              quantity: 1,
              signature,
            },
          ];

      return {
        ...recalculate(nextItems),
        items: nextItems,
      };
    });
  },

  addManualItem(input) {
    set((state) => {
      const id = buildManualId();
      const nextItems = [
        ...state.items,
        {
          id,
          kind: 'manual' as const,
          modifiers: [],
          name: input.name,
          price: input.price,
          productId: null,
          quantity: input.quantity ?? 1,
          signature: id,
        },
      ];

      return {
        ...recalculate(nextItems),
        items: nextItems,
      };
    });
  },

  clear() {
    set({
      ...recalculate([]),
      items: [],
    });
  },

  decrementItem(cartItemId) {
    set((state) => {
      const nextItems = state.items
        .map((item) => (item.id === cartItemId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0);

      return {
        ...recalculate(nextItems),
        items: nextItems,
      };
    });
  },

  incrementItem(cartItemId) {
    set((state) => {
      const nextItems = state.items.map((item) =>
        item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
      );

      return {
        ...recalculate(nextItems),
        items: nextItems,
      };
    });
  },

  removeItem(cartItemId) {
    set((state) => {
      const nextItems = state.items.filter((item) => item.id !== cartItemId);

      return {
        ...recalculate(nextItems),
        items: nextItems,
      };
    });
  },
}));
