import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useSwapStore from "./stores/token.store";
import { cn } from "./utils";
import SelectInput from "./components/Select";

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
      alert(
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-200 flex flex-col gap-3"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Currency Swap
        </h2>

        <div className="flex flex-col gap-1">
          <SelectInput
            options={tokenOptions.filter(
              (option) => option.value !== toCurrency
            )}
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
        </div>

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

        <div className="flex flex-col gap-1">
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
        </div>

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
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  width={16}
                  height={16}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
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
