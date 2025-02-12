/* 
  Time complexity: O(n)
  Space complexity: O(n)
  */
var sum_to_n_a = function (n: number): number {
  // your code here
  if (n === 1) {
    return 1;
  }
  return n + sum_to_n_a(n - 1);
};

/* 
  Time complexity: O(n)
  Space complexity: O(1)
  */
var sum_to_n_b = function (n: number): number {
  // your code here
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/* 
  Time complexity: O(1)
  Space complexity: O(1)
  */
var sum_to_n_c = function (n: number): number {
  // your code here
  return (n * (n + 1)) / 2;
};
