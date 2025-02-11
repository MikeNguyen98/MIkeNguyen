import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useSwapStore from "./stores/token.store";
import { cn } from "./utils";
import SelectInput from "./components/Select";
import Loading from "./components/Loading";
import { ToastContainer, toast } from "react-toastify";

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

function App() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SwapFormInputs>({
    defaultValues: initialState,
    mode: "all",
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
    loading ||
    !toCurrency ||
    !fromCurrency ||
    inputAmount < 0.1 ||
    Object(errors).length > 0;

  useEffect(() => {
    if (fromCurrency && toCurrency && inputAmount >= 0.1) {
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
    if (!data.fromCurrency) {
      setError("fromCurrency", {
        type: "manual",
        message: "Select a currency!",
      });
      return;
    }
    if (!data.toCurrency) {
      setError("toCurrency", { type: "manual", message: "Select a currency!" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast(
        `Swap ${data.inputAmount} ${data.fromCurrency} into ${data.outputAmount} ${data.toCurrency} successfully!`
      );
      reset(initialState);
      setValue("fromCurrency", "");
      setValue("toCurrency", "");
      clearErrors();
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
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-200 flex flex-col gap-3"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Currency Swap
        </h2>

        <SelectInput
          options={tokenOptions.filter((option) => option.value !== toCurrency)}
          onChange={(selected) => {
            setValue("fromCurrency", selected || "");
            clearErrors("fromCurrency");
          }}
          onMenuClose={() =>
            !fromCurrency &&
            setError("fromCurrency", {
              type: "manual",
              message: "This field is required!",
            })
          }
          value={fromCurrency}
          isClearable
          isSearchable
          label={"Select Currency to Swap"}
          error={errors.fromCurrency && errors.fromCurrency.message}
        />

        {/* Amount to Send */}
        <div className="flex flex-col gap-1">
          <label className="block text-gray-700">Amount to Send</label>
          <input
            className={cn(
              "w-full p-3 border border-gray-300 rounded-lg focus:outline-none ",
              errors.inputAmount
                ? "border-red-500 !focus:border-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-blue-500"
            )}
            placeholder="Enter amount"
            {...register("inputAmount", {
              valueAsNumber: true,
              required: true,
              min: { value: 0.1, message: "Minimum amount is 0.1" },
            })}
          />
          {errors.inputAmount && (
            <p className="text-red-500 text-sm">{errors.inputAmount.message}</p>
          )}
        </div>

        {/* Select Currency to Swap To */}
        <SelectInput
          options={tokenOptions.filter(
            (option) => option.value !== fromCurrency
          )}
          onChange={(selected) => {
            setValue("toCurrency", selected || "");
            clearErrors("toCurrency");
          }}
          onMenuClose={() =>
            !toCurrency &&
            setError("toCurrency", {
              type: "manual",
              message: "This field is required!",
            })
          }
          value={toCurrency}
          isClearable
          isSearchable
          label={"Select Currency to Swap to"}
          error={errors.toCurrency && errors.toCurrency.message}
        />

        {/* Amount to Receive */}
        <label className="block text-gray-700">Amount to Receive</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg mb-6 bg-gray-100 focus:outline-none"
          {...register("outputAmount", {
            valueAsNumber: true,
            required: "This field is required!",
          })}
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
          {loading ? (
            <div className="flex items-center justify-center gap-2.5">
              <Loading />
              Swapping...
            </div>
          ) : (
            "Confirm Swap"
          )}
        </button>
      </form>
    </div>
  );
}

export default App;
