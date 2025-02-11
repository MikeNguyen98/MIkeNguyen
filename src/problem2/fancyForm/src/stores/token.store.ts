import axios from "axios";
import { create } from "zustand";

interface SwapStore {
  tokens: Record<string, TokenData>;
  fetchPrices: () => Promise<void>;
}

const useSwapStore = create<SwapStore>((set) => ({
  tokens: {},
  fetchPrices: async () => {
    try {
      const { data } = await axios.get<TokenPrice[]>(
        "https://interview.switcheo.com/prices.json"
      );

      set({
        tokens: data.reduce((acc, token) => {
          acc[token.currency] = {
            price: token.price,
            icon: `https://raw.githubusercontent.com/Switcheo/token-icons/refs/heads/main/tokens/${token.currency}.svg`,
          };
          return acc;
        }, {} as Record<string, TokenData>),
      });
    } catch (error) {
      console.error("Error fetching token prices", error);
    }
  },
}));

export default useSwapStore;
