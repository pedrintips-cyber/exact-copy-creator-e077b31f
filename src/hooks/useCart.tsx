import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export interface CartOptionItem {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface CartSelection {
  groupId: string;
  groupName: string;
  items: CartOptionItem[];
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  basePrice: number;
  quantity: number;
  selections: CartSelection[];
  unitPrice: number;
  totalPrice: number;
}

interface AddCartItemInput {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  basePrice: number;
  quantity: number;
  selections: CartSelection[];
}

interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  addItem: (item: AddCartItemInput) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = "pizza-house-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

const getSelectionPrice = (selections: CartSelection[]) =>
  selections.reduce(
    (total, selection) =>
      total + selection.items.reduce((sum, item) => sum + Number(item.priceAdjustment || 0), 0),
    0,
  );

const recalculateItem = (item: Omit<CartItem, "unitPrice" | "totalPrice">): CartItem => {
  const unitPrice = Number(item.basePrice) + getSelectionPrice(item.selections);

  return {
    ...item,
    unitPrice,
    totalPrice: unitPrice * item.quantity,
  };
};

const createCartId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as Omit<CartItem, "unitPrice" | "totalPrice">[];
      setItems(parsed.map(recalculateItem));
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextType>(() => {
    const itemsCount = items.reduce((count, item) => count + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.totalPrice, 0);

    return {
      items,
      itemsCount,
      subtotal,
      addItem: (item) => {
        setItems((current) => [
          ...current,
          recalculateItem({
            ...item,
            id: createCartId(),
          }),
        ]);
      },
      updateQuantity: (id, quantity) => {
        setItems((current) =>
          current
            .map((item) =>
              item.id === id ? recalculateItem({ ...item, quantity: Math.max(0, quantity) }) : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem: (id) => {
        setItems((current) => current.filter((item) => item.id !== id));
      },
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
};