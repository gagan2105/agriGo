import { configureStore, createSlice } from '@reduxjs/toolkit';

// Cart Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('cart') || '[]'),
  },
  reducers: {
    addToCart: (state, action) => {
      const { crop, quantity } = action.payload;
      const existing = state.items.find((item) => item.crop.id === crop.id);
      
      if (existing) {
        existing.quantity = Math.min(crop.quantity, existing.quantity + quantity);
      } else {
        state.items.push({ crop, quantity });
      }
      
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { cropId, quantity } = action.payload;
      const existing = state.items.find((item) => item.crop.id === cropId);
      if (existing) {
        existing.quantity = quantity;
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const cropId = action.payload;
      state.items = state.items.filter((item) => item.crop.id !== cropId);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
});
