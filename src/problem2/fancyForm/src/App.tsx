import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useSwapStore from "./stores/token.store";
import Select, { StylesConfig } from "react-select";
import React from "react";

interface SwapFormInputs {
  inputAmount: number;
  outputAmount: number;
  fromCurrency: string;
  toCurrency: string;
}

const initialState = {
  inputAmount: 0,
  outputAmount: 0,
  fromCurrency: "",
  toCurrency: "",
};

interface StyleOption {
  value: string;
  label: React.JSX.Element;
}

const customStyles: StylesConfig<StyleOption, false> = {
  control: (provided, state) => ({
    ...provided,
    width: "100%",
    padding: "6px",
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
    boxShadow: state.isFocused ? "0 0 0 2px #3B82F6" : "none",
    "&:hover": {
      borderColor: "#3B82F6",
    },
  }),
};

function App() {
  const { register, handleSubmit, setValue, watch, reset } =
    useForm<SwapFormInputs>({
      defaultValues: initialState,
    });
  const { tokens, fetchPrices } = useSwapStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const inputAmount = watch("inputAmount");
  const fromCurrency = watch("fromCurrency");
  const toCurrency = watch("toCurrency");
  
  const disabledButton =
    loading || !toCurrency || !fromCurrency || inputAmount <= 0;

  useEffect(() => {
    if (fromCurrency && toCurrency && inputAmount > 0) {
      const fromRate = tokens[fromCurrency]?.price || 1;
      const toRate = tokens[toCurrency]?.price || 1;
      const exchangeRate = toRate / fromRate;
      setValue(
        "outputAmount",
        parseFloat((inputAmount * exchangeRate).toFixed(2))
      );
    }
  }, [inputAmount, fromCurrency, toCurrency, setValue, tokens]);

  const onSubmit: SubmitHandler<SwapFormInputs> = (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(
        `Swap ${data.inputAmount} ${data.fromCurrency} into ${data.outputAmount} ${data.toCurrency} successfully!`
      );
      reset(initialState);
      setValue("fromCurrency", "");
      setValue("toCurrency", "");
    }, 2000);
  };

  const tokenOptions = useMemo(
    () =>
      Object.entries(tokens).map(([currency, data]) => ({
        value: currency,
        label: (
          <div className="flex items-center gap-2">
            <img src={data.icon} alt={currency} className="w-5 h-5" />
            {currency}
          </div>
        ),
      })),
    [tokens]
  );

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-200 flex flex-col gap-2"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Currency Swap
        </h2>

        {/* Select Currency to Swap */}
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Select Currency to Swap
        </label>

        <Select
          options={tokenOptions}
          onChange={(selected) =>
            setValue("fromCurrency", selected?.value || "")
          }
          value={
            tokenOptions.find((option) => option.value === fromCurrency) || null
          }
          isSearchable
          styles={customStyles}
        />

        {/* Amount to Send */}
        <label className="block text-gray-700 mb-2">Amount to Send</label>
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("inputAmount", { valueAsNumber: true })}
          placeholder="Enter amount"
        />

        {/* Select Currency to Swap To */}
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Select Currency to Swap To
        </label>
        <Select
          options={tokenOptions.filter(
            (option) => option.value !== fromCurrency
          )}
          onChange={(selected) => setValue("toCurrency", selected?.value || "")}
          isSearchable
          styles={customStyles}
          value={
            tokenOptions.find((option) => option.value === toCurrency) || null
          }
        />

        {/* Amount to Receive */}
        <label className="block text-gray-700 mb-2">Amount to Receive</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg mb-6 bg-gray-100 focus:outline-none"
          {...register("outputAmount")}
          readOnly
        />

        {/* Confirm Swap Button */}
        <button
          type="submit"
          className={`w-full text-white p-3 rounded-lg font-semibold transition-all ${
            disabledButton
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={disabledButton}
        >
          {loading ? "Swapping..." : "Confirm Swap"}
        </button>
      </form>
    </div>
  );
}

export default App;
