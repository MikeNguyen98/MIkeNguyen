# React Code Inefficiencies and Refactor Guide

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (lhsPriority > -99) {
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};
```

## Identified Issues and Fixes

### 1. **Undefined Interface value (`blockchain`)**

- **Issue:** The interface missing `blockchain`.
- **Fix:** Add `blockchain` to interface. Or maybe the blockchain here is currency then replace `balance.blockchain` with `balance.currency`

### 2. **Undefined Variable (`lhsPriority` Should Be `balancePriority`)**

- **Issue:** The code uses `lhsPriority`, which is not defined.
- **Fix:** Replace `lhsPriority` with `balancePriority`.

### 3. **Incorrect Filtering Logic**

- **Issue:** The filter condition allows balances with `amount <= 0` to be included, which is likely incorrect.
- **Impact:** The final array will show all blockchains with amount equal 0
- **Fix:** Change the condition to `balance.amount > 0` to only keep positive balances.

### 4. **Unnecessary Dependency in `useMemo`**

- **Issue:** `prices` is included in the dependency array of `useMemo`, but it is not used inside.
- **Impact:** Unnecessary dependencies cause the memoized value to recompute unnecessarily, impacting performance
- **Fix:** Remove `prices` from the dependency array.

### 5. **Inefficient Sorting Logic**

- **Issue:** The sorting function lacks an explicit return of `0` for equal priorities.
- **Fix:** Ensure sorting logic handles `leftPriority === rightPriority` correctly.

### 6. **Lack of Proper Type Safety (any in getPriority)**

- **Issue:** Using any removes TypeScript’s type safety.
- **Fix:** Use explicit string type or a union type for known values.

### 7. No useCallback for getPriority (Unnecessary Re-Creation on Renders)

- **Issue:** getPriority is re-created on every render, which is inefficient.
- **Fix:** Wrap getPriority in useCallback.

### 8. **Hardcoded Sorting Priorities Instead of a Lookup Table**

- **Issue:** The `getPriority` function uses multiple `case` statements, which is verbose.
- **Fix:** Use a dictionary (`Record<string, number>`) for cleaner and more maintainable code.

### 9. **Repeated `.map()` Calls Leading to Redundant Computations and unused `formattedBalances`**

- **Issue:** The `.map()` function is applied twice—once for `formattedBalances` and once for `rows`, causing unnecessary computations. The `formattedBalances` array is created but never used in rendering and overuse map() while you can write `balance.amount.toFixed()`.
- **Fix:** Delete `formattedBalances`, replace `balance.formatted` to `balance.amount.toFixed()`.

### 10. **Inefficient and Potentially Duplicate React List Keys**

- **Issue:** Using `index` alone as the `key` can cause issues when the list updates dynamically.
- **Fix:** Use ``${balance.currency}-${index}` instead for a more stable key.

### 11. **Potential Crash When Accessing prices[balance.currency]**

- **Issue:** The `const usdValue = prices[balance.currency] * balance.amount;` If prices[balance.currency] is undefined, it will throw a NaN result or crash.
- **Fix:** Add a fallback value to prevent unexpected errorse.

### 12. **Missing CSS Import (`classes.row`)**

- **Issue:** The `className={classes.row}` usage suggests missing CSS imports.
- **Fix:** Ensure `classes` is imported properly from a CSS/SCSS module.

### 13 **Remove children Destructure in Props**

- **Issue:** The component does not use children, so destructuring it is unnecessary.
- **Fix:**  Remove const { children, ...rest } = props; and just use props.

## Refactored Code

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = useCallback((blockchain: string): number => {
    const priorities: Record<string, number> = {
      Osmosis: 100,
      Ethereum: 50,
      Arbitrum: 30,
      Zilliqa: 20,
      Neo: 20,
    };
    return priorities[blockchain] ?? -99;
  }, []);

  const sortedBalances = useMemo(() => {
    return balances
      .filter(
        (balance: WalletBalance) =>
          getPriority(balance.currency) > -99 && balance.amount > 0
      )
      .sort((lhs, rhs) => {
        const leftPriority = getPriority(lhs.currency);
        const rightPriority = getPriority(rhs.currency);
        return rightPriority - leftPriority
      });
  }, [balances]);

  const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
    const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
    return (
      <WalletRow
        key={`${balance.currency}-${index}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed()}
      />
    );
  });

  return <div {...props}>{rows}</div>;
};
```